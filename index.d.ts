/// <reference types="node" />
declare class KSUID {
    constructor(buffer: Buffer);
    readonly raw: Buffer;
    readonly date: Date;
    readonly timestamp: number;
    readonly payload: Buffer;
    readonly string: string;
    compare(other: KSUID): number;
    equals(other: KSUID): boolean;
    toString(): string;
    toJSON(): string;
    static random(): Promise<KSUID>;
    static random(timeInMs: number): Promise<KSUID>;
    static random(date: Date): Promise<KSUID>;
    static randomSync(): KSUID;
    static randomSync(timeInMs: number): KSUID;
    static randomSync(date: Date): KSUID;
    static fromParts(timeInMs: number, payload: Buffer): KSUID;
    static isValid(buffer: Buffer): boolean;
    static parse(str: string): KSUID;
}
export = KSUID
