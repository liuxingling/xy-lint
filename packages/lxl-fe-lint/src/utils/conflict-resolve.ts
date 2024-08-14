/**
 * 检测并解决项目中与当前工具包可能冲突的依赖和配置文件。
 * 它会移除不需要的依赖和配置，确保项目配置的干净和一致性
 */
import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import inquirer from 'inquirer';
import log from './log';
import { PKG_NAME } from './constants';
import type { PKG } from '../types';

// 精确移除依赖
const packageNamesToRemove = [
  '@babel/eslint-parser',
  '@commitlint/cli',
  '@iceworks/spec',
  'babel-eslint',
  'eslint',
  'husky',
  'markdownlint',
  'prettier',
  'stylelint',
  'tslint',
];

// 按前缀移除依赖
const packagePrefixesToRemove = [
  '@commitlint/',
  '@typescript-eslint/',
  'eslint-',
  'stylelint-',
  'markdownlint-',
  'commitlint-',
];

/**
 * 待删除的无用配置
 * 根据项目的当前工作目录 (cwd) 查找项目中存在的配置文件，并返回这些文件路径的数组
 * @param cwd
 */
const checkUselessConfig = (cwd: string): string[] => {
  return ([] as string[])
    .concat(glob.sync('.eslintrc?(.@(yaml|yml|json))', { cwd }))
    .concat(glob.sync('.stylelintrc?(.@(yaml|yml|json))', { cwd }))
    .concat(glob.sync('.markdownlint@(rc|.@(yaml|yml|jsonc))', { cwd }))
    .concat(
      glob.sync('.prettierrc?(.@(cjs|config.js|config.cjs|yaml|yml|json|json5|toml))', { cwd }),
    )
    .concat(glob.sync('tslint.@(yaml|yml|json)', { cwd }))
    .concat(glob.sync('.kylerc?(.@(yaml|yml|json))', { cwd }));
};

/**
 * 待重写的配置
 * @param cwd
 */
const checkReWriteConfig = (cwd: string) => {
  return glob
    // 查找配置目录下的 .ejs 模板文件
    .sync('**/*.ejs', { cwd: path.resolve(__dirname, '../config') })
    // 将其转换为实际的配置文件名
    .map((name) => name.replace(/^_/, '.').replace(/\.ejs$/, ''))
    // 并检查这些文件是否存在于项目中，返回需要重写的配置文件路径
    .filter((filename) => fs.existsSync(path.resolve(cwd, filename)));
};

export default async (cwd: string, rewriteConfig?: boolean) => {
  // 获取并解析 package.json 文件
  const pkgPath = path.resolve(cwd, 'package.json');
  const pkg: PKG = fs.readJSONSync(pkgPath);
  // 获取 package.json 中的依赖项
  const dependencies = ([] as string[]).concat(
    Object.keys(pkg.dependencies || {}),
    Object.keys(pkg.devDependencies || []),
  );
  // 移除掉符合条件的依赖项
  const willRemovePackage = dependencies.filter(
    (name) =>
      packageNamesToRemove.includes(name) ||
      packagePrefixesToRemove.some((prefix) => name.startsWith(prefix)),
  );
  // 待删除的无用配置
  const uselessConfig = checkUselessConfig(cwd);
  // 待重写的配置
  const reWriteConfig = checkReWriteConfig(cwd);
  // 需要变更的总数量
  const willChangeCount = willRemovePackage.length + uselessConfig.length + reWriteConfig.length;

  // 提示是否移除原配置
  if (willChangeCount > 0) {
    log.warn(`检测到项目中存在可能与 ${PKG_NAME} 冲突的依赖和配置，为保证正常运行将`);

    if (willRemovePackage.length > 0) {
      log.warn('删除以下依赖：');
      log.warn(JSON.stringify(willRemovePackage, null, 2));
    }

    if (uselessConfig.length > 0) {
      log.warn('删除以下配置文件：');
      log.warn(JSON.stringify(uselessConfig, null, 2));
    }

    if (reWriteConfig.length > 0) {
      log.warn('覆盖以下配置文件：');
      log.warn(JSON.stringify(reWriteConfig, null, 2));
    }

    // 如果 rewriteConfig 没有被明确指定，则通过 inquirer 询问用户是否继续操作；
    if (typeof rewriteConfig === 'undefined') {
      const { isOverWrite } = await inquirer.prompt({
        type: 'confirm',
        name: 'isOverWrite',
        message: '请确认是否继续：',
      });
      
      // 如果用户选择不继续，程序将退出
      if (!isOverWrite) process.exit(0);
    } else if (!reWriteConfig) {
      process.exit(0);
    }
  }

  // 移除所有检测到的无用配置文件
  for (const name of uselessConfig) {
    fs.removeSync(path.resolve(cwd, name));
  }

  // 从 package.json 中删除 ESLint、Stylelint 等配置，
  delete pkg.eslintConfig;
  delete pkg.eslintIgnore;
  delete pkg.stylelint;
  // 移除所有需要删除的依赖项
  for (const name of willRemovePackage) {
    delete (pkg.dependencies || {})[name];
    delete (pkg.devDependencies || {})[name];
  }
  // 将更新后的 package.json 写回磁盘
  fs.writeFileSync(path.resolve(cwd, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');

  return pkg;
};
