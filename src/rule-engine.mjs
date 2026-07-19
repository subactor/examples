function valueAt(source,path){return String(path||"").split(".").filter(Boolean).reduce((value,key)=>value?.[key],source);}

function ruleFails(rule,facts){
  const actual=valueAt(facts,rule.field);
  if(rule.operator==="present") return actual==null||actual==="";
  if(actual==null) return false;
  if(rule.operator==="eq") return actual!==rule.value;
  if(rule.operator==="lt") return !(Number(actual)<Number(rule.value));
  if(rule.operator==="lte") return !(Number(actual)<=Number(rule.value));
  if(rule.operator==="gt") return !(Number(actual)>Number(rule.value));
  if(rule.operator==="gte") return !(Number(actual)>=Number(rule.value));
  if(rule.operator==="in") return !Array.isArray(rule.value)||!rule.value.includes(actual);
  throw new Error(`unsupported_rule_operator:${rule.operator}`);
}

export function evaluatePolicy(policy,facts={}){
  const missing=(policy.required_facts||[]).filter((field)=>valueAt(facts,field)==null);
  const reasons=[];
  if(missing.length) reasons.push(policy.missing_reason||"facts_incomplete");
  for(const rule of policy.rules||[]) if(ruleFails(rule,facts)) reasons.push(rule.reason);
  return {ok:reasons.length===0,policy_id:policy.id,missing,reasons,evidence_required:policy.evidence_required||[]};
}
