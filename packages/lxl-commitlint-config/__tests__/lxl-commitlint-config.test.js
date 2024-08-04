'use strict';

const lxlCommitlintConfig = require('..');
const assert = require('assert').strict;

assert.strictEqual(lxlCommitlintConfig(), 'Hello from lxlCommitlintConfig');
console.info('lxlCommitlintConfig tests passed');
