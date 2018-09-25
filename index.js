"use strict";
const bluebird = require("bluebird");
const CrossSpawn = require("cross-spawn");
const core_1 = require("./core");
const crossSpawnExtra = core_1.default.use(CrossSpawn, bluebird);
module.exports = crossSpawnExtra;
