'use strict';

const lxlStylelintConfig = require('..');
const assert = require('assert').strict;

assert.strictEqual(lxlStylelintConfig(), 'Hello from lxlStylelintConfig');
console.info('lxlStylelintConfig tests passed');
