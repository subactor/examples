export function measurePressure({elapsed_minutes=0,sla_minutes=60,signals={},weights={},thresholds={email:30,deputy:55,continuity:80},...legacy}={}){
  const normalized={...signals};
  for(const [name,value] of Object.entries(legacy)) if(name.endsWith("_risk")||name.endsWith("_impact")) normalized[name]=value;
  const time=Math.min(40,Math.round((Number(elapsed_minutes)/Math.max(1,Number(sla_minutes)))*40));
  const signalScore=Object.entries(normalized).reduce((sum,[name,value])=>sum+Number(value||0)*Number(weights?.[name]??({revenue_risk:25,candidate_impact:20,security_risk:30}[name]??25)),0);
  const score=Math.min(100,time+signalScore);
  const level=score>=thresholds.continuity?"critical":score>=thresholds.deputy?"high":score>=thresholds.email?"medium":"low";
  const strategy=level==="critical"?"quorum_and_external_provider":level==="high"?"email_and_deputy":level==="medium"?"email_reminder":"monitor";
  return {score,level,strategy,signals:{elapsed_minutes,sla_minutes,...normalized}};
}
