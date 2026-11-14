/**
 * Normalize phone numbers for consistent database lookups and duplicate prevention.
 * Strips formatting characters (spaces, hyphens, parentheses, dots).
 * Normalizes common variations (+91, 91, leading 0 for 10-digit numbers).
 */
const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';

  // Strip whitespace, hyphens, parentheses, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();

  // If number begins with 00, replace with +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If 10 digits starting with 6-9 (standard Indian mobile format)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  // If 11 digits starting with 0 followed by 6-9, strip leading 0
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return cleaned.slice(1);
  }

  // If starts with +91 followed by 10 digits
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned.slice(3);
  }

  // If starts with 91 followed by 10 digits (12 digits total)
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned.slice(2);
  }

  return cleaned;
};

module.exports = {
  normalizePhone,
};
