import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RequestRefundRequest {
  @IsUUID()
  bookingId: string;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RejectRefundRequest {
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}

export class MarkRefundAsPaidOutRequest {
  @IsString()
  @IsNotEmpty()
  paymentReference: string;
}
