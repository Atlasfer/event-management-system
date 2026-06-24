import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateBookingRequest {
  @IsUUID()
  customerId: string;

  @IsUUID()
  eventId: string;

  @IsUUID()
  categoryId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class PayBookingRequest {
  @IsNumber()
  @IsPositive()
  paymentAmount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
