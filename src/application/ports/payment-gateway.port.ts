export interface IPaymentGateway {
  processPayment(props: {
    bookingId: string;
    customerId: string;
    amount: number;
    currency: string;
  }): Promise<{ paymentReference: string }>;
}