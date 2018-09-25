import CrossSpawnExtra, { ISpawnASyncError } from '../core';

//let c = CrossSpawnExtra.use().sync('echo2', [
//		//'',
//	], {
////	stdio: 'inherit',
//	})
//	.then(function (child)
//	{
//		console.log(child);
//	})
//;

let a = CrossSpawnExtra.use().async('echo2', [
		//'',
	], {
//	stdio: 'inherit',
	})
	;

console.log(a.child);

a
	.then(function (child)
	{
		console.log(666, child);
	})
	.catch(function (e: ISpawnASyncError,)
	{
		console.error(777, e);
	})
;


//console.log(c);
