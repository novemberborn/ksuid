/// <reference types="node" />
export declare class KSUID {
    constructor(buffer: any);
    readonly date: Date;
    readonly timestamp: number;
    readonly payload: Buffer;
    readonly string: string;
    compare(other: KSUID): any;
    equals(other: KSUID): boolean;
    toString(): string;
    static random(): Promise<KSUID>;
    static randomSync(): KSUID;
    static fromParts(timeInMs: any, payload: any): KSUID;
    static isValid(buffer: Buffer): boolean;
    static parse(str: string): KSUID;
}
