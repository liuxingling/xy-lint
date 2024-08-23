/**
 * 根据提供的扫描选项、包信息、配置信息，生成一个适配当前项目的eslint配置
 * 考虑了用户自定义的配置、是否存在.eslintrc、.eslintignore文件因素，并根据这些条件调整配置
 */
import { ESLint } from 'eslint';
import fs from 'fs-extra'; // 用于增强的文件系统操作
import glob from 'glob'; // 用于查找匹配模式的文件路径
import path from 'path'; // 用于处理文件路径
import type { Config, PKG, ScanOptions } from '../../types';
import { ESLINT_FILE_EXT } from '../../utils/constants';
import { getESLintConfigType } from './getESLintConfigType';

/**
 * 获取 ESLint 配置
 */
export function getESLintConfig(opts: ScanOptions, pkg: PKG, config: Config): ESLint.Options {
  const { cwd, fix, ignore } = opts;
  const lintConfig: ESLint.Options = {
    cwd, // 当前工作目录
    fix, // 是否启用自动修复
    ignore, // 是否启用忽略规则
    extensions: ESLINT_FILE_EXT, // 支持的文件扩展名
    errorOnUnmatchedPattern: false, // 是否在找不到匹配的文件时抛出错误
  };

  // 如果用户提供了自定义的 eslintOptions
  if (config.eslintOptions) {
    // 则覆盖 lintConfig 的默认值
    Object.assign(lintConfig, config.eslintOptions);
  } else {
    // 根据扫描目录下有无lintrc文件，若无则使用默认的 lint 配置
    // 查找 .eslintrc 配置文件
    const lintConfigFiles = glob.sync('.eslintrc?(.@(js|yaml|yml|json))', { cwd });
    // 没有找到 .eslintrc 文件并且 pkg.eslintConfig 也不存在
    if (lintConfigFiles.length === 0 && !pkg.eslintConfig) {
      // 设置 resolvePluginsRelativeTo 为当前文件所在目录的上级上级目录。
      lintConfig.resolvePluginsRelativeTo = path.resolve(__dirname, '../../');
      lintConfig.useEslintrc = false; // 禁用 .eslintrc 文件
      // 设置 baseConfig
      lintConfig.baseConfig = {
        extends: [
          getESLintConfigType(cwd, pkg),
          //  ESLint 不再管格式问题，直接使用 Prettier 进行格式化
          ...(config.enablePrettier ? ['prettier'] : []),
        ],
      };
    }

    // 获取 .eslintignore 文件的路径
    const lintIgnoreFile = path.resolve(cwd, '.eslintignore');
    // 如果没有找到 .eslintignore 文件并且 pkg.eslintIgnore 也不存在
    if (!fs.existsSync(lintIgnoreFile) && !pkg.eslintIgnore) {
      // 设置 ignorePath 为默认的 .eslintignore 文件路径。
      lintConfig.ignorePath = path.resolve(__dirname, '../config/_eslintignore.ejs');
    }
  }

  return lintConfig;
}
