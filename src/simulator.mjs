import {resolveBlocker} from "../../orchestrator/src/index.mjs";
import {evaluateLegalPolicy,validateEngagement} from "./policy-engine.mjs";
import {loadJurisdiction,loadOrganization,loadScenario} from "./load-config.mjs";

function resolutionConfig(organization) {
  return {
    authority_graph:organization.authority_graph,
    human_capability_registry:{providers:organization.providers || []},
    continuity_budgets:organization.continuity_budgets || {},
  };
}

export async function simulateScenario(input,{now}={}) {
  const scenario=typeof input==="string"?await loadScenario(input):structuredClone(input);
  const jurisdiction=await loadJurisdiction(scenario.jurisdiction);
  const organization=await loadOrganization(scenario.organization || "demo-global");
  const at=now || new Date(scenario.now || Date.now());
  const engagement=validateEngagement(jurisdiction,scenario);
  const policy=evaluateLegalPolicy(jurisdiction,scenario,at);

  if (!engagement.valid) {
    policy.decision="authorized_human";
    policy.reason_code="engagement_facts_incomplete";
    policy.required_capabilities=["legal.employment.classify"];
    policy.required_evidence=engagement.missing;
  }

  if (policy.decision === "autonomous") {
    return {
      scenario_id:scenario.id,jurisdiction:jurisdiction.id,engagement,policy,
      task_state:"executing",platform_mode:"normal",continue_unblocked:true,
      executor:scenario.requested_actor || "bot:operations",
    };
  }

  const blocker={
    task_id:scenario.id,
    reason_code:policy.decision === "prohibited" ? "legally_impossible" : policy.reason_code,
    required_capabilities:policy.required_capabilities,
    attempts:scenario.attempts || [],
    active_mandates:scenario.active_mandates || organization.active_mandates,
    presence:scenario.presence || {},
    jurisdiction:jurisdiction.country_code,
    category:scenario.budget_category || "legal_continuity",
    estimated_cost_eur:scenario.estimated_cost_eur || 0,
    event_spent_eur:scenario.event_spent_eur || 0,
    monthly_spent_eur:scenario.monthly_spent_eur || 0,
    now:at,
  };
  const resolution=resolveBlocker(blocker,resolutionConfig(organization));
  return {scenario_id:scenario.id,jurisdiction:jurisdiction.id,engagement,policy,...resolution};
}
