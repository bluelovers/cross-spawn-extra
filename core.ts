/**
 * Created by user on 2018/9/25/025.
 */

import CallableInstance = require('callable-instance2');
import CrossSpawn = require('cross-spawn');
import bind from 'bind-decorator';
import { SpawnOptions } from "child_process";
import bluebird = require('bluebird');
import * as child_process from 'child_process';
import * as stream from "stream";

export const SYM_CROSS_SPAWN = Symbol('cross-spawn');
export const SYM_BLUEBIRD = Symbol('bluebird');

export type SpawnSyncReturns<T = Buffer> = child_process.SpawnSyncReturns<T> & {
	then<R>(fn: (child: child_process.SpawnSyncReturns<T>) => R): bluebird<R>,
	error: ISpawnASyncError,
};

export type SpawnASyncReturns<T = Buffer> = child_process.SpawnSyncReturns<T> & child_process.ChildProcess & {

	error: ISpawnASyncError,
	status: number,

	_output?: Buffer[],

	stderrOld?: stream.Readable,
	stdoutOld?: stream.Readable,
};

export type SpawnASyncReturnsPromise<T = Buffer> = bluebird<SpawnASyncReturns<T>> & {

	child?: SpawnASyncReturns<T>,

};

export interface ISpawnASyncError<R = SpawnASyncReturns> extends Error
{
	message: string,
	code?: string,
	errno?: string,
	syscall?: string,
	path?: string,
	spawnargs?: string[],
	child?: R,
}

export class CrossSpawnExtra<R = SpawnASyncReturnsPromise> extends CallableInstance<R>
{
	protected readonly [SYM_CROSS_SPAWN]: typeof CrossSpawn;
	protected readonly [SYM_BLUEBIRD]: typeof bluebird;

	public readonly default = this;

	constructor(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise)
	{
		super('async');

		this[SYM_CROSS_SPAWN] = cs || CrossSpawn;
		// @ts-ignore
		this[SYM_BLUEBIRD] = p || bluebird;

		[
			'core',
			'async',
			'sync',
		].forEach(name => this[name] = this[name].bind(this));
	}

	static use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise)
	{
		return new this<R>(cs, p)
	}

	use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof bluebird | typeof Promise)
	{
		return new CrossSpawnExtra<R>(cs, p)
	}

	core<T>(...argv): child_process.ChildProcess
	{
		// @ts-ignore
		return this[SYM_CROSS_SPAWN](...argv);
	}

	sync<T = Buffer>(...argv): SpawnSyncReturns<T>
	{
		// @ts-ignore
		let ret = this[SYM_CROSS_SPAWN].sync<T>(...argv);
		ret.then = bluebird.method((fn) => fn(ret));
		return ret;
	}

	async<T = Buffer>(...argv): SpawnASyncReturnsPromise<T>
	{
		let self = this;

		let cache = {
			output: [] as Buffer[],
			stdout: [] as Buffer[],
			stderr: [] as Buffer[],
		};

		let child: SpawnASyncReturns<T>;
		let fn = self[SYM_CROSS_SPAWN] as typeof CrossSpawn;

		let ret = bluebird.resolve();

		// @ts-ignore
		child = fn(...argv);
		// @ts-ignore
		ret.child = child;

		// @ts-ignore
		ret = ret.thenReturn(new bluebird<SpawnASyncReturns<T>>(function (resolve, reject)
		{
			// @ts-ignore
			ret.child = child;

			child.stderrOld = child.stderr;
			child.stdoutOld = child.stdout;

			[
				'stderr',
				'stdout',
			].forEach(function (std)
			{
				if (child[std])
				{
					child[std].on('data', function (buf)
					{
						cache[std].push(buf);
						cache.output.push(buf);
					});
				}
			});

			child.on('close', function (...argv)
			{
				child.status = argv[0];

				done('close');

				//console.debug(child.pid, 'close', argv);
			});

			child.on('exit', function (...argv)
			{
				child.status = argv[0];

				done('exit');

				//console.debug(child.pid, 'exit', argv);
			});

			child.on('error', function (error)
			{
				child.error = error;
				//done('error');
			});

			function done(event?: string)
			{
				//console.log(event, child.error);

				let stderr = Buffer.concat(cache.stderr);
				let stdout = Buffer.concat(cache.stdout);

				// @ts-ignore
				child.stderr = stderr;
				// @ts-ignore
				child.stdout = stdout;
				// @ts-ignore
				child.output = [null, stdout, stderr];

				// @ts-ignore
				child._output = cache.output;

				if (child.error)
				{
					// @ts-ignore
					child.error.child = child;
				}

				if (child.error)
				{
					reject(child.error);
				}
				else
				{
					resolve(child);
				}
			}
		})
			.tapCatch((e: ISpawnASyncError<SpawnASyncReturns<T>>) => {
				if (e)
				{
					e.child = child;
				}
			})
		)
		;

		// @ts-ignore
		ret.child = child;

		// @ts-ignore
		return ret;
	}
}

export default CrossSpawnExtra;
