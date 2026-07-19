#!/usr/bin/env node
import {simulateScenario} from "../src/simulator.mjs";

const id=process.argv[2];
if(!id){console.error("usage: npm run scenario -- <scenario-id>");process.exitCode=2;}
else {
  try {console.log(JSON.stringify(await simulateScenario(id),null,2));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
