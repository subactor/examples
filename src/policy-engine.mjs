function matches(actual, expected) {
  if (Array.isArray(expected)) return expected.includes(actual);
  if (expected && typeof expected === "object") {
    if ("present" in expected) return expected.present ? actual != null : actual == null;
    if ("equals" in expected) return actual === expected.equals;
  }
  return actual === expected;
}

function ruleMatches(rule, facts) {
  return Object.entries(rule.when || {}).every(([key,value])=>matches(facts[key],value));
}

export function evaluateLegalPolicy(jurisdiction, scenario, now=new Date()) {
  const effectiveRules=(jurisdiction.rules || []).filter((rule)=>{
    if (rule.effective_from && now < new Date(rule.effective_from)) return false;
    if (rule.effective_until && now >= new Date(rule.effective_until)) return false;
    return ruleMatches(rule,scenario.facts || {});
  });
  const ranked=[...effectiveRules].sort((a,b)=>Number(b.priority || 0)-Number(a.priority || 0));
  const rule=ranked[0] || jurisdiction.default_rule;
  if (!rule) throw new Error(`jurisdiction_policy_no_match:${jurisdiction.id}`);
  return {
    jurisdiction:jurisdiction.id,
    rule_id:rule.id,
    decision:rule.decision,
    reason_code:rule.reason_code,
    required_capabilities:rule.required_capabilities || [],
    required_evidence:rule.required_evidence || [],
    legal_sources:rule.legal_sources || [],
    notes:rule.notes || [],
  };
}

export function validateEngagement(jurisdiction, scenario) {
  const contract=scenario.facts?.contract_type;
  const profile=jurisdiction.contract_types?.[contract];
  if (!profile) return {valid:false,reason:"contract_type_not_supported"};
  const missing=(profile.required_facts || []).filter((field)=>scenario.facts?.[field] == null);
  return {valid:missing.length===0,missing,profile};
}
