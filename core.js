"use strict";
/**
 * Created by user on 2018/9/25/025.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const CallableInstance = require("callable-instance2");
const CrossSpawn = require("cross-spawn");
const Bluebird = require("bluebird");
exports.Bluebird = Bluebird;
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
        this[exports.SYM_BLUEBIRD] = p || Bluebird;
        [
            'core',
            'async',
            'sync',
        ].forEach(name => this[name] = this[name].bind(this));
    }
    sync(...argv) {
        // @ts-ignore
        let child = this[exports.SYM_CROSS_SPAWN].sync(...argv);
        child.then = Bluebird.method((fn) => {
            delete child.then;
            return fn(child);
        });
        let [command, args, options] = argv;
        if (options && options.stripAnsi) {
            child.stderr = child.stderr && CrossSpawnExtra.stripAnsi(child.stderr);
            child.stdout = child.stdout && CrossSpawnExtra.stripAnsi(child.stdout);
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
        let ret = Bluebird.resolve();
        let [command, args, options] = argv;
        // @ts-ignore
        child = fn(...argv);
        // @ts-ignore
        ret.child = child;
        child.stderrStream = child.stderr;
        child.stdoutStream = child.stdout;
        // @ts-ignore
        ret = ret.thenReturn(new Bluebird(function (resolve, reject) {
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
        if (!input) {
            return input;
        }
        let isBuffer = Buffer.isBuffer(input);
        input = input.toString();
        // @ts-ignore
        input = stripAnsi(input);
        if (isBuffer && !toStr) {
            return Buffer.from(input);
        }
        return input;
    }
}
exports.CrossSpawnExtra = CrossSpawnExtra;
exports.default = CrossSpawnExtra;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILGFBQWE7QUFDYix1REFBd0Q7QUFDeEQsMENBQTJDO0FBQzNDLHFDQUFzQztBQUs3Qiw0QkFBUTtBQUZqQix3Q0FBeUM7QUFXNUIsUUFBQSxlQUFlLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3hDLFFBQUEsWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQWdGL0MsTUFBYSxlQUE4QyxTQUFRLGdCQUFtQjtJQTRLckY7O09BRUc7SUFDSCxZQUFZLEVBQXNCLEVBQUUsQ0FBb0M7UUFFdkUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBNUtBLFlBQU8sR0FBRyxJQUFJLENBQUM7UUFvSy9CLGNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLFVBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBU2xCLElBQUksQ0FBQyx1QkFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLFVBQVUsQ0FBQztRQUN6QyxhQUFhO1FBQ2IsSUFBSSxDQUFDLG9CQUFZLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDO1FBRW5DO1lBQ0MsTUFBTTtZQUNOLE9BQU87WUFDUCxNQUFNO1NBQ04sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUExS0QsSUFBSSxDQUFhLEdBQUcsSUFBSTtRQUV2QixhQUFhO1FBQ2IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLHVCQUFlLENBQUMsQ0FBQyxJQUFJLENBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNuRCxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxN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UUQsMENBZ1FDO0FBRUQsa0JBQWUsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC85LzI1LzAyNS5cbiAqL1xuXG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgQ2FsbGFibGVJbnN0YW5jZSA9IHJlcXVpcmUoJ2NhbGxhYmxlLWluc3RhbmNlMicpO1xuaW1wb3J0IENyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bicpO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBjaGlsZF9wcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuaW1wb3J0IHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuaW1wb3J0IHN0cmlwQW5zaSA9IHJlcXVpcmUoJ3N0cmlwLWFuc2knKTtcblxuZXhwb3J0IHsgQmx1ZWJpcmQgfVxuXG5pbXBvcnQge1xuXHRTcGF3bk9wdGlvbnMsXG5cdFNwYXduU3luY09wdGlvbnMsXG5cdFNwYXduU3luY09wdGlvbnNXaXRoQnVmZmVyRW5jb2RpbmcsXG5cdFNwYXduU3luY09wdGlvbnNXaXRoU3RyaW5nRW5jb2RpbmcsXG59IGZyb20gXCIuL3R5cGVcIjtcblxuZXhwb3J0IGNvbnN0IFNZTV9DUk9TU19TUEFXTiA9IFN5bWJvbCgnY3Jvc3Mtc3Bhd24nKTtcbmV4cG9ydCBjb25zdCBTWU1fQkxVRUJJUkQgPSBTeW1ib2woJ2JsdWViaXJkJyk7XG5cbmV4cG9ydCB7XG5cdFNwYXduT3B0aW9ucyxcblx0U3Bhd25TeW5jT3B0aW9ucyxcblx0U3Bhd25TeW5jT3B0aW9uc1dpdGhCdWZmZXJFbmNvZGluZyxcblx0U3Bhd25TeW5jT3B0aW9uc1dpdGhTdHJpbmdFbmNvZGluZyxcbn1cblxuZXhwb3J0IHR5cGUgU3Bhd25TeW5jUmV0dXJuczxUID0gQnVmZmVyPiA9IGNoaWxkX3Byb2Nlc3MuU3Bhd25TeW5jUmV0dXJuczxUPiAmIHtcblxuXHQvKipcblx0ICogZmFrZSBhc3luYyBhcGksIHRoaXMgbm90IHNhbWUgYXMgYXN5bmMgcmV0dXJuXG5cdCAqL1xuXHR0aGVuPFI+KGZuOiAoY2hpbGQ6IGNoaWxkX3Byb2Nlc3MuU3Bhd25TeW5jUmV0dXJuczxUPikgPT4gUik6IEJsdWViaXJkPFI+LFxuXG5cdGVycm9yOiBJU3Bhd25BU3luY0Vycm9yLFxufTtcblxuZXhwb3J0IHR5cGUgU3Bhd25BU3luY1JldHVybnM8VCA9IEJ1ZmZlcj4gPSBjaGlsZF9wcm9jZXNzLlNwYXduU3luY1JldHVybnM8VD4gJiBjaGlsZF9wcm9jZXNzLkNoaWxkUHJvY2VzcyAmIHtcblxuXHRlcnJvcjogSVNwYXduQVN5bmNFcnJvcixcblx0c3RhdHVzOiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIGEgYnVmZmVyIGxpc3QgYnkgcmVhbHkgb3JkZXIgb2Ygb3V0cHV0IChpbmNsdWRlIHN0ZG91dCAsIHN0ZGVycilcblx0ICovXG5cdF9vdXRwdXQ/OiBCdWZmZXJbXSxcblxuXHQvKipcblx0ICogc291cmNlIHN0ZGVyciBzdHJlYW1cblx0ICovXG5cdHN0ZGVyclN0cmVhbT86IHN0cmVhbS5SZWFkYWJsZSxcblx0LyoqXG5cdCAqIHNvdXJjZSBzdGRvdXQgc3RyZWFtXG5cdCAqL1xuXHRzdGRvdXRTdHJlYW0/OiBzdHJlYW0uUmVhZGFibGUsXG59O1xuXG5leHBvcnQgdHlwZSBTcGF3bkFTeW5jUmV0dXJuc1Byb21pc2U8VCA9IEJ1ZmZlcj4gPSBCbHVlYmlyZDxTcGF3bkFTeW5jUmV0dXJuczxUPj4gJiB7XG5cblx0LyoqXG5cdCAqIGNhbiBkbyBhbnl0aGluZyBhcyB1IHdhbnQgbGlrZSBzb3VyY2Ugc3Bhd24gZG9cblx0ICovXG5cdGNoaWxkPzogU3Bhd25BU3luY1JldHVybnM8VD4sXG5cbn07XG5cbi8qKlxuICogRXJyb3IgQ2xhc3NcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJU3Bhd25BU3luY0Vycm9yPFIgPSBTcGF3bkFTeW5jUmV0dXJucz4gZXh0ZW5kcyBFcnJvclxue1xuXHRtZXNzYWdlOiBzdHJpbmcsXG5cdGNvZGU/OiBzdHJpbmcsXG5cdGVycm5vPzogc3RyaW5nLFxuXHRzeXNjYWxsPzogc3RyaW5nLFxuXHRwYXRoPzogc3RyaW5nLFxuXHRzcGF3bmFyZ3M/OiBzdHJpbmdbXSxcblxuXHRjaGlsZD86IFIsXG59XG5cbmludGVyZmFjZSBDYWxsYWJsZUluc3RhbmNlPFIgPSBTcGF3bkFTeW5jUmV0dXJuc1Byb21pc2U+XG57XG5cdChjb21tYW5kOiBzdHJpbmcsIGFyZ3M/OiBzdHJpbmdbXSwgb3B0aW9ucz86IFNwYXduT3B0aW9ucyk6IFNwYXduQVN5bmNSZXR1cm5zUHJvbWlzZVxuXHQ8VCA9IEJ1ZmZlcj4oY29tbWFuZDogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10sIG9wdGlvbnM/OiBTcGF3bk9wdGlvbnMpOiBTcGF3bkFTeW5jUmV0dXJuc1Byb21pc2U8VD5cblx0PFQgPSBCdWZmZXI+KGNvbW1hbmQ6IHN0cmluZywgYXJncz86IGFueVtdLCBvcHRpb25zPzogU3Bhd25PcHRpb25zKTogU3Bhd25BU3luY1JldHVybnNQcm9taXNlPFQ+XG5cdDxUID0gQnVmZmVyPihjb21tYW5kOiBzdHJpbmcsIGFyZ3M/OiBhbnlbXSk6IFNwYXduQVN5bmNSZXR1cm5zUHJvbWlzZTxUPlxuXHQ8VCA9IEJ1ZmZlcj4oY29tbWFuZDogc3RyaW5nKTogU3Bhd25BU3luY1JldHVybnNQcm9taXNlPFQ+XG5cblx0KGNvbW1hbmQ6IHN0cmluZywgYXJncz86IHN0cmluZ1tdLCBvcHRpb25zPzogU3Bhd25PcHRpb25zKTogU3Bhd25BU3luY1JldHVybnNQcm9taXNlXG5cdChjb21tYW5kOiBzdHJpbmcsIGFyZ3M/OiBhbnlbXSwgb3B0aW9ucz86IFNwYXduT3B0aW9ucyk6IFNwYXduQVN5bmNSZXR1cm5zUHJvbWlzZVxuXHQoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogYW55W10pOiBTcGF3bkFTeW5jUmV0dXJuc1Byb21pc2Vcblx0KGNvbW1hbmQ6IHN0cmluZyk6IFNwYXduQVN5bmNSZXR1cm5zUHJvbWlzZVxuXG5cdDxUID0gQnVmZmVyPiguLi5hcmd2KTogU3Bhd25BU3luY1JldHVybnNQcm9taXNlPFQ+XG5cdCguLi5hcmd2KTogU3Bhd25BU3luY1JldHVybnNQcm9taXNlXG59XG5cbmV4cG9ydCBjbGFzcyBDcm9zc1NwYXduRXh0cmE8UiA9IFNwYXduQVN5bmNSZXR1cm5zUHJvbWlzZT4gZXh0ZW5kcyBDYWxsYWJsZUluc3RhbmNlPFI+XG57XG5cdHByb3RlY3RlZCByZWFkb25seSBbU1lNX0NST1NTX1NQQVdOXTogdHlwZW9mIENyb3NzU3Bhd247XG5cdHByb3RlY3RlZCByZWFkb25seSBbU1lNX0JMVUVCSVJEXTogdHlwZW9mIEJsdWViaXJkO1xuXG5cdHB1YmxpYyByZWFkb25seSBkZWZhdWx0ID0gdGhpcztcblxuXHQvKipcblx0ICogc3luYyB2ZXJzaW9uIG9mIGNoaWxkX3Byb2Nlc3Muc3Bhd25TeW5jKGNvbW1hbmRbLCBhcmdzXVssIG9wdGlvbnNdKVxuXHQgKi9cblx0c3luYyhjb21tYW5kOiBzdHJpbmcpOiBTcGF3blN5bmNSZXR1cm5zPEJ1ZmZlcj47XG5cdHN5bmMoY29tbWFuZDogc3RyaW5nLCBvcHRpb25zPzogU3Bhd25TeW5jT3B0aW9uc1dpdGhTdHJpbmdFbmNvZGluZyk6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPjtcblx0c3luYyhjb21tYW5kOiBzdHJpbmcsIG9wdGlvbnM/OiBTcGF3blN5bmNPcHRpb25zV2l0aEJ1ZmZlckVuY29kaW5nKTogU3Bhd25TeW5jUmV0dXJuczxCdWZmZXI+O1xuXHRzeW5jKGNvbW1hbmQ6IHN0cmluZywgb3B0aW9ucz86IFNwYXduU3luY09wdGlvbnMpOiBTcGF3blN5bmNSZXR1cm5zPEJ1ZmZlcj47XG5cdHN5bmMoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogQXJyYXk8c3RyaW5nPiwgb3B0aW9ucz86IFNwYXduU3luY09wdGlvbnNXaXRoU3RyaW5nRW5jb2RpbmcpOiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz47XG5cdHN5bmMoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogQXJyYXk8c3RyaW5nPiwgb3B0aW9ucz86IFNwYXduU3luY09wdGlvbnNXaXRoQnVmZmVyRW5jb2RpbmcpOiBTcGF3blN5bmNSZXR1cm5zPEJ1ZmZlcj47XG5cdHN5bmMoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogQXJyYXk8c3RyaW5nPiwgb3B0aW9ucz86IFNwYXduU3luY09wdGlvbnMpOiBTcGF3blN5bmNSZXR1cm5zPEJ1ZmZlcj47XG5cdHN5bmM8VCA9IEJ1ZmZlcj4oLi4uYXJndik6IFNwYXduU3luY1JldHVybnM8VD5cblx0c3luYzxUID0gQnVmZmVyPiguLi5hcmd2KTogU3Bhd25TeW5jUmV0dXJuczxUPlxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBjaGlsZCA9IHRoaXNbU1lNX0NST1NTX1NQQVdOXS5zeW5jPFQ+KC4uLmFyZ3YpO1xuXHRcdGNoaWxkLnRoZW4gPSBCbHVlYmlyZC5tZXRob2QoKGZuKSA9PiB7XG5cdFx0XHRkZWxldGUgY2hpbGQudGhlbjtcblx0XHRcdHJldHVybiBmbihjaGlsZClcblx0XHR9KTtcblxuXHRcdGxldCBbY29tbWFuZCwgYXJncywgb3B0aW9uc10gPSBhcmd2O1xuXG5cdFx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zdHJpcEFuc2kpXG5cdFx0e1xuXHRcdFx0Y2hpbGQuc3RkZXJyID0gY2hpbGQuc3RkZXJyICYmIENyb3NzU3Bhd25FeHRyYS5zdHJpcEFuc2koY2hpbGQuc3RkZXJyKTtcblx0XHRcdGNoaWxkLnN0ZG91dCA9IGNoaWxkLnN0ZG91dCAmJiBDcm9zc1NwYXduRXh0cmEuc3RyaXBBbnNpKGNoaWxkLnN0ZG91dCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNoaWxkO1xuXHR9XG5cblx0LyoqXG5cdCAqIGFzeW5jIHZlcnNpb24gb2YgY2hpbGRfcHJvY2Vzcy5zcGF3bihjb21tYW5kWywgYXJnc11bLCBvcHRpb25zXSlcblx0ICovXG5cdGFzeW5jPFQgPSBCdWZmZXI+KGNvbW1hbmQ6IHN0cmluZywgYXJncz86IHN0cmluZ1tdLCBvcHRpb25zPzogU3Bhd25PcHRpb25zKTogU3Bhd25BU3luY1JldHVybnNQcm9taXNlPFQ+XG5cdGFzeW5jPFQgPSBCdWZmZXI+KGNvbW1hbmQ6IHN0cmluZywgYXJncz86IGFueVtdLCBvcHRpb25zPzogU3Bhd25PcHRpb25zKTogU3Bhd25BU3luY1JldHVybnNQcm9taXNlPFQ+XG5cdGFzeW5jPFQgPSBCdWZmZXI+KC4uLmFyZ3YpOiBTcGF3bkFTeW5jUmV0dXJuc1Byb21pc2U8VD5cblx0YXN5bmM8VCA9IEJ1ZmZlcj4oLi4uYXJndik6IFNwYXduQVN5bmNSZXR1cm5zUHJvbWlzZTxUPlxuXHR7XG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IGNhY2hlID0ge1xuXHRcdFx0b3V0cHV0OiBbXSBhcyBCdWZmZXJbXSxcblx0XHRcdHN0ZG91dDogW10gYXMgQnVmZmVyW10sXG5cdFx0XHRzdGRlcnI6IFtdIGFzIEJ1ZmZlcltdLFxuXHRcdH07XG5cblx0XHRsZXQgY2hpbGQ6IFNwYXduQVN5bmNSZXR1cm5zPFQ+O1xuXHRcdGxldCBmbiA9IHNlbGZbU1lNX0NST1NTX1NQQVdOXSBhcyB0eXBlb2YgQ3Jvc3NTcGF3bjtcblxuXHRcdGxldCByZXQgPSBCbHVlYmlyZC5yZXNvbHZlKCk7XG5cblx0XHRsZXQgW2NvbW1hbmQsIGFyZ3MsIG9wdGlvbnNdID0gYXJndjtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjaGlsZCA9IGZuKC4uLmFyZ3YpO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXQuY2hpbGQgPSBjaGlsZDtcblxuXHRcdGNoaWxkLnN0ZGVyclN0cmVhbSA9IGNoaWxkLnN0ZGVycjtcblx0XHRjaGlsZC5zdGRvdXRTdHJlYW0gPSBjaGlsZC5zdGRvdXQ7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0ID0gcmV0LnRoZW5SZXR1cm4obmV3IEJsdWViaXJkPFNwYXduQVN5bmNSZXR1cm5zPFQ+PihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHJldC5jaGlsZCA9IGNoaWxkO1xuXG5cdFx0XHRbXG5cdFx0XHRcdCdzdGRlcnInLFxuXHRcdFx0XHQnc3Rkb3V0Jyxcblx0XHRcdF0uZm9yRWFjaChmdW5jdGlvbiAoc3RkKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY2hpbGRbc3RkXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNoaWxkW3N0ZF0ub24oJ2RhdGEnLCBmdW5jdGlvbiAoYnVmKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNhY2hlW3N0ZF0ucHVzaChidWYpO1xuXHRcdFx0XHRcdFx0Y2FjaGUub3V0cHV0LnB1c2goYnVmKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGNoaWxkLm9uKCdjbG9zZScsIGZ1bmN0aW9uICguLi5hcmd2KVxuXHRcdFx0e1xuXHRcdFx0XHRjaGlsZC5zdGF0dXMgPSBhcmd2WzBdO1xuXG5cdFx0XHRcdGRvbmUoJ2Nsb3NlJyk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmRlYnVnKGNoaWxkLnBpZCwgJ2Nsb3NlJywgYXJndik7XG5cdFx0XHR9KTtcblxuXHRcdFx0Y2hpbGQub24oJ2V4aXQnLCBmdW5jdGlvbiAoLi4uYXJndilcblx0XHRcdHtcblx0XHRcdFx0Y2hpbGQuc3RhdHVzID0gYXJndlswXTtcblxuXHRcdFx0XHRkb25lKCdleGl0Jyk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmRlYnVnKGNoaWxkLnBpZCwgJ2V4aXQnLCBhcmd2KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRjaGlsZC5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyb3IpXG5cdFx0XHR7XG5cdFx0XHRcdGNoaWxkLmVycm9yID0gZXJyb3I7XG5cdFx0XHRcdC8vZG9uZSgnZXJyb3InKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRmdW5jdGlvbiBkb25lKGV2ZW50Pzogc3RyaW5nKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGV2ZW50LCBjaGlsZC5lcnJvcik7XG5cblx0XHRcdFx0bGV0IHN0ZGVyciA9IEJ1ZmZlci5jb25jYXQoY2FjaGUuc3RkZXJyKTtcblx0XHRcdFx0bGV0IHN0ZG91dCA9IEJ1ZmZlci5jb25jYXQoY2FjaGUuc3Rkb3V0KTtcblxuXHRcdFx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLnN0cmlwQW5zaSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHN0ZGVyciA9IENyb3NzU3Bhd25FeHRyYS5zdHJpcEFuc2koc3RkZXJyKTtcblx0XHRcdFx0XHRzdGRvdXQgPSBDcm9zc1NwYXduRXh0cmEuc3RyaXBBbnNpKHN0ZG91dCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNoaWxkLnN0ZGVyciA9IHN0ZGVycjtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjaGlsZC5zdGRvdXQgPSBzdGRvdXQ7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Y2hpbGQub3V0cHV0ID0gW251bGwsIHN0ZG91dCwgc3RkZXJyXTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNoaWxkLl9vdXRwdXQgPSBjYWNoZS5vdXRwdXQ7XG5cblx0XHRcdFx0aWYgKGNoaWxkLmVycm9yKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGNoaWxkLmVycm9yLmNoaWxkID0gY2hpbGQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY2hpbGQuZXJyb3IpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZWplY3QoY2hpbGQuZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlc29sdmUoY2hpbGQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblx0XHRcdC50YXBDYXRjaCgoZTogSVNwYXduQVN5bmNFcnJvcjxTcGF3bkFTeW5jUmV0dXJuczxUPj4pID0+IHtcblx0XHRcdFx0aWYgKGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRlLmNoaWxkID0gY2hpbGQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0KVxuXHRcdDtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXQuY2hpbGQgPSBjaGlsZDtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0c3Bhd25TeW5jID0gdGhpcy5zeW5jO1xuXHRzcGF3biA9IHRoaXMuYXN5bmM7XG5cblx0LyoqXG5cdCAqIGNyZWF0ZSBuZXcgQ3Jvc3NTcGF3bkV4dHJhIHdpdGggQ3VzdG9tIENyb3NzU3Bhd24sIFByb21pc2Vcblx0ICovXG5cdGNvbnN0cnVjdG9yKGNzPzogdHlwZW9mIENyb3NzU3Bhd24sIHA/OiB0eXBlb2YgQmx1ZWJpcmQgfCB0eXBlb2YgUHJvbWlzZSlcblx0e1xuXHRcdHN1cGVyKCdhc3luYycpO1xuXG5cdFx0dGhpc1tTWU1fQ1JPU1NfU1BBV05dID0gY3MgfHwgQ3Jvc3NTcGF3bjtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0dGhpc1tTWU1fQkxVRUJJUkRdID0gcCB8fCBCbHVlYmlyZDtcblxuXHRcdFtcblx0XHRcdCdjb3JlJyxcblx0XHRcdCdhc3luYycsXG5cdFx0XHQnc3luYycsXG5cdFx0XS5mb3JFYWNoKG5hbWUgPT4gdGhpc1tuYW1lXSA9IHRoaXNbbmFtZV0uYmluZCh0aGlzKSk7XG5cdH1cblxuXHQvKipcblx0ICogY3JlYXRlIG5ldyBDcm9zc1NwYXduRXh0cmEgd2l0aCBDdXN0b20gQ3Jvc3NTcGF3biwgUHJvbWlzZVxuXHQgKi9cblx0c3RhdGljIHVzZShjcz86IHR5cGVvZiBDcm9zc1NwYXduLCBwPzogdHlwZW9mIEJsdWViaXJkIHwgdHlwZW9mIFByb21pc2UpOiBDcm9zc1NwYXduRXh0cmFcblx0c3RhdGljIHVzZTxSID0gU3Bhd25BU3luY1JldHVybnNQcm9taXNlPihjcz86IHR5cGVvZiBDcm9zc1NwYXduLCBwPzogdHlwZW9mIEJsdWViaXJkIHwgdHlwZW9mIFByb21pc2UpOiBDcm9zc1NwYXduRXh0cmE8Uj5cblx0c3RhdGljIHVzZShjcz8sIHA/KTogQ3Jvc3NTcGF3bkV4dHJhXG5cdHN0YXRpYyB1c2U8UiA9IFNwYXduQVN5bmNSZXR1cm5zUHJvbWlzZT4oY3M/LCBwPyk6IENyb3NzU3Bhd25FeHRyYTxSPlxuXHRzdGF0aWMgdXNlPFIgPSBTcGF3bkFTeW5jUmV0dXJuc1Byb21pc2U+KGNzPzogdHlwZW9mIENyb3NzU3Bhd24sIHA/OiB0eXBlb2YgQmx1ZWJpcmQgfCB0eXBlb2YgUHJvbWlzZSlcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpczxSPihjcywgcClcblx0fVxuXG5cdC8qKlxuXHQgKiBjcmVhdGUgbmV3IENyb3NzU3Bhd25FeHRyYSB3aXRoIEN1c3RvbSBDcm9zc1NwYXduLCBQcm9taXNlXG5cdCAqL1xuXHR1c2UoY3M/OiB0eXBlb2YgQ3Jvc3NTcGF3biwgcD86IHR5cGVvZiBCbHVlYmlyZCB8IHR5cGVvZiBQcm9taXNlKTogQ3Jvc3NTcGF3bkV4dHJhXG5cdHVzZTxSID0gU3Bhd25BU3luY1JldHVybnNQcm9taXNlPihjcz86IHR5cGVvZiBDcm9zc1NwYXduLCBwPzogdHlwZW9mIEJsdWViaXJkIHwgdHlwZW9mIFByb21pc2UpOiBDcm9zc1NwYXduRXh0cmE8Uj5cblx0dXNlKGNzPywgcD8pOiBDcm9zc1NwYXduRXh0cmFcblx0dXNlPFIgPSBTcGF3bkFTeW5jUmV0dXJuc1Byb21pc2U+KGNzPywgcD8pOiBDcm9zc1NwYXduRXh0cmE8Uj5cblx0dXNlPFIgPSBTcGF3bkFTeW5jUmV0dXJuc1Byb21pc2U+KGNzPzogdHlwZW9mIENyb3NzU3Bhd24sIHA/OiB0eXBlb2YgQmx1ZWJpcmQgfCB0eXBlb2YgUHJvbWlzZSlcblx0e1xuXHRcdHJldHVybiBuZXcgQ3Jvc3NTcGF3bkV4dHJhPFI+KGNzLCBwKVxuXHR9XG5cblx0Y29yZTxUPihjb21tYW5kOiBzdHJpbmcsIGFyZ3M/OiBzdHJpbmdbXSwgb3B0aW9ucz86IFNwYXduT3B0aW9ucyk6IGNoaWxkX3Byb2Nlc3MuQ2hpbGRQcm9jZXNzXG5cdGNvcmU8VD4oLi4uYXJndik6IGNoaWxkX3Byb2Nlc3MuQ2hpbGRQcm9jZXNzXG5cdGNvcmU8VD4oLi4uYXJndik6IGNoaWxkX3Byb2Nlc3MuQ2hpbGRQcm9jZXNzXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHRoaXNbU1lNX0NST1NTX1NQQVdOXSguLi5hcmd2KTtcblx0fVxuXG5cdGdldCBjb3JlU3luYygpXG5cdHtcblx0XHRyZXR1cm4gdGhpc1tTWU1fQ1JPU1NfU1BBV05dLnN5bmM7XG5cdH1cblxuXHQvKipcblx0ICogc3RyaXBBbnNpIGEgQnVmZmVyIG9yIHN0cmluZ1xuXHQgKi9cblx0c3RhdGljIHN0cmlwQW5zaShpbnB1dDogQnVmZmVyLCB0b1N0cjogdHJ1ZSk6IHN0cmluZ1xuXHRzdGF0aWMgc3RyaXBBbnNpKGlucHV0OiBCdWZmZXIsIHRvU3RyPzogYm9vbGVhbik6IEJ1ZmZlclxuXHRzdGF0aWMgc3RyaXBBbnNpKGlucHV0OiBzdHJpbmcsIHRvU3RyPzogYm9vbGVhbik6IHN0cmluZ1xuXHRzdGF0aWMgc3RyaXBBbnNpPFQ+KGlucHV0OiBULCB0b1N0cjogdHJ1ZSk6IHN0cmluZ1xuXHRzdGF0aWMgc3RyaXBBbnNpPFQ+KGlucHV0OiBULCB0b1N0cj86IGJvb2xlYW4pOiBUXG5cdHN0YXRpYyBzdHJpcEFuc2koaW5wdXQ6IHN0cmluZyB8IEJ1ZmZlciwgdG9TdHI/OiBib29sZWFuKVxuXHR7XG5cdFx0aWYgKCFpbnB1dClcblx0XHR7XG5cdFx0XHRyZXR1cm4gaW5wdXQ7XG5cdFx0fVxuXG5cdFx0bGV0IGlzQnVmZmVyID0gQnVmZmVyLmlzQnVmZmVyKGlucHV0KTtcblxuXHRcdGlucHV0ID0gaW5wdXQudG9TdHJpbmcoKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpbnB1dCA9IHN0cmlwQW5zaShpbnB1dCkgYXMgc3RyaW5nO1xuXG5cdFx0aWYgKGlzQnVmZmVyICYmICF0b1N0cilcblx0XHR7XG5cdFx0XHRyZXR1cm4gQnVmZmVyLmZyb20oaW5wdXQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBDcm9zc1NwYXduRXh0cmE7XG4iXX0=