import {
  CreateEventCommandHandler,
  PublishEventCommandHandler,
  CancelEventCommandHandler,
} from '../../application/Event/event.command.handlers';

export class EventApplicationService {
  constructor(
    private readonly createEventHandler: CreateEventCommandHandler,
    private readonly publishEventHandler: PublishEventCommandHandler,
    private readonly cancelEventHandler: CancelEventCommandHandler,
  ) {}
}