/**
 * Created by user on 2018/9/25/025.
 */

//import crossSpawn = require('../index');
import crossSpawn from '../index';
import { SpawnASyncReturns } from '../core';

let bin = './bin/log0001';

let cp = crossSpawn.async('node', [
		bin,
], {
	cwd: __dirname,
	stdio: 'inherit'
})
	.then(function (child)
	{
		let { stdout, stderr, output, _output } = child;

		return log(child);
	})
	.catch(function (err)
	{
		let child = err.child;

		return log(child);
	})
;

bin = './bin/err0001';

cp = crossSpawn('node', [
	bin,
	], {
		cwd: __dirname,
	})
	.then(function (child)
	{
		return log(child);
	})
	.catch(function (err)
	{
		let child = err.child;

		return log(child);
	})
;

bin = './bin/err0002';

cp = crossSpawn('node', [
	bin,
], {
	cwd: __dirname,
})
	.then(function (child)
	{
		return log(child);
	})
	.catch(function (err)
	{
		let child = err.child;

		return log(child);
	})
;

function log(child: SpawnASyncReturns)
{
	let { stdout, stderr, output, _output, status, signal, pid } = child;

	console.log({
		pid,
		error: !!child.error,
		status,
		stdout: stdout.toString(),
		stderr: stderr.toString(),
		_output: Buffer.concat(_output).toString(),
	});

	return child;
}
