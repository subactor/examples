import {readFileSync} from "node:fs";
import {evaluatePressurePolicy, parsePressurePolicy} from "../../runtime/src/eql-pressure-runtime.mjs";

const source = readFileSync(new URL("../dsl/company-escalation-pressure.eql", import.meta.url), "utf8");
export const companyPressurePolicy = parsePressurePolicy(source);

export function measurePressure({elapsed_minutes = 0, sla_minutes = 60, signals = {}} = {}) {
  const context = {elapsed_minutes, sla_minutes, signals};
  return {...evaluatePressurePolicy(companyPressurePolicy, context), context};
}
