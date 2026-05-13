import { ValueObject } from './value-object';

export class IdVO extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value: string): IdVO {
    if (!value || value.trim().length === 0) {
      throw new Error('Id cannot be empty');
    }
    return new IdVO(value);
  }

  public get value(): string {
    return this.props.value;
  }
}