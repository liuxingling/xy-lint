#!/usr/bin/env node
/**
 *  初始化项目配置、检查提交信息、更新工具版本等
 */
import path from "path";
import { program } from 'commander'; // 用于创建命令行界面
import spawn from 'cross-spawn'; // 用于生成子进程来执行命令。
import init from './actions/init';
import update from './actions/update';
import generateTemplate from './utils/generate-template';
import { PKG_NAME, PKG_VERSION } from './utils/constants';

// 返回当前Node进程执行的目录
const cwd = process.cwd();

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


// 更新工具到最新版本
program.
  command('update').
  description(`更新 ${PKG_NAME} 至最新版本`)
  .action(() => update(true));

  // 解析命令行参数,并根据用户输入执行相应的命令
program.parse(process.argv);