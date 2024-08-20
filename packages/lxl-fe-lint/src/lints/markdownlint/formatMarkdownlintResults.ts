/**
 * 接收 Markdownlint 的原始 lint 结果，并将其转换为一个统一格式的结果数组，以便于后续处理或展示
 */
import markdownlint from 'markdownlint';
import type { ScanResult } from '../../types';

/**
 * 格式化 markdownlint 输出结果
 */
export function formatMarkdownlintResults(
  results: markdownlint.LintResults, // Markdownlint 的 lint 结果
  quiet: boolean, // 是否处于安静模式。如果是 true，则跳过某些输出
): ScanResult[] {
  // 存储格式化后的 lint 结果
  const parsedResults = [];

  for (const file in results) {
    // 不为对象自身属性或为安静模式，则跳过本次循环
    if (!Object.prototype.hasOwnProperty.call(results, file) || quiet) continue;

    // 警告总数
    let warningCount = 0;
    // 可修复警告总数
    let fixableWarningCount = 0;
    const messages = results[file].map(
      ({ lineNumber, ruleNames, ruleDescription, ruleInformation, errorRange, fixInfo }) => {
        // 当前消息包含 fixInfo（表示可修复），则增加 fixableWarningCount
        if (fixInfo) fixableWarningCount++;
        warningCount++;

        // 返回格式化的消息对象
        return {
          line: lineNumber,
          column: Array.isArray(errorRange) ? errorRange[0] : 1,
          rule: ruleNames[0],
          url: ruleInformation,
          message: ruleDescription,
          errored: false,
        };
      },
    );


    parsedResults.push({
      filePath: file,
      messages,
      errorCount: 0,
      warningCount,
      fixableErrorCount: 0,
      fixableWarningCount,
    });
  }

  return parsedResults;
}
