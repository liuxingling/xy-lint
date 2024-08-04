'use strict';

const lxlEslintConfig = require('..');
const assert = require('assert').strict;

assert.strictEqual(lxlEslintConfig(), 'Hello from lxlEslintConfig');
console.info('lxlEslintConfig tests passed');
