import { IRefundPaymentService } from '../../application/ports/refund-payment.port';
import { v4 as uuidv4 } from 'uuid';

export class MockRefundPaymentService implements IRefundPaymentService {
  async processRefund(props: {
    refundId: string;
    customerId: string;
    amount: number;
    currency: string;
  }): Promise<{ paymentReference: string }> {
    await this.simulateDelay(100);

    const paymentReference = `REFUND-${uuidv4().toUpperCase()}`;

    console.log(
      `[MockRefundPaymentService] Refund processed — refund: ${props.refundId}, ` +
        `customer: ${props.customerId}, amount: ${props.currency} ${props.amount}, ` +
        `ref: ${paymentReference}`,
    );

    return { paymentReference };
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
