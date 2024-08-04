'use strict';

const lxlMarkdownlintConfig = require('..');
const assert = require('assert').strict;

assert.strictEqual(lxlMarkdownlintConfig(), 'Hello from lxlMarkdownlintConfig');
console.info('lxlMarkdownlintConfig tests passed');
