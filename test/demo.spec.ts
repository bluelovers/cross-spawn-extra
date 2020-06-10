import crossSpawn, { async as _async, sync as _sync } from '../index';
import * as crossSpawn2 from '../index';

describe(`async`, () =>
{

	test(`default`, async (done) =>
	{
		let actual = await crossSpawn('echo', ['777']);

		_check(actual)

		done();
	});

	test(`base`, async (done) =>
	{

		let actual = await crossSpawn.async('echo', ['777']);

		_check(actual)

		done();
	});

	test(`_async`, async (done) =>
	{

		let actual = await _async('echo', ['777']);

		_check(actual)

		done();
	});

	test(`star`, async (done) =>
	{

		// @ts-ignore
		let actual = await crossSpawn2.async('echo', ['777']);

		_check(actual)

		done();
	});

	test(`unbind`, async (done) =>
	{
		const fn = crossSpawn.async;

		let actual = await fn('echo', ['777']);

		_check(actual)

		done();
	});

	function _check(actual)
	{
		expect(actual._output).toHaveLength(1)
		expect(actual.output).toHaveLength(3)

		let buf = Buffer.concat(actual._output);

		expect(actual._output[0]).toBeInstanceOf(Buffer);
		expect(actual.stdout).toBeInstanceOf(Buffer);

		expect(actual.output.filter(v => v?.length)).toStrictEqual(actual._output);
		expect(actual.stdout).toStrictEqual(buf);

		const { _output, output, stdout, stderr, exitCode, killed } = actual;

		expect({ _output, output, stdout, stderr, exitCode, killed }).toMatchSnapshot();
	}
})

describe(`sync`, () =>
{

	test(`base`, () =>
	{

		let actual = crossSpawn.sync('echo', ['777']);

		_check(actual)
	});

	test(`_sync`, () =>
	{

		let actual = _sync('echo', ['777']);

		_check(actual)
	});

	test(`star`, () =>
	{

		// @ts-ignore
		let actual = crossSpawn2.sync('echo', ['777']);

		_check(actual)
	});

	test(`unbind`, () =>
	{
		const fn = crossSpawn.sync;

		let actual = fn('echo', ['777']);

		_check(actual)
	});

	function _check(actual)
	{
		expect(actual.output).toHaveLength(3)

		expect(actual.stdout).toBeInstanceOf(Buffer);
		expect(Buffer.concat(actual.output.filter(v => v?.length))).toStrictEqual(actual.stdout);

		const { output, stdout, stderr } = actual;

		expect({ output, stdout, stderr }).toMatchSnapshot();
	}

})
