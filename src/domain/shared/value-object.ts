export abstract class ValueObject<T> {
    protected constructor(protected readonly props: T) {}

    public equals(other: ValueObject<T>): boolean {
        return JSON.stringify(this.props) === JSON.stringify(other.props);
    }
}