/**
 * schema.org structured data for calmokit.eu, built from the same product list
 * and shared catalog as the shop, so Google sees the real price, stock state,
 * shipping and returns. Injected into index.html at build time (vite.config.ts).
 *
 * Why: the hand-written JSON-LD drifted (old SKUs and names, an FAQ promising
 * "free worldwide shipping over $99"). Spanish is the default storefront copy.
 */
import { PRODUCTS } from '../data/products';
import { translations } from '../i18n/translations';
import { FREE_SHIPPING_FROM_EUR as FREE_SHIPPING, SHIPPING_COUNTRIES, SHIPPING_EUR } from '../../supabase/functions/_shared/calmoCatalog';

const SITE = 'https://calmokit.eu';

const jpgUrl = (image: string) => `${SITE}${image.replace(/\.webp$/, '.jpg')}`;

const shippingDetails = [
  {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: SHIPPING_EUR.toFixed(2), currency: 'EUR' },
    shippingDestination: SHIPPING_COUNTRIES.map((c) => ({
      '@type': 'DefinedRegion',
      addressCountry: c,
    })),
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
      transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
    },
  },
];

const returnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: [...SHIPPING_COUNTRIES],
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
};

export function buildSchema(): Record<string, unknown> {
  const es = translations.es;
  // Only products that can be bought now; "coming soon" items stay out of
  // Google Shopping until a supplier confirms them.
  const sellable = PRODUCTS.filter((p) => p.inStock);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#org`,
        name: 'CalmoKit',
        url: SITE,
        logo: `${SITE}/icon-512.png`,
        email: 'hola@calmokit.eu',
        description: es.footer.tagline,
      },
      {
        '@type': 'WebSite',
        name: 'CalmoKit',
        url: SITE,
        inLanguage: ['es', 'pt', 'en'],
        publisher: { '@id': `${SITE}/#org` },
      },
      {
        '@type': 'ItemList',
        name: 'CalmoKit',
        itemListElement: sellable.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: p.name.es,
            sku: p.sku,
            image: jpgUrl(p.image),
            description: p.description.es,
            category: p.category,
            brand: { '@type': 'Brand', name: 'CalmoKit' },
            offers: {
              '@type': 'Offer',
              url: `${SITE}/#catalog`,
              priceCurrency: 'EUR',
              price: p.priceEur.toFixed(2),
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@id': `${SITE}/#org` },
              shippingDetails,
              hasMerchantReturnPolicy: returnPolicy,
            },
          },
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: es.faq.items.map((f: { q: string; a: string }) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}

/** The <script> tag for index.html. `<` is escaped so copy can't close the tag. */
export function schemaScriptTag(): string {
  const json = JSON.stringify(buildSchema(), null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

/** /llms.txt: a plain summary for AI search tools, from the same catalog. */
export function buildLlmsTxt(): string {
  const eur = (n: number) => `€${n.toFixed(2).replace(/\.00$/, '')}`;
  const line = (p: (typeof PRODUCTS)[number]) =>
    `- **${p.name.en} (${eur(p.priceEur)})**${p.inStock ? '' : ' — coming soon'}: ${p.shortTagline.en}`;
  const kits = PRODUCTS.filter((p) => p.fulfillment === 'curated-kit');
  const gear = PRODUCTS.filter((p) => p.fulfillment !== 'curated-kit');
  return [
    '# CalmoKit (calmokit.eu)',
    '> Emergency preparedness for homes in Spain and Portugal: 72-hour kits, blackout gear, long-life European food and water filtration. Storefront in Spanish, Portuguese and English. Prices in EUR, VAT included.',
    '',
    '## Kits',
    ...kits.map(line),
    '',
    '## Individual products',
    ...gear.map(line),
    '',
    '## Shipping, returns, contact',
    `- Ships to mainland Spain, the Balearic Islands and mainland Portugal (not the Canary Islands, Ceuta, Melilla, Madeira or the Azores). Free tracked shipping from €${FREE_SHIPPING} (otherwise ${eur(SHIPPING_EUR)}), 1–5 working days.`,
    '- 14-day returns; 3-year legal guarantee.',
    '- Legal information: https://calmokit.eu/legal/en.html',
    '- Contact: hola@calmokit.eu',
    '',
  ].join('\n');
}
