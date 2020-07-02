#!/usr/bin/env node
const run = require('./lib/run');

(async () => {
    await run();
    process.exit(0);
})();