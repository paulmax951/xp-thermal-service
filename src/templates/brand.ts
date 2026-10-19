/**
 * The credit at the foot of every receipt, invoice and test page.
 *
 * ⚠️  MUST STAY IN SYNC WITH  xp-pos/config/brand.ts (BRAND.receiptCredit)
 *     The POS live preview prints those lines and this service prints these,
 *     so a change to one without the other shows the owner a receipt that is
 *     not the one on paper.
 *
 * Always printed. There is no option to switch it off: the restaurant's
 * `fields.poweredBy` is ignored here, so neither a setting nor an older POS
 * can remove it.
 *
 * ASCII only and at most 32 characters a line - printers use a single-byte
 * code page, and 32 is the narrowest width a 58mm roll prints.
 */
export const RECEIPT_CREDIT: readonly string[] = ['Powered by Pulsar POS', 'XenithPulse.com'];
