import { ITicketRepository } from '../../domain/ticket/ticket.repository';
import { IEventRepository } from '../../domain/event/event.repository';
import { TicketCode } from '../../domain/ticket/value-objects';
import { DomainError } from '../../domain/shared/domain-error';
import { TicketCheckInPolicyService } from '../../domain/ticket/ticket-check-in-policy.service';
import { CheckInTicketCommand } from './ticket.commands';
 
export class CheckInTicketCommandHandler {
  private readonly policyService = new TicketCheckInPolicyService();
 
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly eventRepository: IEventRepository,
  ) {}
 
  async execute(command: CheckInTicketCommand): Promise<void> {
    // Find ticket by code 
    const ticket = await this.ticketRepository.findByCode(
      new TicketCode(command.ticketCode),
    );
    if (!ticket) {
      throw new DomainError('Check-in failed: ticket is invalid or not found.');
    }
 
    const event = await this.eventRepository.findById(command.targetEventId);
    if (!event) {
      throw new DomainError(`Event not found: ${command.targetEventId}`);
    }
 
    // TicketCheckInPolicyService validates
    this.policyService.assertCanCheckIn(
      ticket,
      command.targetEventId,
      event.status,
      event.schedule.start,
    );
 
    ticket.checkIn();
    await this.ticketRepository.save(ticket);
  }
}