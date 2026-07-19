import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {compileContractAql} from "../../runtime/src/contract-aql.mjs";
import {readJson, ROOT} from "../src/load-config.mjs";
import {createConfiguredConnector} from "../src/configured-connector.mjs";
import {runWorkflow} from "../src/workflow-runner.mjs";
import {resolve} from "node:path";

async function setup(overrides = {}) {
  const [definition, fixture, failurePolicy] = await Promise.all([
    readJson("config/marketplace-process.json"),
    readJson("config/fixtures/marketplace-connectors.json"),
    readJson("config/escalation-policy.json"),
  ]);
  const adapter = createConfiguredConnector({routes: fixture.routes, overrides});
  return runWorkflow({definition, fixture: {product: {kind: "digital-file"}}, adapter, failurePolicy});
}

test("marketplace registry keeps providers in data and publishes independent channels", async () => {
  const definition = await readJson("config/marketplace-process.json");
  assert.ok(definition.providers.some((provider) => provider.id === "allegro-pl" && provider.execution === "official_api"));
  assert.ok(definition.providers.some((provider) => provider.id === "useme-pl" && provider.execution === "authorized_human_capability"));
  const result = await setup();
  assert.equal(result.ok, true);
  for (const group of ["allegro-pl", "ebay-global", "etsy-global", "shopify-direct"]) assert.equal(result.groups[group].blocked, 0, group);
});

test("one marketplace outage does not stop publication through other providers", async () => {
  const result = await setup({"allegro-preflight": () => ({ok: false, error: "provider_unavailable"})});
  assert.equal(result.ok, false);
  assert.equal(result.continue_unblocked, true);
  assert.equal(result.results.find((item) => item.step === "allegro-publish").status, "skipped_dependency");
  assert.equal(result.results.find((item) => item.step === "etsy-publish").ok, true);
  assert.equal(result.results.find((item) => item.step === "shopify-publish").ok, true);
  assert.equal(result.tickets[0].state, "resolving");
});

test("marketplace AQL grants generic capabilities without provider-specific runtime code", async () => {
  const source = await readFile(resolve(ROOT, "dsl/marketplace-sales.contract.aql"), "utf8");
  const compiled = compileContractAql(source, {now: new Date("2029-01-01T00:00:00Z")});
  assert.equal(compiled.ok, true, compiled.error);
  assert.match(source, /marketplace:\/\/\*\*/);
});
