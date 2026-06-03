export class RequestRefundCommand {
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly reason: string | null,
  ) {}
}
 
export class ApproveRefundCommand {
  constructor(public readonly refundId: string) {}
}
 
export class RejectRefundCommand {
  constructor(
    public readonly refundId: string,
    public readonly rejectionReason: string,
  ) {}
}
 
export class MarkRefundAsPaidOutCommand {
  constructor(
    public readonly refundId: string,
    public readonly paymentReference: string,
  ) {}
}