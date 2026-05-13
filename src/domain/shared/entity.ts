export abstract class Entity<Tid> {
    protected constructor(public readonly id: Tid) {}
}