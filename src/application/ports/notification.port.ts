export interface INotificationService {
  send(props: {
    userId: string;
    subject: string;
    message: string;
  }): Promise<void>;
}