import { ValueObject } from './value-object';

export class Money extends ValueObject<{ amount: number; currency: string }> {
  private constructor(amount: number, currency: string) {
    super({ amount, currency });
  }

  public static create(amount: number, currency: string = 'IDR'): Money {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }

    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }

    return new Money(amount, currency);
  }

  public multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return Money.create(this.amount * multiplier, this.currency);
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  public get amount(): number {
    return this.props.amount;
  }

  public get currency(): string {
    return this.props.currency;
  }
}