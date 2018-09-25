"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CallableInstance = require("callable-instance2");
const CrossSpawn = require("cross-spawn");
const bluebird = require("bluebird");
exports.SYM_CROSS_SPAWN = Symbol('cross-spawn');
exports.SYM_BLUEBIRD = Symbol('bluebird');
class CrossSpawnExtra extends CallableInstance {
    constructor(cs, p) {
        super('async');
        this.default = this;
        this[exports.SYM_CROSS_SPAWN] = cs || CrossSpawn;
        this[exports.SYM_BLUEBIRD] = p || bluebird;
        [
            'core',
            'async',
            'sync',
        ].forEach(name => this[name] = this[name].bind(this));
    }
    static use(cs, p) {
        return new this(cs, p);
    }
    use(cs, p) {
        return new CrossSpawnExtra(cs, p);
    }
    core(...argv) {
        return this[exports.SYM_CROSS_SPAWN](...argv);
    }
    sync(...argv) {
        let ret = this[exports.SYM_CROSS_SPAWN].sync(...argv);
        ret.then = bluebird.method((fn) => fn(ret));
        return ret;
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
        child = fn(...argv);
        ret.child = child;
        ret = ret.thenReturn(new bluebird(function (resolve, reject) {
            ret.child = child;
            child.stderrOld = child.stderr;
            child.stdoutOld = child.stdout;
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
            });
            child.on('exit', function (...argv) {
                child.status = argv[0];
                done('exit');
            });
            child.on('error', function (error) {
                child.error = error;
            });
            function done(event) {
                let stderr = Buffer.concat(cache.stderr);
                let stdout = Buffer.concat(cache.stdout);
                child.stderr = stderr;
                child.stdout = stdout;
                child.output = [null, stdout, stderr];
                child._output = cache.output;
                if (child.error) {
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
        ret.child = child;
        return ret;
    }
}
exports.CrossSpawnExtra = CrossSpawnExtra;
exports.default = CrossSpawnExtra;
