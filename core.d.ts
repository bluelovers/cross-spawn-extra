/// <reference types="node" />
import CallableInstance = require('callable-instance2');
import CrossSpawn = require('cross-spawn');
import bluebird = require('bluebird');
import * as child_process from 'child_process';
import * as stream from "stream";
export declare const SYM_CROSS_SPAWN: unique symbol;
export declare const SYM_BLUEBIRD: unique symbol;
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
export declare class CrossSpawnExtra<R = SpawnASyncReturnsPromise> extends CallableInstance<R> {
    protected readonly [SYM_CROSS_SPAWN]: typeof CrossSpawn;
    protected readonly [SYM_BLUEBIRD]: typeof bluebird;
    readonly default: this;
    constructor(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise);
    static use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise): CrossSpawnExtra<R>;
    use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise): CrossSpawnExtra<R>;
    core<T>(...argv: any[]): child_process.ChildProcess;
    sync<T = Buffer>(...argv: any[]): SpawnSyncReturns<T>;
    async<T = Buffer>(...argv: any[]): SpawnASyncReturnsPromise<T>;
}
export default CrossSpawnExtra;
