export class GetEventByIdQuery {
  constructor(public readonly eventId: string) {}
}

export class GetPublishedEventsQuery {
  constructor(
    public readonly location?: string,
    public readonly date?: Date,
  ) {}
}