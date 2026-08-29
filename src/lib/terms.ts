export type TermSnippet = {
  id: string;
  label: string;
  body: string;
};

export const TERM_SNIPPETS: TermSnippet[] = [
  { id: "14-days", label: "14 days", body: "Payment due within 14 days of the invoice date. Please use the invoice number as your payment reference." },
  { id: "30-days", label: "30 days", body: "Payment due within 30 days of the invoice date. Late payment may attract statutory interest under the Late Payment of Commercial Debts Act." },
  { id: "deposit-50", label: "50% deposit", body: "A 50% deposit confirms the booking. The balance is due on completion. The deposit is non-refundable once materials have been ordered." },
  { id: "on-completion", label: "On completion", body: "Payment is due on completion of the works. Cash, bank transfer or card accepted." },
  { id: "vat-20", label: "VAT registered", body: "VAT is charged at 20%. This invoice is a VAT invoice. Please retain it for your records." },
  { id: "not-vat", label: "Not VAT registered", body: "This supply is not subject to VAT. I am not currently VAT registered." },
  { id: "cis", label: "CIS", body: "CIS deductions may apply if you are a contractor under the Construction Industry Scheme. Please confirm your CIS status before payment." },
  { id: "call-out", label: "Call-out", body: "The first hour is billed as a call-out. Additional labour is billed in 30-minute increments. Parking and congestion charges are extra if incurred." },
];
