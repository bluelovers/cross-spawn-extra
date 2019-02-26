"use strict";
/// <reference types="node" />
const _Bluebird = require("bluebird");
const CrossSpawn = require("cross-spawn");
const core_1 = require("./core");
/**
 * @see core.d.ts
 */
let crossSpawnExtra = core_1.CrossSpawnExtra.use(CrossSpawn, _Bluebird);
module.exports = crossSpawnExtra;
//# sourceMappingURL=index.js.map