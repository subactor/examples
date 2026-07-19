# Marketplace sales autonomy

Scenariusz publikuje produkt przez neutralne URI `marketplace://provider/**`.
Wybór Allegro, Amazon, eBay, Etsy lub Shopify jest danymi registry, a nie
warunkiem zaszytym w runtime. Kanały usługowe bez odpowiedniego publicznego API
są kierowane do wcześniej zakontraktowanego człowieka przez
`human://registry/actor/query/available`.

Każdy kanał wykonuje: capability preflight, draft, kontrolę prawa/podatków,
publish i evidence. Awaria jednego providera tworzy ticket, lecz nie zatrzymuje
pozostałych gałęzi. Sekrety OAuth są lease'owane przez connector i nigdy nie są
częścią OQL ani fixture.

Źródła implementacyjne należy każdorazowo sprawdzić przed wdrożeniem connectora:

- Allegro REST API: `https://developer.allegro.pl/documentation/`
- Amazon Selling Partner API: `https://developer-docs.amazon.com/sp-api/`
- eBay Sell Inventory API: `https://developer.ebay.com/api-docs/sell/inventory/`
- Etsy Open API v3: `https://developers.etsy.com/documentation/`
- Shopify GraphQL Admin API: `https://shopify.dev/docs/api/admin-graphql/`
