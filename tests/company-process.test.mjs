import test from "node:test";
import assert from "node:assert/strict";
import {access,readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {compileContractAql} from "../../runtime/src/contract-aql.mjs";
import {createMockCompanyConnector,runCompanyProcess} from "../src/company-runner.mjs";
import {evaluatePolicy} from "../src/rule-engine.mjs";
import {measurePressure} from "../src/eql-pressure.mjs";
import {ROOT,readJson} from "../src/load-config.mjs";

test("company executes founder order through HR, legal, admin, dev and web",async()=>{
  const result=await runCompanyProcess();
  assert.equal(result.ok,true);
  assert.equal(result.platform_mode,"normal");
  assert.equal(result.continue_unblocked,true);
  for(const department of ["governance","sales","web","admin","hr","legal","dev"]){
    assert.ok(result.departments[department],department);
    assert.equal(result.departments[department].blocked,0,department);
  }
  const ids=result.results.map((item)=>item.step);
  assert.ok(ids.indexOf("esign-status")<ids.indexOf("identity-create"));
  assert.ok(ids.indexOf("identity-create")<ids.indexOf("github-invite"));
  assert.ok(ids.indexOf("github-invite")<ids.indexOf("first-ticket"));
  assert.equal(result.results.find((item)=>item.step==="github-invite").response.permission,"triage");
});

test("Plesk capacity denial creates tickets and keeps HR/legal process running",async()=>{
  const connector=await createMockCompanyConnector({"plesk-preflight":()=>({ok:false,error:"subscription_domain_limit_reached"})});
  const result=await runCompanyProcess({connector});
  assert.equal(result.ok,false);
  assert.equal(result.platform_mode,"degraded");
  assert.equal(result.continue_unblocked,true);
  assert.equal(result.results.find((item)=>item.step==="site-generate").ok,true);
  assert.equal(result.results.find((item)=>item.step==="esign-status").ok,true);
  assert.equal(result.results.find((item)=>item.step==="domain-ensure").status,"skipped_dependency");
  assert.equal(result.tickets[0].owner,"human:operations-lead");
  assert.deepEqual(result.escalations[0].channels,["planfile","email"]);
  assert.equal(result.escalations[0].substitute_after_sla,"human:continuity-officer");
});

test("invalid unpaid practice never reaches contract, identity or GitHub",async()=>{
  const fixture=await readJson("config/fixtures/company-success.json");
  fixture.candidate.age_at_start=31;
  const result=await runCompanyProcess({fixture});
  assert.equal(result.results.find((item)=>item.step==="internship-legal-preflight").ok,false);
  for(const id of ["contract-generate","identity-create","github-invite","first-ticket"]){
    assert.equal(result.results.find((item)=>item.step===id).ok,false,id);
  }
  assert.equal(result.continue_unblocked,true);
});

test("jurisdiction policy evaluation is data-driven and fail closed",async()=>{
  const policy=await readJson("config/policies/pl-graduate-practice.json");
  assert.deepEqual(evaluatePolicy(policy,{}).reasons,["facts_incomplete"]);
  const invalid=evaluatePolicy(policy,{age_at_start:31,minimum_education_complete:true,duration_months:4,written_agreement:false,insurance_confirmed:true,bhp_ready:false});
  assert.deepEqual(invalid.reasons,["age_limit_exceeded","duration_limit_exceeded","written_agreement_missing","bhp_not_ready"]);
});

test("EQL pressure selects stronger escalation without authority expansion",()=>{
  const low=measurePressure({elapsed_minutes:10,sla_minutes:60});
  const critical=measurePressure({elapsed_minutes:120,sla_minutes:60,signals:{financial_impact:1,person_impact:1}});
  assert.equal(low.profile,"eql:pressure-policy/v1");
  assert.equal(low.strategy,"monitor");
  assert.equal(critical.strategy,"quorum_and_external_provider");
  assert.deepEqual(critical.contributions,{elapsed_sla:40,financial_impact:25,person_impact:20,service_impact:0});
  assert.match(critical.policy_fingerprint,/^[a-f0-9]{64}$/);
});

test("company AQL contract compiles under constitutional authority",async()=>{
  const source=await readFile(resolve(ROOT,"dsl/company-operator.contract.aql"),"utf8");
  const result=compileContractAql(source,{now:new Date("2029-01-01T00:00:00Z")});
  assert.equal(result.ok,true,result.error);
  assert.equal(result.validation.reason,"constitutional_authority");
});

test("project manifest maps a real source folder and guarded publication URIs",async()=>{
  const workspaceRoot=resolve(ROOT,"../projekty");
  const bundledRoot=resolve(ROOT,"projects/autonomicznosc-pl");
  let projectRoot=workspaceRoot;
  try{await access(resolve(workspaceRoot,"project.manifest.json"));}catch{projectRoot=bundledRoot;}
  const manifest=JSON.parse(await readFile(resolve(projectRoot,"project.manifest.json"),"utf8"));
  const project=manifest.projects[0];
  assert.equal(project.domain,"autonomicznosc.pl");
  await readFile(resolve(projectRoot,project.source,project.entrypoint),"utf8");
  assert.equal(project.publication.subscription_preflight_uri,"plesk://host/subscription/query/capabilities");
  assert.ok(project.gates.includes("subscription_can_create_domain"));
});
