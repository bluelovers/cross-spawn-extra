/// <reference types="node" />

import * as child_process from 'child_process';
import * as stream from "stream";
import _Bluebird from 'bluebird';
import CrossSpawn from 'cross-spawn';
import {
	CrossSpawnExtra,
} from './core';

import Namespace = require('./core');

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

import _TYPE = require('./type');

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
let crossSpawnExtra = CrossSpawnExtra.use(CrossSpawn, _Bluebird);

// @ts-ignore
export = crossSpawnExtra
