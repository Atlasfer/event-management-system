import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RefundApplicationService } from '../../infrastructure/services/refund-application.service';
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
import {
  MarkRefundAsPaidOutRequest,
  RejectRefundRequest,
  RequestRefundRequest,
} from '../request/refund.request';

@Controller('refunds')
export class RefundController {
  constructor(private readonly refundService: RefundApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() request: RequestRefundRequest,
  ): Promise<{ refundId: string }> {
    const refundId = randomUUID();

    const command = new RequestRefundCommand(
      refundId,
      request.bookingId,
      request.customerId,
      request.reason ?? null,
    );

    await this.refundService.requestRefund(command);

    return { refundId };
  }

  @Get('booking/:bookingId')
  async getByBooking(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    const query = new GetRefundByBookingQuery(bookingId);
    return this.refundService.getRefundByBooking(query);
  }

  @Get('customer/:customerId')
  async getByCustomer(@Param('customerId', ParseUUIDPipe) customerId: string) {
    const query = new GetRefundsByCustomerQuery(customerId);
    return this.refundService.getRefundsByCustomer(query);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ status: string }> {
    await this.refundService.approveRefund(new ApproveRefundCommand(id));
    return { status: 'approved' };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() request: RejectRefundRequest,
  ): Promise<{ status: string }> {
    const command = new RejectRefundCommand(id, request.rejectionReason);
    await this.refundService.rejectRefund(command);
    return { status: 'rejected' };
  }

  @Post(':id/paid-out')
  @HttpCode(HttpStatus.OK)
  async markAsPaidOut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() request: MarkRefundAsPaidOutRequest,
  ): Promise<{ status: string }> {
    const command = new MarkRefundAsPaidOutCommand(
      id,
      request.paymentReference,
    );
    await this.refundService.markAsPaidOut(command);
    return { status: 'paidOut' };
  }
}
