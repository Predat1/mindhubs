/**
 * Utility functions for currency formatting
 * Automatically handles XOF/F CFA currency display
 */

// Currency configuration
export const CURRENCY_CONFIG = {
  symbol: "FCFA",
  code: "XOF",
  locale: "fr-FR",
  decimals: 0, // XOF doesn't use decimals
};

/**
 * Format a number or string as XOF/F CFA currency
 * @param value - The price value (number or string with or without separators)
 * @returns Formatted string like "5.000 FCA" or "10.000 FCA"
 */
export function formatCurrency(value: number | string): string {
  // Handle empty or null values
  if (value === null || value === undefined || value === "") {
    return `0 ${CURRENCY_CONFIG.symbol}`;
  }

  // Convert to number
  let num: number;
  if (typeof value === "string") {
    // Remove any existing currency symbols and spaces
    const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\s/g, "");
    // Handle both comma and dot as decimal separators
    num = parseFloat(cleaned.replace(/,/g, "."));
  } else {
    num = value;
  }

  // Handle invalid numbers
  if (isNaN(num)) {
    return `0 ${CURRENCY_CONFIG.symbol}`;
  }

  // Format with French locale (space as thousands separator)
  const formatted = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    minimumFractionDigits: CURRENCY_CONFIG.decimals,
    maximumFractionDigits: CURRENCY_CONFIG.decimals,
  }).format(num);

  return `${formatted} ${CURRENCY_CONFIG.symbol}`;
}

/**
 * Format price for display in product cards
 * @param price - The price value
 * @returns Short format like "5K FCA" for large numbers
 */
export function formatPriceShort(price: number | string): string {
  const num = typeof price === "string" 
    ? parseFloat(price.replace(/[^\d,.-]/g, "").replace(/,/g, "."))
    : price;

  if (isNaN(num)) return `0 ${CURRENCY_CONFIG.symbol}`;

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M ${CURRENCY_CONFIG.symbol}`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K ${CURRENCY_CONFIG.symbol}`;
  }

  return formatCurrency(num);
}

/**
 * Parse a currency string to number
 * @param value - The formatted currency string
 * @returns Raw number
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/,/g, ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Calculate discount percentage
 * @param oldPrice - Original price
 * @param newPrice - Current price
 * @returns Discount percentage
 */
export function calculateDiscount(oldPrice: number | string, newPrice: number | string): number | null {
  const oldNum = typeof oldPrice === "string" ? parseCurrency(oldPrice) : oldPrice;
  const newNum = typeof newPrice === "string" ? parseCurrency(newPrice) : newPrice;

  if (!oldNum || !newNum || oldNum <= newNum) return null;

  return Math.round(((oldNum - newNum) / oldNum) * 100);
}

/**
 * Format price input for vendor form
 * Auto-adds currency symbol as user types
 * @param value - Input value
 * @returns Formatted value for display
 */
export function formatPriceInput(value: string): string {
  // Remove all non-digit characters except comma and dot
  const digitsOnly = value.replace(/[^\d]/g, "");
  
  if (!digitsOnly) return "";
  
  const num = parseInt(digitsOnly, 10);
  if (isNaN(num)) return "";
  
  // Format with space as thousands separator
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale).format(num);
}

/**
 * Currency symbol component for React
 */
export const CurrencySymbol = ({ className }: { className?: string }) => (
  <span className={className}>{CURRENCY_CONFIG.symbol}</span>
);