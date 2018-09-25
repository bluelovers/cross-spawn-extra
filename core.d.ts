/// <reference types="node" />
import CallableInstance = require('callable-instance2');
import CrossSpawn = require('cross-spawn');
import bluebird = require('bluebird');
import * as child_process from 'child_process';
import * as stream from "stream";
import { SpawnOptions, SpawnSyncOptions, SpawnSyncOptionsWithBufferEncoding, SpawnSyncOptionsWithStringEncoding } from "./type";
export declare const SYM_CROSS_SPAWN: unique symbol;
export declare const SYM_BLUEBIRD: unique symbol;
export { SpawnOptions, SpawnSyncOptions, SpawnSyncOptionsWithBufferEncoding, SpawnSyncOptionsWithStringEncoding, };
export declare type SpawnSyncReturns<T = Buffer> = child_process.SpawnSyncReturns<T> & {
    then<R>(fn: (child: child_process.SpawnSyncReturns<T>) => R): bluebird<R>;
    error: ISpawnASyncError;
};
export declare type SpawnASyncReturns<T = Buffer> = child_process.SpawnSyncReturns<T> & child_process.ChildProcess & {
    error: ISpawnASyncError;
    status: number;
    _output?: Buffer[];
    stderrStream?: stream.Readable;
    stdoutStream?: stream.Readable;
};
export declare type SpawnASyncReturnsPromise<T = Buffer> = bluebird<SpawnASyncReturns<T>> & {
    child?: SpawnASyncReturns<T>;
};
export interface ISpawnASyncError<R = SpawnASyncReturns> extends Error {
    message: string;
    code?: string;
    errno?: string;
    syscall?: string;
    path?: string;
    spawnargs?: string[];
    child?: R;
}
interface CallableInstance<R = SpawnASyncReturnsPromise> {
    (command: string, args?: string[], options?: SpawnOptions): SpawnASyncReturnsPromise;
    <T = Buffer>(command: string, args?: string[], options?: SpawnOptions): SpawnASyncReturnsPromise<T>;
    <T = Buffer>(command: string, args?: any[], options?: SpawnOptions): SpawnASyncReturnsPromise<T>;
    <T = Buffer>(command: string, args?: any[]): SpawnASyncReturnsPromise<T>;
    <T = Buffer>(command: string): SpawnASyncReturnsPromise<T>;
    (command: string, args?: string[], options?: SpawnOptions): SpawnASyncReturnsPromise;
    (command: string, args?: any[], options?: SpawnOptions): SpawnASyncReturnsPromise;
    (command: string, args?: any[]): SpawnASyncReturnsPromise;
    (command: string): SpawnASyncReturnsPromise;
    <T = Buffer>(...argv: any[]): SpawnASyncReturnsPromise<T>;
    (...argv: any[]): SpawnASyncReturnsPromise;
}
export declare class CrossSpawnExtra<R = SpawnASyncReturnsPromise> extends CallableInstance<R> {
    protected readonly [SYM_CROSS_SPAWN]: typeof CrossSpawn;
    protected readonly [SYM_BLUEBIRD]: typeof bluebird;
    readonly default: this;
    constructor(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise);
    static use(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise): CrossSpawnExtra;
    static use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise): CrossSpawnExtra<R>;
    static use(cs?: any, p?: any): CrossSpawnExtra;
    static use<R = SpawnASyncReturnsPromise>(cs?: any, p?: any): CrossSpawnExtra<R>;
    use(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise): CrossSpawnExtra;
    use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise): CrossSpawnExtra<R>;
    use(cs?: any, p?: any): CrossSpawnExtra;
    use<R = SpawnASyncReturnsPromise>(cs?: any, p?: any): CrossSpawnExtra<R>;
    core<T>(command: string, args?: string[], options?: SpawnOptions): child_process.ChildProcess;
    core<T>(...argv: any[]): child_process.ChildProcess;
    sync(command: string): SpawnSyncReturns<Buffer>;
    sync(command: string, options?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>;
    sync(command: string, options?: SpawnSyncOptionsWithBufferEncoding): SpawnSyncReturns<Buffer>;
    sync(command: string, options?: SpawnSyncOptions): SpawnSyncReturns<Buffer>;
    sync(command: string, args?: ReadonlyArray<string>, options?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>;
    sync(command: string, args?: ReadonlyArray<string>, options?: SpawnSyncOptionsWithBufferEncoding): SpawnSyncReturns<Buffer>;
    sync(command: string, args?: ReadonlyArray<string>, options?: SpawnSyncOptions): SpawnSyncReturns<Buffer>;
    sync<T = Buffer>(...argv: any[]): SpawnSyncReturns<T>;
    async<T = Buffer>(command: string, args?: string[], options?: SpawnOptions): SpawnASyncReturnsPromise<T>;
    async<T = Buffer>(...argv: any[]): SpawnASyncReturnsPromise<T>;
    static stripAnsi(input: Buffer, toStr: true): string;
    static stripAnsi(input: Buffer, toStr?: boolean): Buffer;
    static stripAnsi(input: string, toStr?: boolean): string;
    static stripAnsi<T>(input: T, toStr: true): string;
    static stripAnsi<T>(input: T, toStr?: boolean): T;
}
export default CrossSpawnExtra;
