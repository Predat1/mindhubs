declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const fbq = (...args: unknown[]) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
};

export const fbPixel = {
  pageView: () => fbq("track", "PageView"),
  viewContent: (data: { content_name?: string; content_ids?: string[]; content_type?: string; value?: number; currency?: string }) =>
    fbq("track", "ViewContent", data),
  addToCart: (data: { content_ids?: string[]; content_name?: string; content_type?: string; value?: number; currency?: string }) =>
    fbq("track", "AddToCart", data),
  initiateCheckout: (data?: { content_ids?: string[]; value?: number; currency?: string; num_items?: number }) =>
    fbq("track", "InitiateCheckout", data),
  purchase: (data: { content_ids?: string[]; value: number; currency: string; num_items?: number }) =>
    fbq("track", "Purchase", data),
  lead: (data?: { content_name?: string; value?: number; currency?: string }) =>
    fbq("track", "Lead", data),
  completeRegistration: (data?: { content_name?: string; value?: number; currency?: string }) =>
    fbq("track", "CompleteRegistration", data),
  search: (data: { search_string: string; content_category?: string }) =>
    fbq("track", "Search", data),
  addToWishlist: (data?: { content_ids?: string[]; content_name?: string; value?: number; currency?: string }) =>
    fbq("track", "AddToWishlist", data),
  contact: () => fbq("track", "Contact"),
  customizeProduct: () => fbq("track", "CustomizeProduct"),
  findLocation: () => fbq("track", "FindLocation"),
  schedule: () => fbq("track", "Schedule"),
  startTrial: (data?: { value?: number; currency?: string }) =>
    fbq("track", "StartTrial", data),
  subscribe: (data?: { value?: number; currency?: string }) =>
    fbq("track", "Subscribe", data),
  submitApplication: () => fbq("track", "SubmitApplication"),
};

export default fbPixel;
