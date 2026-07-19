import test from "node:test";
import assert from "node:assert/strict";

import {createConfiguredConnector} from "../src/configured-connector.mjs";
import {runWorkflow} from "../src/workflow-runner.mjs";

test("generic workflow runner executes a non-company domain without code changes",async()=>{
  const definition={id:"laboratory-calibration",steps:[
    {id:"read",group:"measurement",uri:"sensor://meter/value/query/read"},
    {id:"calibrate",group:"quality",uri:"calibration://instrument/command/run",depends_on:["read"]},
  ]};
  const adapter=createConfiguredConnector({routes:{
    "sensor://meter/value/query/read":{response:{ok:true,value:12.3}},
    "calibration://instrument/command/run":{response:{ok:true,certificate:"CAL-1"}},
  }});
  const result=await runWorkflow({definition,fixture:{},adapter,failurePolicy:{default_route:{owner:"human:quality-lead"}}});
  assert.equal(result.ok,true);
  assert.equal(result.groups.quality.completed,1);
});

test("generic runner isolates a blocked branch and derives escalation only from policy labels",async()=>{
  const definition={id:"independent-branches",steps:[
    {id:"a",group:"one",uri:"x://host/a/query/read",labels:["urgent"]},
    {id:"b",group:"two",uri:"x://host/b/query/read"},
    {id:"after-a",group:"one",uri:"x://host/c/command/run",depends_on:["a"]},
  ]};
  const adapter=createConfiguredConnector({routes:{
    "x://host/a/query/read":{response:{ok:false,error:"offline"}},
    "x://host/b/query/read":{response:{ok:true}},
    "x://host/c/command/run":{response:{ok:true}},
  }});
  const result=await runWorkflow({definition,fixture:{},adapter,failurePolicy:{
    default_route:{owner:"human:default",channels:["planfile"]},
    routes:[{labels_any:["urgent"],owner:"provider:reserve",channels:["pager"]}],
  }});
  assert.equal(result.platform_mode,"degraded");
  assert.equal(result.results.find((item)=>item.step==="b").ok,true);
  assert.equal(result.results.find((item)=>item.step==="after-a").status,"skipped_dependency");
  assert.equal(result.tickets[0].owner,"provider:reserve");
});
