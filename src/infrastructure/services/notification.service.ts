import { INotificationService } from '../../application/ports/notification.port';

export class MockNotificationService implements INotificationService {
  async send(props: {
    userId: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await this.simulateDelay(50);

    console.log(
      `[MockNotificationService] Notification sent — ` +
        `user: ${props.userId}, subject: "${props.subject}", message: "${props.message}"`,
    );
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
