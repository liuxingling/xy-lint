import { LintResult } from 'stylelint';
import type { ScanResult } from '../../types';
import { getStylelintRuleDocUrl } from './getStylelintDocUrl';

/**
 * 格式化 Stylelint 输出结果
 */
export function formatStylelintResults(results: LintResult[], quiet: boolean): ScanResult[] {
  return results.map(({ source, warnings }) => {
    let errorCount = 0; // 错误数量
    let warningCount = 0; // 警告数量
    const messages = warnings
      // 筛选出需要显示的信息（如果 quiet 为 true，则只保留 error 级别的警告）
      .filter((item) => !quiet || item.severity === 'error')
      .map((item) => {
        const { line = 0, column = 0, rule, severity, text } = item;
        if (severity === 'error') {
          errorCount++;
        } else {
          warningCount++;
        }
        return {
          line,
          column,
          rule,
          url: getStylelintRuleDocUrl(rule),
          message: text.replace(/([^ ])\.$/u, '$1').replace(new RegExp(`\\(${rule}\\)`), ''),
          errored: severity === 'error',
        };
      });

    return {
      filePath: source,
      messages,
      errorCount,
      warningCount,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
    };
  });
}
