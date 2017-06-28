/// <reference types="node" />
export declare class KSUID {
    constructor(buffer: Buffer);
    readonly date: Date;
    readonly timestamp: number;
    readonly payload: Buffer;
    readonly string: string;
    compare(other: KSUID): number;
    equals(other: KSUID): boolean;
    toString(): string;
    static random(): Promise<KSUID>;
    static randomSync(): KSUID;
    static fromParts(timeInMs: number, payload: Buffer): KSUID;
    static isValid(buffer: Buffer): boolean;
    static parse(str: string): KSUID;
}
