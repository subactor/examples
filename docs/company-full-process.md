# Founder order → offer → site → recruitment → agreement → first ticket

The executable process in `config/company-process.json` covers governance,
sales, web, administration, HR, legal and development. It consumes the real
project manifest from `../projekty/project.manifest.json`, but all external
effects use dry-run or fictional `.test` identities in the test suite.

## Safety and legal gates

- “Unpaid internship” is never a generic free-work mode. The included Polish
  fixture models only a written graduate-practice agreement with the statutory
  age and duration facts. Missing evidence fails closed before a contract,
  identity, mailbox or GitHub access is created.
- A placement organized by a school needs its own school program/referral and
  insurance basis. A labour-office internship is not modeled as free labour;
  its stipend/administrative basis is a different relationship.
- Selection with significant effect requires an authorized human capability
  and meaningful-review evidence. The simulator cannot grant itself authority.
- Signed status is a dependency of identity provisioning. GitHub access is
  least privilege (`triage` in the fixture), and the first issue is assigned
  only after identity creation.

Official Polish references: the [graduate-practice information on Gov.pl](https://www.gov.pl/web/sprawiedliwosc/praktyki-absolwenckie3)
and the [consolidated act in the Sejm ELI API](https://api.sejm.gov.pl/eli/acts/DU/2018/1244/text.html).
This scenario is executable compliance evidence, not legal advice or a signed
agreement template.

## Hosting and connector preflights

Before domain creation the Plesk connector queries the existing subscription,
customer authorization, domain limit and current usage. Unknown limit,
permission denial or exhausted capacity produces a typed blocker and routes it
to operations while independent HR/legal work continues. Creation remains
disabled unless both mutation gates are explicitly opened.

The connector follows Plesk's XML API model for [creating a site under an
existing webspace](https://docs.plesk.com/en-US/obsidian/api-rpc/about-xml-api/reference/managing-sites-domains/creating-a-site.66574/)
and subscription [limits and permissions](https://docs.plesk.com/en-US/obsidian/api-rpc/about-xml-api/reference/managing-subscriptions/subscription-settings/limits-permissions-and-hosting-settings/limits.39975/).
GitHub work uses the official [issues](https://docs.github.com/en/rest/issues)
and [repository collaborators](https://docs.github.com/en/rest/collaborators)
APIs through dedicated URI processes.

## Run

```bash
npm test
npm run company
```

The expected safe test result is 26 completed steps, no real delivery, a normal
platform state and sealed onboarding evidence. Failure tests prove branch
isolation and escalation through Planfile/email/substitution policy.
