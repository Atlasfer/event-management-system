export class GetCustomerTicketsQuery {
  constructor(public readonly customerId: string) {}
}
 
export class GetTicketByCodeQuery {
  constructor(public readonly ticketCode: string) {}
}