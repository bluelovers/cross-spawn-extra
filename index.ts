/// <reference types="node" />

import * as child_process from 'child_process';
import * as stream from "stream";
import bluebird = require('bluebird');
import CrossSpawn = require('cross-spawn');
import {
	CrossSpawnExtra,
} from './core';

import {
	SpawnASyncReturns,
	SpawnASyncReturnsPromise,
	SpawnSyncReturns,
	ISpawnASyncError,
} from './core';

import {
	SpawnOptions,
	SpawnSyncOptions,
	SpawnSyncOptionsWithBufferEncoding,
	SpawnSyncOptionsWithStringEncoding,
} from "./type";

export {
	SpawnOptions,
	SpawnSyncOptions,
	SpawnSyncOptionsWithBufferEncoding,
	SpawnSyncOptionsWithStringEncoding,

	SpawnASyncReturns,
	SpawnASyncReturnsPromise,
	SpawnSyncReturns,
	ISpawnASyncError,
}

/**
 * @see core.d.ts
 */
const crossSpawnExtra = CrossSpawnExtra.use(CrossSpawn, bluebird);

// @ts-ignore
export = crossSpawnExtra
