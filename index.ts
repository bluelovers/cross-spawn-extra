/**
 * Created by user on 2018/9/25/025.
 */

import bluebird = require('bluebird');
import CrossSpawn = require('cross-spawn');
import CrossSpawnExtra from './core';

const crossSpawnExtra = CrossSpawnExtra.use(CrossSpawn, bluebird);

export = crossSpawnExtra
