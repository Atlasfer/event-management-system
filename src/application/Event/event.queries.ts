export class GetEventByIdQuery {
  constructor(public readonly eventId: string) {}
}

export class GetPublishedEventsQuery {
  constructor(
    public readonly location?: string,
    public readonly date?: Date,
  ) {}
}

export class GetEventSalesReportQuery {
  constructor(public readonly eventId: string) {}
}

export class GetEventParticipantsQuery {
  constructor(public readonly eventId: string) {}
}
