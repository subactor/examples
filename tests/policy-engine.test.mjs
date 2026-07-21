import test from "node:test";
import assert from "node:assert/strict";

import {evaluateLegalPolicy, validateEngagement} from "../src/policy-engine.mjs";

function jurisdiction(overrides = {}) {
  return {
    id: "pl",
    rules: [
      {id: "default-rule", priority: 0, decision: "allow", when: {}},
    ],
    ...overrides,
  };
}

test("evaluateLegalPolicy picks the highest-priority matching rule", () => {
  const j = jurisdiction({
    rules: [
      {id: "low", priority: 1, decision: "allow", when: {contract_type: "b2b"}},
      {id: "high", priority: 10, decision: "deny", when: {contract_type: "b2b"}},
    ],
  });
  const result = evaluateLegalPolicy(j, {facts: {contract_type: "b2b"}});
  assert.equal(result.rule_id, "high");
  assert.equal(result.decision, "deny");
});

test("evaluateLegalPolicy excludes a rule before its effective_from date", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const j = jurisdiction({
    rules: [
      {id: "future", priority: 10, decision: "deny", when: {}, effective_from: "2027-01-01T00:00:00Z"},
      {id: "fallback", priority: 0, decision: "allow", when: {}},
    ],
  });
  const result = evaluateLegalPolicy(j, {facts: {}}, now);
  assert.equal(result.rule_id, "fallback");
});

test("evaluateLegalPolicy excludes a rule at/after its effective_until date", () => {
  const now = new Date("2027-01-01T00:00:00Z");
  const j = jurisdiction({
    rules: [
      {id: "expired", priority: 10, decision: "deny", when: {}, effective_until: "2027-01-01T00:00:00Z"},
      {id: "fallback", priority: 0, decision: "allow", when: {}},
    ],
  });
  const result = evaluateLegalPolicy(j, {facts: {}}, now);
  assert.equal(result.rule_id, "fallback");
});

test("evaluateLegalPolicy falls back to default_rule when no rule matches", () => {
  const j = jurisdiction({
    rules: [{id: "no-match", priority: 0, decision: "deny", when: {contract_type: "b2b"}}],
    default_rule: {id: "default", decision: "allow"},
  });
  const result = evaluateLegalPolicy(j, {facts: {contract_type: "other"}});
  assert.equal(result.rule_id, "default");
});

test("evaluateLegalPolicy throws when nothing matches and there is no default_rule", () => {
  const j = jurisdiction({rules: [{id: "no-match", priority: 0, decision: "deny", when: {contract_type: "b2b"}}]});
  assert.throws(() => evaluateLegalPolicy(j, {facts: {}}), /jurisdiction_policy_no_match:pl/);
});

test("validateEngagement reports missing required facts for a known contract type", () => {
  const j = jurisdiction({contract_types: {b2b: {required_facts: ["company_id", "vat_id"]}}});
  const result = validateEngagement(j, {facts: {contract_type: "b2b", company_id: "1"}});
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, ["vat_id"]);
});

test("validateEngagement rejects an unsupported contract type", () => {
  const j = jurisdiction({contract_types: {}});
  const result = validateEngagement(j, {facts: {contract_type: "b2b"}});
  assert.equal(result.valid, false);
  assert.equal(result.reason, "contract_type_not_supported");
});
