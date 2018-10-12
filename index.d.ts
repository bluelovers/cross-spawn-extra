/// <reference types="node" />
import { CrossSpawnExtra } from './core';
import { SpawnASyncReturns, SpawnASyncReturnsPromise, SpawnSyncReturns, ISpawnASyncError } from './core';
import { SpawnOptions, SpawnSyncOptions, SpawnSyncOptionsWithBufferEncoding, SpawnSyncOptionsWithStringEncoding } from "./type";
export { SpawnOptions, SpawnSyncOptions, SpawnSyncOptionsWithBufferEncoding, SpawnSyncOptionsWithStringEncoding, SpawnASyncReturns, SpawnASyncReturnsPromise, SpawnSyncReturns, ISpawnASyncError, };
/**
 * @see core.d.ts
 */
declare const crossSpawnExtra: CrossSpawnExtra<SpawnASyncReturnsPromise<Buffer>>;
export = crossSpawnExtra;
