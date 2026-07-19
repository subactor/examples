# Legal source register

Status date: 2026-07-19. These sources define conservative test fixtures, not legal opinions. A qualified professional must validate facts, exceptions, collective agreements, corporate form, governing law and later amendments before a production mandate is activated.

| ID | Scope represented in fixtures | Official source |
|---|---|---|
| `EU-GDPR-22` | Safeguards around solely automated decisions with legal or similarly significant effects. | [GDPR, Regulation (EU) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj) |
| `EU-AI-ACT-EMPLOYMENT` | Employment and worker-management systems appear in the AI Act high-risk taxonomy; application dates are progressive and must be checked separately. | [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj), [European Commission implementation timeline](https://ai-act-service-desk.ec.europa.eu/en/ai-act/eu-ai-act-implementation-timeline) |
| `PL-CEIDG-POWER` | A Polish entrepreneur may establish representatives; scope and form vary, and some operations require specific authority. | [Biznes.gov.pl — Pełnomocnik przedsiębiorcy wpisanego do CEIDG](https://biznes.gov.pl/pl/portal/00151) |
| `PL-PRAKTYKI-ABSOLWENCKIE` | The graduate-practice fixture checks the written basis, age and duration limits; it is not a generic authorization for unpaid work. | [Sejm ELI API — Act on graduate practices](https://api.sejm.gov.pl/eli/acts/DU/2018/1244/text.html) |
| `PL-GOV-PRAKTYKI` | Official practical summary of paid or unpaid graduate practice and its maximum duration. | [Gov.pl — Praktyki absolwenckie](https://www.gov.pl/web/sprawiedliwosc/praktyki-absolwenckie3) |
| `DE-BETRVG-87` | Works council codetermination includes technical systems intended to monitor employee behaviour or performance. | [§ 87 Betriebsverfassungsgesetz](https://www.gesetze-im-internet.de/betrvg/__87.html) |
| `DE-AUEG-1` | Commercial temporary agency work may require a permit and is tied to integration and instructions. | [§ 1 Arbeitnehmerüberlassungsgesetz](https://www.gesetze-im-internet.de/a_g/BJNR113930972.html) |
| `DE-BMAS-WERKVERTRAG` | Labeling an employee relationship as independent work does not determine its legal character. | [BMAS FAQ on Werkverträge](https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Leiharbeit-Werkvertraege/FAQ-Werkvertraege/faq-werkvertraege-art.html) |
| `UK-GOV-STATUS-2026` | Employee, worker and self-employed status depend on the real relationship; tax status is separate. | [GOV.UK employment status guidance](https://www.gov.uk/government/publications/employment-status-and-employment-rights/employment-status-and-employment-rights-guidance-for-hr-professionals-legal-professionals-and-other-groups) |
| `UK-GOV-SELFEMPLOYED` | Contractors can have different employment statuses; the label alone is not conclusive. | [GOV.UK — Self-employed and contractor](https://www.gov.uk/employment-status/selfemployed-contractor) |
| `UK-ICO-ADM-2026` | Worker ADM needs current UK GDPR/DUAA analysis, transparency and effective safeguards; meaningful review must be genuine when used. | [ICO worker monitoring and automated processes](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/what-do-we-need-to-do-if-we-use-monitoring-tools-that-use-solely-automated-processes/), [ICO recruitment ADM update, 31 March 2026](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/03/automated-decisions-can-streamline-the-hiring-process-with-the-right-safeguards-in-place/) |
| `CA-DIR-ABC` | California generally starts from employee status under the ABC test, subject to statutory exceptions and potentially different tests. | [California DIR — Independent contractor versus employee](https://www.dir.ca.gov/dlse/FAQ_IndependentContractor.htm) |

## Fixture policy

- Rules contain an `as_of` date and source identifiers.
- A missing fact never yields an autonomous legal conclusion.
- `authorized_human` means a previously mandated capability, not an ad-hoc approval click.
- `prohibited` stops the specific operation but returns `continue_unblocked: true`.
- Sources establish test assumptions only; the scenario input must still reflect the real working relationship.
