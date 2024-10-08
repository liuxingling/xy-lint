/**
 * 初始化项目配置
 * 引导用户根据项目需求配置 ESLint、Stylelint、Markdownlint 和 Prettier 等工具，
 * 并将这些配置写入项目的 package.json 文件和其他相关的配置文件中。
 */
import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import spawn from 'cross-spawn'; // 运行子进程的工具，用于执行 shell 命令
import update from './update';
import npmType from '../utils/npm-type';
import log from '../utils/log';
import conflictResolve from '../utils/conflict-resolve';
import generateTemplate from '../utils/generate-template';
import { PROJECT_TYPES, PKG_NAME } from '../utils/constants';
import type { InitOptions, PKG } from '../types';

// 当前执行的步骤
let step = 0;

/**
 * 选择项目语言和框架
 */
const chooseEslintType = async (): Promise<string> => {
  const { type } = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: `Step ${++step}. 请选择React项目的语言（JS/TS）类型：`,
    choices: PROJECT_TYPES,
  });

  return type;
};

/**
 * 选择是否启用 stylelint
 * @param defaultValue
 */
const chooseEnableStylelint = async (defaultValue: boolean): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}. 是否需要使用 stylelint（若没有样式文件则不需要）：`,
    default: defaultValue,
  });

  return enable;
};

/**
 * 选择是否启用 markdownlint
 */
const chooseEnableMarkdownLint = async (): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}. 是否需要使用 markdownlint（若没有 Markdown 文件则不需要）：`,
    default: true,
  });

  return enable;
};

/**
 * 选择是否启用 prettier
 */
const chooseEnablePrettier = async (): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}. 是否需要使用 Prettier 格式化代码：`,
    default: true,
  });

  return enable;
};

export default async (options: InitOptions) => {
  const cwd = options.cwd || process.cwd();
  // 是否为测试环境
  const isTest = process.env.NODE_ENV === 'test';
  // 是否检查并升级 lxl-lint-cli 的版本
  const checkVersionUpdate = options.checkVersionUpdate || false;
  // 是否禁用自动在初始化完成后安装依赖，false为自动安装依赖
  const disableNpmInstall = options.disableNpmInstall || false;
  // 存储用户选择的配置
  const config: Record<string, any> = {};
  // 读取 package.json 中的内容
  const pkgPath = path.resolve(cwd, 'package.json');
  let pkg: PKG = fs.readJSONSync(pkgPath);

  // 不是测试环境且需要检测升级
  if (!isTest && checkVersionUpdate) {
    // 调用update检查更新，但不自动更新
    await update(false);
  }

  // 初始化 `enableESLint`，默认为 true，无需让用户选择
  if (typeof options.enableESLint === 'boolean') {
    config.enableESLint = options.enableESLint;
  } else {
    config.enableESLint = true;
  }

  // 初始化 `eslintType`，拿到 react/typescript/react
  if (options.eslintType && PROJECT_TYPES.find((choice) => choice.value === options.eslintType)) {
    config.eslintType = options.eslintType;
  } else {
    config.eslintType = await chooseEslintType();
  }

  // 初始化 `enableStylelint`
  if (typeof options.enableStylelint === 'boolean') {
    config.enableStylelint = options.enableStylelint;
  } else {
    config.enableStylelint = await chooseEnableStylelint(!/node/.test(config.eslintType));
  }

  // 初始化 `enableMarkdownlint`
  if (typeof options.enableMarkdownlint === 'boolean') {
    config.enableMarkdownlint = options.enableMarkdownlint;
  } else {
    config.enableMarkdownlint = await chooseEnableMarkdownLint();
  }

  // 初始化 `enablePrettier`
  if (typeof options.enablePrettier === 'boolean') {
    config.enablePrettier = options.enablePrettier;
  } else {
    config.enablePrettier = await chooseEnablePrettier();
  }

  if (!isTest) {
    log.info(`Step ${++step}. 检查并处理项目中可能存在的依赖和配置冲突`);
    // 处理项目中的依赖和配置冲突，并更新 pkg。
    pkg = await conflictResolve(cwd, options.rewriteConfig);
    log.success(`Step ${step}. 已完成项目依赖和配置冲突检查处理 :D`);

    // 安装依赖 lxl-fe-lint
    if(!disableNpmInstall){
      log.info(`Step ${++step}. 安装依赖`);
      const npm = await npmType;
      spawn.sync(
        npm,
        ['i', '-D', PKG_NAME],
        { 
          stdio: 'inherit', // 标准输入输出流继承父进程,子进程的输出可以直接显示在父进程的终端中
          cwd
        },
      );
      log.success(`Step ${step}. 安装依赖成功 :D`);
    }
  }

  // 重新读取 package.json 
  pkg = fs.readJSONSync(pkgPath);
  // 在 `package.json` 中写入 `scripts`
  if (!pkg.scripts) {
    pkg.scripts = {};
  }
  // 添加自定义脚本用于扫描 "lxl-fe-lint-scan": "lxl-fe-lint scan",
  if (!pkg.scripts[`${PKG_NAME}-scan`]) {
    pkg.scripts[`${PKG_NAME}-scan`] = `${PKG_NAME} scan`;
  }
  // 添加自定义脚本用于修复 "lxl-fe-lint-fix": "lxl-fe-lint fix"
  if (!pkg.scripts[`${PKG_NAME}-fix`]) {
    pkg.scripts[`${PKG_NAME}-fix`] = `${PKG_NAME} fix`;
  }

  // 配置 commit 卡点
  log.info(`Step ${++step}. 配置 git commit 卡点`);
  if (!pkg.husky) pkg.husky = {};
  if (!pkg.husky.hooks) pkg.husky.hooks = {};
  // "pre-commit": "lxl-fe-lint commit-file-scan"
  pkg.husky.hooks['pre-commit'] = `${PKG_NAME} commit-file-scan`;
  // "commit-msg": "lxl-fe-lint commit-msg-scan"
  pkg.husky.hooks['commit-msg'] = `${PKG_NAME} commit-msg-scan`;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  log.success(`Step ${step}. 配置 git commit 卡点成功 :D`);

  log.info(`Step ${++step}. 写入配置文件`);
  // 生成并写入配置文件
  generateTemplate(cwd, config);
  log.success(`Step ${step}. 写入配置文件成功 :D`);

  // 输出日志，提示用户项目初始化已经完成
  const logs = [`${PKG_NAME} 初始化完成 :D`].join('\r\n');
  log.success(logs);
};
