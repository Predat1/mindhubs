/**
 * Provider-neutral payment contract.
 *
 * The browser only starts a checkout through a server endpoint. Provider
 * secrets, webhook verification and refunds must stay server-side. A future
 * MindHubs payment adapter can implement this contract without changing the
 * cart, order or entitlement model.
 */
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type CreateCheckoutInput = {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
};

export type CheckoutSession = {
  reference: string;
  checkoutUrl?: string;
  status: PaymentStatus;
  provider: string;
};

export type WebhookEvent = {
  provider: string;
  reference: string;
  orderId?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  raw: unknown;
};

export type RefundInput = {
  orderId: string;
  reference: string;
  amount?: number;
  reason?: string;
};

export type RefundResult = {
  reference: string;
  status: "refunded" | "pending" | "failed";
};

export interface PaymentProvider {
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession>;
  getPaymentStatus(reference: string): Promise<PaymentStatus>;
  verifyWebhook(request: Request): Promise<WebhookEvent>;
  refund(input: RefundInput): Promise<RefundResult>;
}

