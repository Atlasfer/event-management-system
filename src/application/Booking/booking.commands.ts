export class CreateBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly eventId: string,
    public readonly categoryId: string,
    public readonly quantity: number,
  ) {}
}

export class PayBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly paymentAmount: number,
    public readonly currency: string,
  ) {}
}

export class ExpireBookingCommand {
  constructor(public readonly bookingId: string) {}
}