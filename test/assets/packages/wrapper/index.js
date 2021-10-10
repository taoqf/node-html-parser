/**
 * The following dynamically loads either the built or uncompiled source code (based on TEST_TARGET env var) when require'd
 */
const path = require('path');

const target = process.env.TEST_TARGET === 'dist' || process.env.CI ? 'dist' : 'src';

module.exports = require(`../../../../${target}`);
