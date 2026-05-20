export class GetBookingDetailQuery {
  constructor(public readonly bookingId: string) {}
}
 
export class GetCustomerBookingsQuery {
  constructor(public readonly customerId: string) {}
}