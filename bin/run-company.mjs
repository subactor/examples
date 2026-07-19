#!/usr/bin/env node
import {runCompanyProcess} from "../src/company-runner.mjs";
console.log(JSON.stringify(await runCompanyProcess(),null,2));
