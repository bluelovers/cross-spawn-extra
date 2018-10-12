"use strict";
/**
 * Created by user on 2018/9/25/025.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const CallableInstance = require("callable-instance2");
const CrossSpawn = require("cross-spawn");
const bluebird = require("bluebird");
const stripAnsi = require("strip-ansi");
exports.SYM_CROSS_SPAWN = Symbol('cross-spawn');
exports.SYM_BLUEBIRD = Symbol('bluebird');
class CrossSpawnExtra extends CallableInstance {
    /**
     * create new CrossSpawnExtra with Custom CrossSpawn, Promise
     */
    constructor(cs, p) {
        super('async');
        this.default = this;
        this.spawnSync = this.sync;
        this.spawn = this.async;
        this[exports.SYM_CROSS_SPAWN] = cs || CrossSpawn;
        // @ts-ignore
        this[exports.SYM_BLUEBIRD] = p || bluebird;
        [
            'core',
            'async',
            'sync',
        ].forEach(name => this[name] = this[name].bind(this));
    }
    sync(...argv) {
        // @ts-ignore
        let child = this[exports.SYM_CROSS_SPAWN].sync(...argv);
        child.then = bluebird.method((fn) => fn(child));
        let [command, args, options] = argv;
        if (options && options.stripAnsi) {
            child.stderr = CrossSpawnExtra.stripAnsi(child.stderr);
            child.stdout = CrossSpawnExtra.stripAnsi(child.stdout);
        }
        return child;
    }
    async(...argv) {
        let self = this;
        let cache = {
            output: [],
            stdout: [],
            stderr: [],
        };
        let child;
        let fn = self[exports.SYM_CROSS_SPAWN];
        let ret = bluebird.resolve();
        let [command, args, options] = argv;
        // @ts-ignore
        child = fn(...argv);
        // @ts-ignore
        ret.child = child;
        child.stderrStream = child.stderr;
        child.stdoutStream = child.stdout;
        // @ts-ignore
        ret = ret.thenReturn(new bluebird(function (resolve, reject) {
            // @ts-ignore
            ret.child = child;
            [
                'stderr',
                'stdout',
            ].forEach(function (std) {
                if (child[std]) {
                    child[std].on('data', function (buf) {
                        cache[std].push(buf);
                        cache.output.push(buf);
                    });
                }
            });
            child.on('close', function (...argv) {
                child.status = argv[0];
                done('close');
                //console.debug(child.pid, 'close', argv);
            });
            child.on('exit', function (...argv) {
                child.status = argv[0];
                done('exit');
                //console.debug(child.pid, 'exit', argv);
            });
            child.on('error', function (error) {
                child.error = error;
                //done('error');
            });
            function done(event) {
                //console.log(event, child.error);
                let stderr = Buffer.concat(cache.stderr);
                let stdout = Buffer.concat(cache.stdout);
                if (options && options.stripAnsi) {
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
                if (child.error) {
                    // @ts-ignore
                    child.error.child = child;
                }
                if (child.error) {
                    reject(child.error);
                }
                else {
                    resolve(child);
                }
            }
        })
            .tapCatch((e) => {
            if (e) {
                e.child = child;
            }
        }));
        // @ts-ignore
        ret.child = child;
        // @ts-ignore
        return ret;
    }
    static use(cs, p) {
        return new this(cs, p);
    }
    use(cs, p) {
        return new CrossSpawnExtra(cs, p);
    }
    core(...argv) {
        // @ts-ignore
        return this[exports.SYM_CROSS_SPAWN](...argv);
    }
    get coreSync() {
        return this[exports.SYM_CROSS_SPAWN].sync;
    }
    static stripAnsi(input, toStr) {
        let isBuffer = Buffer.isBuffer(input);
        input = input.toString();
        input = stripAnsi(input);
        if (isBuffer && !toStr) {
            return Buffer.from(input);
        }
        return input;
    }
}
exports.CrossSpawnExtra = CrossSpawnExtra;
exports.default = CrossSpawnExtra;
