export class CreateEventCommand {
  constructor(
    public readonly eventId: string,
    public readonly organizerId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly location: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly maxCapacity: number,
  ) {}
}

export class PublishEventCommand {
  constructor(public readonly eventId: string) {}
}

export class CancelEventCommand {
  constructor(public readonly eventId: string) {}
}

export class CreateTicketCategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly eventId: string,
    public readonly name: string,
    public readonly price: number,
    public readonly currency: string,
    public readonly quota: number,
    public readonly salesStart: Date,
    public readonly salesEnd: Date,
  ) {}
}

export class DisableTicketCategoryCommand {
  constructor(
    public readonly eventId: string,
    public readonly categoryId: string,
  ) {}
}