# Subactor autonomy examples

Executable multi-jurisdiction scenarios for testing Subactor's continuity model across human roles, contracts and legal constraints. The repository uses the real sibling `orchestrator/src/resolution-engine` implementation.

## Run

Requirements: Node.js 20+ and this repository located next to `orchestrator` in the Subactor workspace.

```bash
npm test
npm run scenario -- pl-founder-unavailable
npm run scenario:all
npm run company
```

The included GitHub Actions workflow checks out `subactor/orchestrator` as a sibling and runs the same suite on every push and pull request.

Each result includes the matched legal-policy fixture, required evidence, selected authority/provider, task state, platform mode and `continue_unblocked` invariant.

## Coverage

| Jurisdiction | Human relationships | Example gates |
|---|---|---|
| Poland + EU | employee, B2B, representative, director | pre-existing authority, significant employment decisions, framework work orders |
| Germany + EU | employee, B2B, temporary agency | works council codetermination, false self-employment risk, agency permit |
| United Kingdom | employee, worker, contractor, office holder | status follows reality, current ADM safeguards, meaningful review |
| California | employee, contractor, agency | ABC classification fixture and conversion/review path |

Shared role semantics are in `config/roles.json`; contract mechanics are in `config/contract-types.json`. Jurisdiction files are independent and versioned because the same job title or contract label can produce different routing decisions.

## Safety model

This is a test harness, not legal advice and not a system for generating legal authority. Unknown contract types, missing facts and unmatched rules fail closed into a pre-contracted legal capability. A `legally_impossible` operation does not stop other work.

Demo providers are fictional and active only inside the simulator. They must never be copied as production mandates. Production activation requires verified identities, signed contracts, valid authority, budgets, access controls and current advice for every relevant jurisdiction.

The company scenario is deliberately split into a domain-independent DAG
runner, generic rule evaluator and configured URI adapters. Polish graduate
practice, HR routing, Plesk, GitHub and e-sign behavior live in versioned JSON
policies/fixtures rather than engine code.

See [legal source register](docs/legal-sources.md) for official sources and freshness assumptions.
