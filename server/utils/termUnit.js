export const TERM_UNITS = [
  { value: 'day', label: 'дни', short: 'дн.' },
  { value: 'month', label: 'месяцы', short: 'мес.' },
];

export const normalizeTermUnit = (value, fallback = 'month') =>
  value === 'day' || value === 'month' ? value : fallback;

export const termUnitShort = (unit) => (normalizeTermUnit(unit) === 'day' ? 'дн.' : 'мес.');

export const formatTermWord = (value, unit = 'month') => {
  const n = Math.abs(Number(value) || 0);
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (normalizeTermUnit(unit) === 'day') {
    if (mod10 === 1 && mod100 !== 11) return 'день';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня';
    return 'дней';
  }
  if (mod10 === 1 && mod100 !== 11) return 'месяц';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'месяца';
  return 'месяцев';
};

export const formatTermRange = (min, max, unit = 'month') => {
  const short = termUnitShort(unit);
  if (min != null && max != null) return `${min} - ${max} ${short}`;
  if (min != null) return `от ${min} ${short}`;
  if (max != null) return `до ${max} ${short}`;
  return '';
};

export const formatTermValue = (value, unit = 'month') =>
  `${value} ${formatTermWord(value, unit)}`;

/** Meta object stored inside calculator purposes jsonb (filtered out of UI lists). */
export const CALC_TERM_META_KEY = '__term_unit';

export const packCalculatorPurposes = (lines, termUnit) => {
  const purposes = (lines || []).filter(Boolean);
  return [{ [CALC_TERM_META_KEY]: normalizeTermUnit(termUnit) }, ...purposes];
};

export const unpackCalculatorPurposes = (raw, fallbackUnit = 'month') => {
  const list = Array.isArray(raw) ? raw : [];
  let termUnit = fallbackUnit;
  const purposes = [];
  list.forEach((entry) => {
    if (entry && typeof entry === 'object' && !Array.isArray(entry) && entry[CALC_TERM_META_KEY]) {
      termUnit = normalizeTermUnit(entry[CALC_TERM_META_KEY], fallbackUnit);
      return;
    }
    if (typeof entry === 'string' && entry.trim()) purposes.push(entry.trim());
  });
  return { purposes, termUnit };
};
