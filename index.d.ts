/// <reference types="node" />
import { CrossSpawnExtra } from './core';
import Namespace = require('./core');
import { SpawnASyncReturns, SpawnASyncReturnsPromise, SpawnSyncReturns, ISpawnASyncError } from './core';
import { SpawnOptions, SpawnSyncOptions, SpawnSyncOptionsWithBufferEncoding, SpawnSyncOptionsWithStringEncoding } from "./type";
export { SpawnOptions, SpawnSyncOptions, SpawnSyncOptionsWithBufferEncoding, SpawnSyncOptionsWithStringEncoding, SpawnASyncReturns, SpawnASyncReturnsPromise, SpawnSyncReturns, ISpawnASyncError, };
/**
 * @see core.d.ts
 */
declare let crossSpawnExtra: CrossSpawnExtra<Namespace.SpawnASyncReturnsPromise<Buffer>>;
export = crossSpawnExtra;
