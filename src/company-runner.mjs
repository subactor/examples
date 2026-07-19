import {readJson} from "./load-config.mjs";
import {createConfiguredConnector} from "./configured-connector.mjs";
import {evaluatePolicy} from "./rule-engine.mjs";
import {runWorkflow} from "./workflow-runner.mjs";

export async function createMockCompanyConnector(overrides={}){
  const [mock,legalPolicy]=await Promise.all([
    readJson("config/fixtures/company-connector-responses.json"),
    readJson("config/policies/pl-graduate-practice.json"),
  ]);
  return createConfiguredConnector({routes:mock.routes,overrides,evaluators:{
    rules:({fixture,descriptor})=>evaluatePolicy(legalPolicy,descriptor.facts_path.split(".").reduce((value,key)=>value?.[key],fixture)),
  }});
}

export async function runCompanyProcess({fixture,connector,process,failurePolicy}={}){
  const [input,definition,policy]=await Promise.all([
    fixture||readJson("config/fixtures/company-success.json"),
    process||readJson("config/company-process.json"),
    failurePolicy||readJson("config/escalation-policy.json"),
  ]);
  const adapter=connector||await createMockCompanyConnector();
  const result=await runWorkflow({definition,fixture:input,adapter,failurePolicy:policy});
  return {...result,departments:result.groups};
}
