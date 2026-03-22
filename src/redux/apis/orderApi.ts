// /api/orders/checkout/online/

import { api } from "../api";

export interface CheckoutOnlineItemPayload {
  qualification_id: string;
  qualification_session_id?: string | null;
  is_upsell?: boolean;
  pricing_note?: string;
}

export interface CheckoutOnlinePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  billing_address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  items: CheckoutOnlineItemPayload[];
}

export interface CheckoutOnlineResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      id: string;
      order_number: string;
      subtotal: string;
      discount_total: string;
      grand_total: string;
      currency: string;
      items: Array<{
        id: string;
        qualification: string;
        qualification_title: string;
        qualification_session: string | null;
        qualification_session_title: string | null;
        unit_price_snapshot: string;
        discount_amount: string;
        is_upsell: boolean;
        pricing_note: string;
        line_total: string;
      }>;
    };
    payment_intent_client_secret: string;
    stripe_payment_intent_id: string;
    stripe_customer_id: string;
    stripe_publishable_key: string;
  };
}

const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    checkoutOnline: builder.mutation<CheckoutOnlineResponse, CheckoutOnlinePayload>({
      query: (data) => ({
        url: `/api/orders/checkout/online/`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useCheckoutOnlineMutation } = orderApi;
