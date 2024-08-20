import { ESLint } from 'eslint';
import type { ScanResult } from '../../types';

/**
 * 格式化 ESLint 输出结果
 */
export function formatESLintResults(results: ESLint.LintResult[], quiet: boolean, eslint: ESLint): ScanResult[] {
  // 获取规则元数据
  const rulesMeta = eslint.getRulesMetaForResults(results);

  return results
    // 过滤掉没有错误和警告的 lint 结果。
    .filter(({ warningCount, errorCount }) => errorCount || warningCount)
    // 对每个 lint 结果进行映射，转换为格式化的 ScanResult 对象
    .map(
      ({
        filePath,
        messages,
        errorCount,
        warningCount,
        fixableErrorCount,
        fixableWarningCount,
      }) => ({
        filePath, // 文件路径
        errorCount, // 错误数量
        warningCount: quiet ? 0 : warningCount, // 警告数量
        fixableErrorCount, // 可修复的错误数量
        fixableWarningCount: quiet ? 0 : fixableWarningCount, // 可修复的警告数量
        messages: messages
          .map(({ line = 0, column = 0, ruleId, message, fatal, severity }) => {
            return {
              line,
              column,
              rule: ruleId,
              url: rulesMeta[ruleId]?.docs?.url || '', // 从 rulesMeta 中获取规则的 URL
              message: message.replace(/([^ ])\.$/u, '$1'),
              errored: fatal || severity === 2, // 标志，表示是否为错误或致命错误
            };
          }) // dont check ruleId, which can be null
          // https://eslint.org/docs/developer-guide/nodejs-api.html#-lintmessage-type
          // 如果 quiet 为 true，则只保留错误的消息；否则保留所有消息
          .filter(({ errored }) => (quiet ? errored : true)),
      }),
    );
}
