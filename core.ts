/**
 * Created by user on 2018/9/25/025.
 */

// @ts-ignore
import CallableInstance = require('callable-instance2');
import CrossSpawn = require('cross-spawn');
import Bluebird = require('bluebird');
import child_process = require('child_process');
import stream = require('stream');
import stripAnsi = require('strip-ansi');

export { Bluebird }

import {
	SpawnOptions,
	SpawnSyncOptions,
	SpawnSyncOptionsWithBufferEncoding,
	SpawnSyncOptionsWithStringEncoding,
} from "./type";

export const SYM_CROSS_SPAWN = Symbol('cross-spawn');
export const SYM_BLUEBIRD = Symbol('bluebird');

export {
	SpawnOptions,
	SpawnSyncOptions,
	SpawnSyncOptionsWithBufferEncoding,
	SpawnSyncOptionsWithStringEncoding,
}

export type SpawnSyncReturns<T = Buffer> = child_process.SpawnSyncReturns<T> & {

	/**
	 * fake async api, this not same as async return
	 */
	then<R>(fn: (child: child_process.SpawnSyncReturns<T>) => R): Bluebird<R>,

	error: ISpawnASyncError,
};

export type SpawnASyncReturns<T = Buffer> = child_process.SpawnSyncReturns<T> & child_process.ChildProcess & {

	error: ISpawnASyncError,
	status: number,

	/**
	 * a buffer list by realy order of output (include stdout , stderr)
	 */
	_output?: Buffer[],

	/**
	 * source stderr stream
	 */
	stderrStream?: stream.Readable,
	/**
	 * source stdout stream
	 */
	stdoutStream?: stream.Readable,
};

export type SpawnASyncReturnsPromise<T = Buffer> = Bluebird<SpawnASyncReturns<T>> & {

	/**
	 * can do anything as u want like source spawn do
	 */
	child?: SpawnASyncReturns<T>,

};

/**
 * Error Class
 */
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

interface CallableInstance<R = SpawnASyncReturnsPromise>
{
	(command: string, args?: string[], options?: SpawnOptions): SpawnASyncReturnsPromise
	<T = Buffer>(command: string, args?: string[], options?: SpawnOptions): SpawnASyncReturnsPromise<T>
	<T = Buffer>(command: string, args?: any[], options?: SpawnOptions): SpawnASyncReturnsPromise<T>
	<T = Buffer>(command: string, args?: any[]): SpawnASyncReturnsPromise<T>
	<T = Buffer>(command: string): SpawnASyncReturnsPromise<T>

	(command: string, args?: string[], options?: SpawnOptions): SpawnASyncReturnsPromise
	(command: string, args?: any[], options?: SpawnOptions): SpawnASyncReturnsPromise
	(command: string, args?: any[]): SpawnASyncReturnsPromise
	(command: string): SpawnASyncReturnsPromise

	<T = Buffer>(...argv): SpawnASyncReturnsPromise<T>
	(...argv): SpawnASyncReturnsPromise
}

export class CrossSpawnExtra<R = SpawnASyncReturnsPromise> extends CallableInstance<R>
{
	protected readonly [SYM_CROSS_SPAWN]: typeof CrossSpawn;
	protected readonly [SYM_BLUEBIRD]: typeof Bluebird;

	public readonly default = this;

	/**
	 * sync version of child_process.spawnSync(command[, args][, options])
	 */
	sync(command: string): SpawnSyncReturns<Buffer>;
	sync(command: string, options?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>;
	sync(command: string, options?: SpawnSyncOptionsWithBufferEncoding): SpawnSyncReturns<Buffer>;
	sync(command: string, options?: SpawnSyncOptions): SpawnSyncReturns<Buffer>;
	sync(command: string, args?: Array<string>, options?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>;
	sync(command: string, args?: Array<string>, options?: SpawnSyncOptionsWithBufferEncoding): SpawnSyncReturns<Buffer>;
	sync(command: string, args?: Array<string>, options?: SpawnSyncOptions): SpawnSyncReturns<Buffer>;
	sync<T = Buffer>(...argv): SpawnSyncReturns<T>
	sync<T = Buffer>(...argv): SpawnSyncReturns<T>
	{
		// @ts-ignore
		let child = this[SYM_CROSS_SPAWN].sync<T>(...argv);
		child.then = Bluebird.method((fn) => {
			delete child.then;
			return fn(child)
		});

		let [command, args, options] = argv;

		if (options && options.stripAnsi)
		{
			child.stderr = child.stderr && CrossSpawnExtra.stripAnsi(child.stderr);
			child.stdout = child.stdout && CrossSpawnExtra.stripAnsi(child.stdout);
		}

		return child;
	}

	/**
	 * async version of child_process.spawn(command[, args][, options])
	 */
	async<T = Buffer>(command: string, args?: string[], options?: SpawnOptions): SpawnASyncReturnsPromise<T>
	async<T = Buffer>(command: string, args?: any[], options?: SpawnOptions): SpawnASyncReturnsPromise<T>
	async<T = Buffer>(...argv): SpawnASyncReturnsPromise<T>
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

		let ret = Bluebird.resolve();

		let [command, args, options] = argv;

		// @ts-ignore
		child = fn(...argv);
		// @ts-ignore
		ret.child = child;

		child.stderrStream = child.stderr;
		child.stdoutStream = child.stdout;

		// @ts-ignore
		ret = ret.thenReturn(new Bluebird<SpawnASyncReturns<T>>(function (resolve, reject)
		{
			// @ts-ignore
			ret.child = child;

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

				if (options && options.stripAnsi)
				{
					stderr = CrossSpawnExtra.stripAnsi(stderr);
					stdout = CrossSpawnExtra.stripAnsi(stdout);
				}

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

	spawnSync = this.sync;
	spawn = this.async;

	/**
	 * create new CrossSpawnExtra with Custom CrossSpawn, Promise
	 */
	constructor(cs?: typeof CrossSpawn, p?: typeof Bluebird | typeof Promise)
	{
		super('async');

		this[SYM_CROSS_SPAWN] = cs || CrossSpawn;
		// @ts-ignore
		this[SYM_BLUEBIRD] = p || Bluebird;

		[
			'core',
			'async',
			'sync',
		].forEach(name => this[name] = this[name].bind(this));
	}

	/**
	 * create new CrossSpawnExtra with Custom CrossSpawn, Promise
	 */
	static use(cs?: typeof CrossSpawn, p?: typeof Bluebird | typeof Promise): CrossSpawnExtra
	static use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof Bluebird | typeof Promise): CrossSpawnExtra<R>
	static use(cs?, p?): CrossSpawnExtra
	static use<R = SpawnASyncReturnsPromise>(cs?, p?): CrossSpawnExtra<R>
	static use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof Bluebird | typeof Promise)
	{
		return new this<R>(cs, p)
	}

	/**
	 * create new CrossSpawnExtra with Custom CrossSpawn, Promise
	 */
	use(cs?: typeof CrossSpawn, p?: typeof Bluebird | typeof Promise): CrossSpawnExtra
	use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof Bluebird | typeof Promise): CrossSpawnExtra<R>
	use(cs?, p?): CrossSpawnExtra
	use<R = SpawnASyncReturnsPromise>(cs?, p?): CrossSpawnExtra<R>
	use<R = SpawnASyncReturnsPromise>(cs?: typeof CrossSpawn, p?: typeof Bluebird | typeof Promise)
	{
		return new CrossSpawnExtra<R>(cs, p)
	}

	core<T>(command: string, args?: string[], options?: SpawnOptions): child_process.ChildProcess
	core<T>(...argv): child_process.ChildProcess
	core<T>(...argv): child_process.ChildProcess
	{
		// @ts-ignore
		return this[SYM_CROSS_SPAWN](...argv);
	}

	get coreSync()
	{
		return this[SYM_CROSS_SPAWN].sync;
	}

	/**
	 * stripAnsi a Buffer or string
	 */
	static stripAnsi(input: Buffer, toStr: true): string
	static stripAnsi(input: Buffer, toStr?: boolean): Buffer
	static stripAnsi(input: string, toStr?: boolean): string
	static stripAnsi<T>(input: T, toStr: true): string
	static stripAnsi<T>(input: T, toStr?: boolean): T
	static stripAnsi(input: string | Buffer, toStr?: boolean)
	{
		if (!input)
		{
			return input;
		}

		let isBuffer = Buffer.isBuffer(input);

		input = input.toString();

		input = stripAnsi(input);

		if (isBuffer && !toStr)
		{
			return Buffer.from(input);
		}

		return input;
	}
}

export default CrossSpawnExtra;
