/**
 * Created by user on 2018/9/25/025.
 */

i = 0;

console.log('log', i++);

console.error('error', i++);

console.log('log', i++);

console.warn('warn', i++);

console.log('log', i++);

console.debug('debug', i++);

console.log('log', i++);

throw new Error();

console.info('info', i++);

console.log('log', i++);

process.exit(99);
