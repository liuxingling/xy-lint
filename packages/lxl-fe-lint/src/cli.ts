#!/usr/bin/env node
/**
 *  初始化项目配置、检查提交信息、扫描修复、更新工具版本等
 */
import path from "path";
import fs from 'fs-extra';
import ora from 'ora'; // 显示命令行中的旋转加载指示器
import glob from 'glob'; // 查找匹配的文件路径
import { program } from 'commander'; // 用于创建命令行界面
import spawn from 'cross-spawn'; // 用于生成子进程来执行命令。
import { execSync } from 'child_process';
import init from './actions/init';
import scan from './actions/scan';
import update from './actions/update';
import log from './utils/log';
import printReport from './utils/print-report';
import npmType from './utils/npm-type';
import { getCommitFiles, getAmendFiles } from './utils/git';
import generateTemplate from './utils/generate-template';
import { PKG_NAME, PKG_VERSION } from './utils/constants';

// 返回当前Node进程执行的目录
const cwd = process.cwd();

/**
 * 检测是否有 Lint 配置文件，如果 node_modules 不存在并且存在 Lint 配置文件，则安装依赖（否则会找不到 config）
 */
const installDepsIfThereNo = async () => {
  // 使用 glob.sync 查找 Lint 配置文件
  const lintConfigFiles = [].concat(
    glob.sync('.eslintrc?(.@(js|yaml|yml|json))', { cwd }),
    glob.sync('.stylelintrc?(.@(js|yaml|yml|json))', { cwd }),
    glob.sync('.markdownlint(.@(yaml|yml|json))', { cwd }),
  );
  const nodeModulesPath = path.resolve(cwd, 'node_modules');

  if (!fs.existsSync(nodeModulesPath) && lintConfigFiles.length > 0) {
    const npm = await npmType;
    log.info(`使用项目 Lint 配置，检测到项目未安装依赖，将进行安装（执行 ${npm} install）`);
    // 同步执行安装命令
    execSync(`cd ${cwd} && ${npm} i`);
  }
};

// 设置工具的版本号和描述
program
  .version(PKG_VERSION)
  .description(
    `${PKG_NAME} 是 前端编码规范工程化 的配套 Lint 工具，提供简单的 CLI 和 Node.js API，让项目能够一键接入、一键扫描、一键修复、一键升级，并为项目配置 git commit 卡点，降低项目实施规约的成本`,
  );

// 初始化项目的规约工具和配置
program
  .command('init')
  .description('一键接入：为项目初始化规约工具和配置，可以根据项目类型和需求进行定制')
  .option('--vscode', '写入.vscode/setting.json配置')
  .action(async (cmd) => {
    // 带有 --vscode 选项，则生成 VSCode 配置文件
    if (cmd.vscode) {
      // 根据包名称加载配置文件
      const configPath = path.resolve(cwd, `${PKG_NAME}.config.js`);
      // 将当前工作目录、加载的配置对象、需要为 VSCode 生成配置传给generateTemplate
      generateTemplate(cwd, require(configPath), true);
    } else {
      // 初始化项目
      await init({
        cwd,
        // 检查并升级 lxl-fe-lint 的版本
        checkVersionUpdate: true,
      });
    }
  })

  program
  .command('scan')
  .description('一键扫描：对项目进行代码规范问题扫描')
  .option('-q, --quiet', '仅报告错误信息 - 默认: false')
  .option('-o, --output-report', '输出扫描出的规范问题日志')
  .option('-i, --include <dirpath>', '指定要进行规范扫描的目录')
  .option('--no-ignore', '忽略 eslint 的 ignore 配置文件和 ignore 规则')
  .action(async (cmd) => {
    // 安装缺失的依赖
    await installDepsIfThereNo();

    // 创建实例用于显示加载指示器
    const checking = ora();
    checking.start(`执行 ${PKG_NAME} 代码检查`);

    // 进行扫描
    const { results, errorCount, warningCount, runErrors } = await scan({
      cwd,
      fix: false,
      include: cmd.include || cwd,
      quiet: Boolean(cmd.quiet),
      outputReport: Boolean(cmd.outputReport),
      ignore: cmd.ignore, // 对应 --no-ignore
    });
    let type = 'succeed';
    if (runErrors.length > 0 || errorCount > 0) {
      type = 'fail';
    } else if (warningCount > 0) {
      type = 'warn';
    }

    checking[type]();
    // 打印扫描结果
    if (results.length > 0) printReport(results, false);

    // 输出 lint 运行错误
    runErrors.forEach((e) => console.log(e));
  });


// 检查 git 提交信息是否符合规范
program
  .command('commit-msg-scan')
  .description('commit message 检查: git commit 时对 commit message 进行检查')
  .action(() => {
    const result = spawn.sync('commitlint', ['-E', 'HUSKY_GIT_PARAMS'], { stdio: 'inherit' })
    // 检查失败,终止进程
    if (result.status !== 0) {
      process.exit(result.status);
    }
})

program
  .command('commit-file-scan')
  .description('代码提交检查: git commit 时对提交代码进行规范问题扫描')
  .option('-s, --strict', '严格模式，对 warn 和 error 问题都卡口，默认仅对 error 问题卡口')
  .action(async (cmd) => {
    // 安装缺失的依赖
    await installDepsIfThereNo();

    // git add 检查，检查是否有未提交的更改
    const files = await getAmendFiles();
    if (files) log.warn(`[${PKG_NAME}] changes not staged for commit: \n${files}\n`);

    const checking = ora();
    checking.start(`执行 ${PKG_NAME} 代码提交检查`);

    const { results, errorCount, warningCount } = await scan({
      cwd,
      include: cwd,
      quiet: !cmd.strict,
      files: await getCommitFiles(),
    });

    // 如果有错误或者在严格模式下有警告，则退出进程
    if (errorCount > 0 || (cmd.strict && warningCount > 0)) {
      checking.fail();
      printReport(results, false);
      process.exitCode = 1;
    } else {
      checking.succeed();
    }
  });

program
  .command('fix')
  .description('一键修复：自动修复项目的代码规范扫描问题')
  .option('-i, --include <dirpath>', '指定要进行修复扫描的目录')
  .option('--no-ignore', '忽略 eslint 的 ignore 配置文件和 ignore 规则')
  .action(async (cmd) => {
    // 安装缺失的依赖
    await installDepsIfThereNo();

    const checking = ora();
    checking.start(`执行 ${PKG_NAME} 代码修复`);

    // 进行修复，并处理结果
    const { results } = await scan({
      cwd,
      fix: true,
      include: cmd.include || cwd,
      ignore: cmd.ignore, // 对应 --no-ignore
    });

    checking.succeed();
    // 打印修复结果
    if (results.length > 0) printReport(results, true);
  });


// 更新工具到最新版本
program.
  command('update').
  description(`更新 ${PKG_NAME} 至最新版本`)
  .action(() => update(true));

  // 解析命令行参数,并根据用户输入执行相应的命令
program.parse(process.argv);