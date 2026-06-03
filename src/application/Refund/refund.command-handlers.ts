import { IRefundRepository } from '../../domain/refund/refund.repository';
import { IBookingRepository } from '../../domain/booking/booking.repository';
import { ITicketRepository } from '../../domain/ticket/ticket.repository';
import { IEventRepository } from '../../domain/event/event.repository';
import { RefundAggregate } from '../../domain/refund/refund.aggregate';
import { RefundEligibilityService } from '../../domain/refund/refund-eligibility.service';
import { DomainError } from '../../domain/shared/domain-error';
import { RequestRefundCommand, ApproveRefundCommand, RejectRefundCommand, MarkRefundAsPaidOutCommand } from './refund.commands';
 
export class RequestRefundCommandHandler {
  private readonly eligibilityService = new RefundEligibilityService();
 
  constructor(
    private readonly refundRepository: IRefundRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
    private readonly eventRepository: IEventRepository,
  ) {}
 
  async execute(command: RequestRefundCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new DomainError(`Booking not found: ${command.bookingId}`);
    }
 
    const event = await this.eventRepository.findById(booking.eventId);
    if (!event) {
      throw new DomainError(`Event not found: ${booking.eventId}`);
    }
 
    const tickets = await this.ticketRepository.findByBookingId(booking.id);
 
    this.eligibilityService.assertEligible(
      booking,
      tickets,
      event.status,
      null,
    );
 
    const refund = RefundAggregate.create({
      id: command.refundId,
      bookingId: command.bookingId,
      customerId: command.customerId,
      amount: booking.totalPrice,
      reason: command.reason,
    });
 
    await this.refundRepository.save(refund);
  }
}
 
export class ApproveRefundCommandHandler {
  constructor(
    private readonly refundRepository: IRefundRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
  ) {}
 
  async execute(command: ApproveRefundCommand): Promise<void> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) {
      throw new DomainError(`Refund not found: ${command.refundId}`);
    }
 
    //
    refund.approve();
 
    // Cancel all tickets and mark booking as Refunded
    const booking = await this.bookingRepository.findById(refund.bookingId);
    if (!booking) {
      throw new DomainError(`Booking not found: ${refund.bookingId}`);
    }
 
    const tickets = await this.ticketRepository.findByBookingId(booking.id);
    for (const ticket of tickets) {
      ticket.cancel();
      await this.ticketRepository.save(ticket);
    }
 
    booking.markAsRefunded();
 
    await this.bookingRepository.save(booking);
    await this.refundRepository.save(refund);
  }
}
 
export class RejectRefundCommandHandler {
  constructor(private readonly refundRepository: IRefundRepository) {}
 
  async execute(command: RejectRefundCommand): Promise<void> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) {
      throw new DomainError(`Refund not found: ${command.refundId}`);
    }
 
    refund.reject(command.rejectionReason);
    await this.refundRepository.save(refund);
  }
}
 
export class MarkRefundAsPaidOutCommandHandler {
  constructor(private readonly refundRepository: IRefundRepository) {}
 
  async execute(command: MarkRefundAsPaidOutCommand): Promise<void> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) {
      throw new DomainError(`Refund not found: ${command.refundId}`);
    }
 
    refund.markAsPaidOut(command.paymentReference);
    await this.refundRepository.save(refund);
  }
}