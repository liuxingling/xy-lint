/**
 * 扫描代码中的规范问题
 */
import fs from 'fs-extra';
import path from 'path';
import { doESLint, doMarkdownlint, doPrettier, doStylelint } from '../lints';
import type { Config, PKG, ScanOptions, ScanReport, ScanResult } from '../types';
import { PKG_NAME } from '../utils/constants';

export default async (options: ScanOptions): Promise<ScanReport> => {
  const { cwd, fix, outputReport, config: scanConfig } = options;

  // 读取指定路径下的配置文件
  const readConfigFile = (pth: string): any => {
    const localPath = path.resolve(cwd, pth);
    return fs.existsSync(localPath) ? require(localPath) : {};
  };
  // 从 package.json 文件读取的包信息
  const pkg: PKG = readConfigFile('package.json');
  // 读取扫描配置
  const config: Config = scanConfig || readConfigFile(`${PKG_NAME}.config.js`);
  // 收集执行过程中出现的错误
  const runErrors: Error[] = [];
  // 存储扫描结果
  let results: ScanResult[] = [];


  // 根据配置决定是否执行 doPrettier, doESLint, doStylelint, doMarkdownlint，
  // 捕获可能抛出的异常，并将其添加到 runErrors 数组中

  // prettier
  if (fix && config.enablePrettier !== false) {
    await doPrettier(options);
  }

  // eslint
  if (config.enableESLint !== false) {
    try {
      const eslintResults = await doESLint({ ...options, pkg, config });
      results = results.concat(eslintResults);
    } catch (e) {
      runErrors.push(e);
    }
  }

  // stylelint
  if (config.enableStylelint !== false) {
    try {
      const stylelintResults = await doStylelint({ ...options, pkg, config });
      results = results.concat(stylelintResults);
    } catch (e) {
      runErrors.push(e);
    }
  }

  // markdown
  if (config.enableMarkdownlint !== false) {
    try {
      const markdownlintResults = await doMarkdownlint({ ...options, pkg, config });
      results = results.concat(markdownlintResults);
    } catch (e) {
      runErrors.push(e);
    }
  }

  // 生成报告报告文件
  if (outputReport) {
    const reportPath = path.resolve(process.cwd(), `./${PKG_NAME}-report.json`);
    // fs.outputFile：异步地将数据写入文件
    fs.outputFile(reportPath, JSON.stringify(results, null, 2), () => {});
  }

  // 返回扫描报告
  return {
    results,
    errorCount: results.reduce((count, { errorCount }) => count + errorCount, 0),
    warningCount: results.reduce((count, { warningCount }) => count + warningCount, 0),
    runErrors,
  };
};
