/** Normalize scanner output into candidate barcode strings for lookup. */
export function barcodeLookupVariants(raw: string): string[] {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  const variants = new Set<string>();

  if (trimmed) variants.add(trimmed);
  if (digits) variants.add(digits);
  if (digits.length === 12) variants.add(`0${digits}`);
  if (digits.length === 13 && digits.startsWith('0')) variants.add(digits.slice(1));

  return [...variants];
}
