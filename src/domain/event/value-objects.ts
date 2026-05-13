import {ValueObject} from "../shared/value-object";
import {DomainError} from "../shared/domain-error";

export class EventSchedule extends ValueObject<{ start: Date; end: Date }> {
    private constructor(start: Date, end: Date) {
        super({start, end});
    }

    public static create(start: Date, end: Date): EventSchedule {
        if (start >= end) {
            throw new DomainError('Event start time must be before end time');
        }
        return new EventSchedule(start, end);
    }

    public get start(): Date {
        return this.props.start;
    }

    public get end(): Date {
        return this.props.end;
    }
}

export class EventCapacity extends ValueObject<{ capacity: number }> {
    private constructor(capacity: number) {
        super({capacity});
    }

    public static create(capacity: number): EventCapacity {
        if (capacity <= 0) {
            throw new DomainError('Event capacity must be greater than zero');
        }
        return new EventCapacity(capacity);
    }

    public get capacity(): number {
        return this.props.capacity;
    }
}