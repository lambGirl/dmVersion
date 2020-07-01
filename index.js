const run = require('./lib/run');
// 执行脚手架，开启项目构建程序
(async () => {
    await run();
    process.exit(0);
})();