import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateEventRequest {
  @IsUUID()
  organizerId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsInt()
  @Min(1)
  maxCapacity: number;
}

export class CreateTicketCategoryRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsInt()
  @Min(1)
  quota: number;

  @Type(() => Date)
  @IsDate()
  salesStart: Date;

  @Type(() => Date)
  @IsDate()
  salesEnd: Date;
}

export class GetPublishedEventsRequest {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
