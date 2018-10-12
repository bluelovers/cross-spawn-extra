"use strict";
/// <reference types="node" />
const bluebird = require("bluebird");
const CrossSpawn = require("cross-spawn");
const core_1 = require("./core");
/**
 * @see core.d.ts
 */
const crossSpawnExtra = core_1.CrossSpawnExtra.use(CrossSpawn, bluebird);
module.exports = crossSpawnExtra;
