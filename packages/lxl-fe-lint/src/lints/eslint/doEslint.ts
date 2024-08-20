/**
 * 执行 ESLint 的 lint 检查，并返回格式化后的 lint 结果
 */
import { ESLint } from 'eslint';
import fg from 'fast-glob';
import { extname, join } from 'path';
import { Config, PKG, ScanOptions } from '../../types';
import { ESLINT_FILE_EXT, ESLINT_IGNORE_PATTERN } from '../../utils/constants';
import { formatESLintResults } from './formatESLintResults';
import { getESLintConfig } from './getESLintConfig';

export interface DoESLintOptions extends ScanOptions {
  pkg: PKG;
  config?: Config;
}

export async function doESLint(options: DoESLintOptions) {
  let files: string[];
  if (options.files) {
    // 筛选出符合 ESLint 支持的文件扩展名的文件
    files = options.files.filter((name) => ESLINT_FILE_EXT.includes(extname(name)));
  } else {
    // 查找符合扩展名的文件
    files = await fg(`**/*.{${ESLINT_FILE_EXT.map((t) => t.replace(/^\./, '')).join(',')}}`, {
      cwd: options.cwd,
      ignore: ESLINT_IGNORE_PATTERN,
    });
  }

  // 根据获取的选项配置创建实例
  const eslint = new ESLint(getESLintConfig(options, options.pkg, options.config));
  // 执行 lint 检查
  const reports = await eslint.lintFiles(files);
  if (options.fix) {
    // 自动修复可修复的 lint 问题
    await ESLint.outputFixes(reports);
  }
  // 格式化 lint 结果
  return formatESLintResults(reports, options.quiet, eslint);
}
