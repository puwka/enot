import { getOfferByLink, getOfferBySlug } from './offersRegistry';

const asImageUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.default) return String(value.default);
  return String(value);
};

export const resolveProductImage = ({ slug, link, logoUrl, bankLogoUrl } = {}) => {
  const remote = asImageUrl(logoUrl) || asImageUrl(bankLogoUrl);
  if (remote) return remote;

  if (slug) {
    const offer = getOfferBySlug(slug);
    if (offer?.image) return asImageUrl(offer.image);
  }

  if (link) {
    const offer = getOfferByLink(link);
    if (offer?.image) return asImageUrl(offer.image);
  }

  return '';
};
