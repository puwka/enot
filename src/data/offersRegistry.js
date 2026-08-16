import { enrichOffers } from '../utils/offers';
import { LOANS_CATALOG } from '../pages/Loans';
import { CONSUMER_LOANS_CATALOG } from '../pages/ConsumerLoans';
import { AUTO_LOANS_CATALOG } from '../pages/AutoLoans';
import { COLLATERAL_LOANS_CATALOG } from '../pages/CollateralLoans';
import { CARDS_CATALOG } from '../pages/Cards';
import { JOB_CATALOG } from '../pages/Job';
import { EDUCATION_CATALOG } from '../pages/EducationData';

const CATALOGS = [
  LOANS_CATALOG,
  CONSUMER_LOANS_CATALOG,
  AUTO_LOANS_CATALOG,
  COLLATERAL_LOANS_CATALOG,
  CARDS_CATALOG,
  JOB_CATALOG,
  EDUCATION_CATALOG,
];

export const ALL_OFFERS = CATALOGS.flatMap((catalog) =>
  enrichOffers(catalog.items, {
    catalogPath: catalog.path,
    catalogLabel: catalog.label,
    variant: catalog.variant,
    prefix: catalog.prefix,
    ctaLabel: catalog.ctaLabel,
  })
);

const bySlug = new Map(ALL_OFFERS.map((offer) => [offer.slug, offer]));
const byLink = new Map(ALL_OFFERS.map((offer) => [offer.link, offer]));

export const getOfferBySlug = (slug) => bySlug.get(slug) || null;

export const getOfferByLink = (link) => byLink.get(link) || null;

export const getRelatedOffers = (offer, limit = 4) => {
  if (!offer) return [];
  return ALL_OFFERS.filter(
    (item) => item.catalogPath === offer.catalogPath && item.slug !== offer.slug
  ).slice(0, limit);
};
