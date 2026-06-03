export class GetRefundByBookingQuery {
  constructor(public readonly bookingId: string) {}
}
 
export class GetRefundsByCustomerQuery {
  constructor(public readonly customerId: string) {}
}