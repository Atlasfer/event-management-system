export interface IRefundPaymentService {
  processRefund(props: {
    refundId: string;
    customerId: string;
    amount: number;
    currency: string;
  }): Promise<{ paymentReference: string }>;
}