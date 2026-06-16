import { IPaymentGateway } from '../../application/ports/payment-gateway.port';
import { v4 as uuidv4 } from 'uuid';

export class MockPaymentGateway implements IPaymentGateway {
  async processPayment(props: {
    bookingId: string;
    customerId: string;
    amount: number;
    currency: string;
  }): Promise<{ paymentReference: string }> {
    await this.simulateDelay(100);

    const paymentReference = `PAY-${uuidv4().toUpperCase()}`;

    console.log(
      `[MockPaymentGateway] Payment processed — booking: ${props.bookingId}, ` +
        `amount: ${props.currency} ${props.amount}, ref: ${paymentReference}`,
    );

    return { paymentReference };
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
