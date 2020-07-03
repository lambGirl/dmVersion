// 文件流
const fs = require('fs');

// 用于系统路径，文件路径
const path = require('path');

// 输出不再单调,添加文字背景， 改变字体颜色
const chalk = require('chalk'); 

// 一个用户与命令行交互的工具， 用于窗口上选择 
const inquirer = require('inquirer'); 

const { spawn } = require('child_process');

// 地址配置
const dmversionConfig = require('../.dmversion.json');
const  pkgPath = path.join(dmversionConfig.pkgPath);
const jenkisTagPath = path.join(dmversionConfig.jenkisTagPath);

const run  = async () => {
    // 发起验证
    const answers =  await inquirer.prompt([
        {
            type:'input',
            name: 'version',
            message: '请输入要更新的版本号\n',
        },
        {
            type: 'confirm',
            name: 'status',
            message: '请再次确认是否更新？',
        }
    ]);

    // 验证是否正常输入
    if(!answers.version  || !answers.status){
        process.exit(0);
    }

   

    //  npm版本规范
    const isNpmVersionRule = /^(\d+)(\.)(\d+)(\.)(\d+)$/g.test(answers.version);

    // sprint迭代版本规范
    const isSprintCommon =  /^sprint-((\d+)|(\d+)-(temp|hotfix))$/g.test(answers.version);

    // sprint临时分支规范
    const isSprintTemp = /^sprint-(\d+)-(temp|hotfix)$/g.test(answers.version);

    // 验证answers.version是够符合正规的要求: 1. 0.0.1; 2. sprint-2013/(sprint-2013-temp/sprint-2013-hoxfix);
    let version= '';
    if(isNpmVersionRule){
        version = answers.version;
    }

    if(isSprintCommon){
        // 主版本号
        const major =  answers.version.replace(/[^0-9]/ig, '');

        // 此版本号
        const minor =  isSprintTemp ? 1 : 0
        version =  `${major}.${minor}.0`;
    }

    if(!version){
        console.log(chalk.red('版本号，不符合规范。 例子: (0.0.1/sprint-2013/sprint-2013-temp/sprint-2013-hotfix)'));
        process.exit(0);
    }

    // 如果package.json存在，则修改package.json的version号 
    if(fs.existsSync(path.join(pkgPath))){
        // 如果存在，分为两种情况1. 0.0.1; 2. sprint-2013/(sprint-2013-temp/sprint-2013-hoxfix);
        try {
            const packageFile = fs.readFileSync(pkgPath).toString();
            fs.writeFileSync(pkgPath, packageFile.replace(/\"version\": ?"(.*?)"/, `"version": "${version}"`));
            console.log(chalk.green(`修改成功： ${path.join(pkgPath)}`));

            // 修改版本后提交add
            spawn('git', ['add', pkgPath]);
            
        } catch (error) {
            console.log(chalk.red(`${path.join(pkgPath)}: ${error}`));
        }
    }else{
        console.log(chalk.red(`文件不存在 ${path.join(pkgPath)}`));
    }

    // 验证scripts/build.pro文件是否存在， 存在则直接提示
    if(fs.existsSync(path.join(jenkisTagPath))){

        if(isNpmVersionRule){
            console.log(chalk.red(`无法修改${jenkisTagPath}, version: ${answers.version}不符合sprint迭代规范`));
            return;
        }

        try {
            const jenkisTagFile = fs.readFileSync(jenkisTagPath).toString();
            console.log('jenkisTagFile', jenkisTagFile);
            fs.writeFileSync(jenkisTagPath, jenkisTagFile.replace(/VERSION=(.*)\n{0,1}/, `VERSION=${answers.version}\n`));
            
            console.log(chalk.green(`修改成功： ${path.join(jenkisTagPath)}`));

            // 修改版本后提交add
            spawn('git', ['add', jenkisTagPath]);

        } catch (error) {
            console.log(chalk.red(`${path.join(jenkisTagPath)}: ${error}`));    
        }
        
    }else{
        console.log(chalk.ref(`文件不存在：  ${path.join(jenkisTagPath)}`));
    }

    process.exit(0);
}

module.exports = run;




