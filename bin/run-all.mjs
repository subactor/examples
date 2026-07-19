#!/usr/bin/env node
import {listScenarios} from "../src/load-config.mjs";
import {simulateScenario} from "../src/simulator.mjs";

const results=[];
for(const file of await listScenarios()) results.push(await simulateScenario(file));
console.log(JSON.stringify({ok:results.every((r)=>r.continue_unblocked===true),results},null,2));
