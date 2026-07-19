function valueAt(source,path){return String(path||"").split(".").filter(Boolean).reduce((value,key)=>value?.[key],source);}

function expand(value,context){
  if(Array.isArray(value)) return value.map((item)=>expand(item,context));
  if(value&&typeof value==="object") return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,expand(item,context)]));
  if(typeof value!=="string") return value;
  const exact=/^\$\{([^}]+)\}$/.exec(value);
  if(exact) return valueAt(context,exact[1]);
  return value.replace(/\$\{([^}]+)\}/g,(_,path)=>String(valueAt(context,path)??""));
}

export function createConfiguredConnector({routes={},evaluators={},overrides={}}={}){
  let sequence=0;
  const calls=[];
  return {calls,async run(step,context){
    sequence+=1;
    calls.push({sequence,step:step.id,group:step.group||step.department||"default",uri:step.uri});
    const override=overrides[step.id]||overrides[step.uri];
    if(override) return override({...context,step,sequence});
    const descriptor=routes[step.uri];
    if(!descriptor) return {ok:false,error:"connector_route_missing"};
    if(descriptor.evaluator){
      const evaluator=evaluators[descriptor.evaluator];
      if(!evaluator) return {ok:false,error:"connector_evaluator_missing"};
      return evaluator({fixture:context.fixture,step,sequence,descriptor});
    }
    return expand(descriptor.response,{...context,step,sequence});
  }};
}
