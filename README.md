# README

    a async version for cross-spawn and make it return like as sync return

```
npm install cross-spawn-extra cross-spawn
```

## demo

[index.d.ts](index.d.ts)
[core.d.ts](core.d.ts)

```ts
import crossSpawn = require('cross-spawn-extra');
import crossSpawn from 'cross-spawn-extra';
import { async as crossSpawnAsync, sync as crossSpawnSync } from 'cross-spawn-extra';
```

```ts
import { CrossSpawn } = require('cross-spawn-extra/core');
import CrossSpawn from 'cross-spawn-extra';
import { CrossSpawn } from 'cross-spawn-extra';

//----------

const crossSpawn = new CrossSpawn(require('cross-spawn'));
const crossSpawn = CrossSpawn.use(require('cross-spawn'));
```

```ts
let bin = './bin/log0001';

let cp = crossSpawn('node', [
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
	
	// can still via stream, but it already close
	let { stderrStream, stdoutStream } = child;

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
```

`stdout` only show stdout  
`stderr` only show stderr

but `_output` can show real output order

```json5
{ pid: 54268,
  error: false,
  status: 0,
  stdout: 'log 0\nlog 2\nlog 4\ndebug 5\nlog 6\ninfo 7\nlog 8\n',
  stderr: 'error 1\nwarn 3\n',
  _output:
   'log 0\nerror 1\nlog 2\nwarn 3\nlog 4\ndebug 5\nlog 6\ninfo 7\nlog 8\n' }
```
