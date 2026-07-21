import {measurePressure} from "./eql-pressure.mjs";

export function orderSteps(steps){
  const pending=[...steps],done=new Set(),ordered=[];
  while(pending.length){
    const index=pending.findIndex((step)=>(step.depends_on||[]).every((id)=>done.has(id)));
    if(index<0) throw new Error("workflow_dependency_cycle");
    const [step]=pending.splice(index,1);ordered.push(step);done.add(step.id);
  }
  return ordered;
}

function failureRoute(step,policy){
  const labels=new Set(step.labels||[]);
  const rule=(policy.routes||[]).find((item)=>(item.labels_any||[]).some((label)=>labels.has(label)));
  return {...policy.default_route,...rule};
}

function failureSignals(step,policy){
  const labels=new Set(step.labels||[]),signals={};
  for(const [name,labelsForSignal] of Object.entries(policy.signal_labels||{})) signals[name]=(labelsForSignal||[]).some((label)=>labels.has(label))?1:0;
  return signals;
}

function buildEscalation(step,response,failurePolicy,ticketNumber){
  const route=failureRoute(step,failurePolicy);
  const pressure=measurePressure({elapsed_minutes:failurePolicy.sample_elapsed_minutes||65,sla_minutes:route.sla_minutes||failurePolicy.sla_minutes||60,signals:failureSignals(step,failurePolicy)});
  const ticket={id:`AUTO-${ticketNumber}`,owner:route.owner,step:step.id,reason:response?.error||response?.reasons?.[0]||"blocked",state:"resolving",pressure};
  const escalation={ticket_id:ticket.id,channels:route.channels||[],substitute_after_sla:route.substitute_after_sla,pressure};
  return {ticket,escalation};
}

function summarizeGroups(results){
  const groups=[...new Set(results.map((item)=>item.group))];
  return Object.fromEntries(groups.map((group)=>[group,{completed:results.filter((item)=>item.group===group&&item.ok).length,blocked:results.filter((item)=>item.group===group&&!item.ok).length}]));
}

export async function runWorkflow({definition,fixture,adapter,failurePolicy={}}){
  const results=[],outcomes=new Map(),tickets=[],escalations=[];
  for(const step of orderSteps(definition.steps||[])){
    const failed=(step.depends_on||[]).filter((id)=>outcomes.get(id)?.ok!==true);
    const group=step.group||step.department||"default";
    if(failed.length){
      const entry={step:step.id,group,uri:step.uri,ok:false,status:"skipped_dependency",failed_dependencies:failed};
      results.push(entry);outcomes.set(step.id,entry);continue;
    }
    const response=await adapter.run(step,{fixture,results});
    const ok=response?.ok===true;
    const entry={step:step.id,group,uri:step.uri,ok,status:ok?"completed":"blocked",response};
    results.push(entry);outcomes.set(step.id,entry);
    if(!ok){
      const {ticket,escalation}=buildEscalation(step,response,failurePolicy,tickets.length+1);
      tickets.push(ticket);
      escalations.push(escalation);
    }
  }
  const blocked=results.filter((item)=>!item.ok&&item.status==="blocked");
  return {ok:blocked.length===0,process_id:definition.id,platform_mode:blocked.length?"degraded":"normal",continue_unblocked:true,results,tickets,escalations,calls:adapter.calls,groups:summarizeGroups(results)};
}
