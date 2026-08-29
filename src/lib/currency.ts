export type Currency = {
  code: string;
  label: string;
};

export const CURRENCIES: Currency[] = [
  { code: "GBP", label: "British Pound" },
  { code: "EUR", label: "Euro" },
  { code: "USD", label: "US Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "NZD", label: "New Zealand Dollar" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "HKD", label: "Hong Kong Dollar" },
  { code: "SGD", label: "Singapore Dollar" },
  { code: "INR", label: "Indian Rupee" },
  { code: "KRW", label: "South Korean Won" },
  { code: "TWD", label: "New Taiwan Dollar" },
  { code: "THB", label: "Thai Baht" },
  { code: "PHP", label: "Philippine Peso" },
  { code: "IDR", label: "Indonesian Rupiah" },
  { code: "MYR", label: "Malaysian Ringgit" },
  { code: "VND", label: "Vietnamese Dong" },
  { code: "AED", label: "UAE Dirham" },
  { code: "SAR", label: "Saudi Riyal" },
  { code: "ILS", label: "Israeli Shekel" },
  { code: "TRY", label: "Turkish Lira" },
  { code: "ZAR", label: "South African Rand" },
  { code: "NGN", label: "Nigerian Naira" },
  { code: "KES", label: "Kenyan Shilling" },
  { code: "EGP", label: "Egyptian Pound" },
  { code: "BRL", label: "Brazilian Real" },
  { code: "MXN", label: "Mexican Peso" },
  { code: "ARS", label: "Argentine Peso" },
  { code: "CLP", label: "Chilean Peso" },
  { code: "COP", label: "Colombian Peso" },
  { code: "PEN", label: "Peruvian Sol" },
  { code: "SEK", label: "Swedish Krona" },
  { code: "NOK", label: "Norwegian Krone" },
  { code: "DKK", label: "Danish Krone" },
  { code: "PLN", label: "Polish Zloty" },
  { code: "CZK", label: "Czech Koruna" },
  { code: "HUF", label: "Hungarian Forint" },
  { code: "RON", label: "Romanian Leu" },
  { code: "BGN", label: "Bulgarian Lev" },
  { code: "UAH", label: "Ukrainian Hryvnia" },
];

export function isValidCurrency(code: string): boolean {
  if (!/^[A-Z]{3}$/.test(code)) return false;
  try {
    new Intl.NumberFormat("en", { style: "currency", currency: code }).format(1);
    return true;
  } catch {
    return false;
  }
}

export function currencyLabel(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.label ?? code;
}
