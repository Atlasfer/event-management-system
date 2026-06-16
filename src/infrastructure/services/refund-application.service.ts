import { PrismaService } from '../database/prisma.service';
import { PrismaRefundRepository } from '../database/repositories/prisma-refund.repository';
import { PrismaBookingRepository } from '../database/repositories/prisma-booking.repository';
import { PrismaTicketRepository } from '../database/repositories/prisma-ticket.repository';
import { PrismaEventRepository } from '../database/repositories/prisma-event.repository';
 
import {
  ApproveRefundCommandHandler,
  MarkRefundAsPaidOutCommandHandler,
  RejectRefundCommandHandler,
  RequestRefundCommandHandler,
} from '../../application/Refund/refund.command-handlers';
import {
  GetRefundByBookingQueryHandler,
  GetRefundsByCustomerQueryHandler,
} from '../../application/Refund/refund.query-handlers';
 
import {
  ApproveRefundCommand,
  MarkRefundAsPaidOutCommand,
  RejectRefundCommand,
  RequestRefundCommand,
} from '../../application/Refund/refund.commands';
import {
  GetRefundByBookingQuery,
  GetRefundsByCustomerQuery,
} from '../../application/Refund/refund.queries';
import { RefundDto } from '../../application/dto/refund.dto';
 
export class RefundApplicationService {
  private readonly refundRepository: PrismaRefundRepository;
  private readonly bookingRepository: PrismaBookingRepository;
  private readonly ticketRepository: PrismaTicketRepository;
  private readonly eventRepository: PrismaEventRepository;
 
  constructor(private readonly prisma: PrismaService) {
    this.refundRepository = new PrismaRefundRepository(prisma);
    this.bookingRepository = new PrismaBookingRepository(prisma);
    this.ticketRepository = new PrismaTicketRepository(prisma);
    this.eventRepository = new PrismaEventRepository(prisma);
  }

  async requestRefund(command: RequestRefundCommand): Promise<void> {
    const handler = new RequestRefundCommandHandler(
      this.refundRepository,
      this.bookingRepository,
      this.ticketRepository,
      this.eventRepository,
    );
    await handler.execute(command);
  }
 
  async approveRefund(command: ApproveRefundCommand): Promise<void> {
    const handler = new ApproveRefundCommandHandler(
      this.refundRepository,
      this.bookingRepository,
      this.ticketRepository,
    );
    await handler.execute(command);
  }
 
  async rejectRefund(command: RejectRefundCommand): Promise<void> {
    const handler = new RejectRefundCommandHandler(this.refundRepository);
    await handler.execute(command);
  }
 
  async markAsPaidOut(command: MarkRefundAsPaidOutCommand): Promise<void> {
    const handler = new MarkRefundAsPaidOutCommandHandler(this.refundRepository);
    await handler.execute(command);
  }

  async getRefundByBooking(query: GetRefundByBookingQuery): Promise<RefundDto | null> {
    const handler = new GetRefundByBookingQueryHandler(this.refundRepository);
    return handler.execute(query);
  }
 
  async getRefundsByCustomer(query: GetRefundsByCustomerQuery): Promise<RefundDto[]> {
    const handler = new GetRefundsByCustomerQueryHandler(this.refundRepository);
    return handler.execute(query);
  }
}