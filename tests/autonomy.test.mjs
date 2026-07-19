import test from "node:test";
import assert from "node:assert/strict";
import {simulateScenario} from "../src/simulator.mjs";
import {listScenarios,loadJurisdiction,readJson} from "../src/load-config.mjs";

test("founder outage activates only a pre-mandated deputy",async()=>{
  const result=await simulateScenario("pl-founder-unavailable");
  assert.equal(result.authority.actor,"human:deputy-founder");
  assert.equal(result.task_state,"executing");
  assert.equal(result.continue_unblocked,true);
});

test("one missed e-mail does not displace founder",async()=>{
  const result=await simulateScenario("pl-one-missed-email");
  assert.equal(result.authority.actor,"human:founder");
});

test("German monitoring routes to works council capability",async()=>{
  const result=await simulateScenario("de-worker-monitoring");
  assert.equal(result.policy.rule_id,"de-monitoring-codetermination");
  assert.equal(result.provider.provider.id,"provider:de-works-council");
  assert.equal(result.task_state,"outsourcing");
});

test("German agency work without required permit fails the operation, not the platform",async()=>{
  const result=await simulateScenario("de-agency-without-permit");
  assert.equal(result.policy.reason_code,"agency_permit_missing");
  assert.equal(result.task_state,"legally_impossible");
  assert.equal(result.platform_mode,"continuity");
  assert.equal(result.continue_unblocked,true);
});

test("UK significant automated termination obtains meaningful human capability",async()=>{
  const result=await simulateScenario("uk-automated-termination");
  assert.equal(result.policy.rule_id,"uk-significant-adm-safeguards");
  assert.equal(result.provider.provider.id,"provider:uk-hr-authority");
});

test("UK contractor label cannot override relationship reality",async()=>{
  const result=await simulateScenario("uk-contractor-reality-check");
  assert.equal(result.policy.reason_code,"worker_status_review");
  assert.equal(result.provider.provider.id,"provider:uk-legal");
});

test("California ABC fixture failure routes to classification counsel",async()=>{
  const result=await simulateScenario("ca-contractor-abc-fail");
  assert.equal(result.policy.reason_code,"contractor_classification_failed");
  assert.equal(result.provider.provider.id,"provider:ca-legal");
});

test("California ABC pass fixture permits scoped contractor work order",async()=>{
  const result=await simulateScenario("ca-contractor-abc-pass");
  assert.equal(result.policy.rule_id,"ca-contractor-eligible");
  assert.equal(result.task_state,"executing");
});

test("director title without corporate appointment cannot create authority",async()=>{
  const result=await simulateScenario("uk-director-without-appointment");
  assert.equal(result.policy.reason_code,"corporate_appointment_missing");
  assert.equal(result.task_state,"legally_impossible");
  assert.equal(result.continue_unblocked,true);
});

test("German B2B relationship inconsistent in practice routes to classification",async()=>{
  const result=await simulateScenario("de-false-self-employment");
  assert.equal(result.policy.rule_id,"de-false-self-employment-risk");
  assert.equal(result.provider.provider.id,"provider:de-legal");
});

test("Polish employee termination uses an authorized human path",async()=>{
  const result=await simulateScenario("pl-employee-termination");
  assert.equal(result.policy.rule_id,"pl-employment-significant-decision");
  assert.equal(result.authority.actor,"human:founder");
  assert.equal(result.task_state,"executing");
});

test("provider SLA failure selects reserve provider",async()=>{
  const result=await simulateScenario("pl-provider-failover");
  assert.equal(result.provider.provider.id,"provider:pl-legal-secondary");
});

test("routine task within an employee role remains autonomous",async()=>{
  const result=await simulateScenario("pl-routine-employee-task");
  assert.equal(result.task_state,"executing");
  assert.equal(result.platform_mode,"normal");
  assert.equal(result.executor,"bot:project-operator");
});

test("every example preserves global continuity and never emits waiting_input",async()=>{
  for(const file of await listScenarios()){
    const result=await simulateScenario(file);
    assert.equal(result.continue_unblocked,true,file);
    assert.notEqual(result.task_state,"waiting_input",file);
    assert.notEqual(result.platform_mode,"paused",file);
  }
});

test("every jurisdiction rule points to a registered official source",async()=>{
  const registry=await readJson("config/legal-sources.json");
  for(const id of ["pl-eu","de-eu","uk","us-ca"]){
    const jurisdiction=await loadJurisdiction(id);
    for(const rule of [...jurisdiction.rules,jurisdiction.default_rule]){
      for(const source of rule.legal_sources || []){
        assert.ok(registry.sources[source],`${id}:${rule.id}:${source}`);
        assert.match(registry.sources[source].url,/^https:\/\//);
      }
    }
  }
});
