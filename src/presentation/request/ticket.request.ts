import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CheckInTicketRequest {
  @IsString()
  @IsNotEmpty()
  ticketCode: string;

  @IsUUID()
  targetEventId: string;
}
