// src/types/types.ts

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED',
  }
  
  export interface OrderItem {
    price: any;
    name: string;
    amount: number;
    quantity: number;
  }
  
  export interface CreateCheckoutSessionRequest {
    orderId: string;
    items: OrderItem[];
  }
  
  export interface PaymentSuccessPayload {
    orderId: string;
    sessionId: string;
    paymentIntentId: string;
    amount_total: number;
    currency: string;
    customer: string;
    status: PaymentStatus;
  }
  
  export interface PaymentFailurePayload {
    orderId: string;
    sessionId: string;
    reason: string;
    status: PaymentStatus;
  }
  