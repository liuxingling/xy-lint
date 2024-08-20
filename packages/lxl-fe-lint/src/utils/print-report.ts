/**
 * 在控制台中以美观的方式打印扫描报告，包括错误和警告的详细信息以及摘要
 */
import chalk from 'chalk'; // 用于控制台输出的颜色化  
import table from 'text-table'; // 用于在终端中生成表格
import terminalLink from 'terminal-link'; // 用于生成可点击的链接
import isDocker from 'is-docker'; // 用于检测程序是否运行在 Docker 容器内
import stripAnsi from 'strip-ansi'; // 用于去除字符串中的 ANSI 转义序列
import { PKG_NAME, UNICODE } from './constants';
import type { ScanResult } from '../types';

/**
 * 在控制台打印扫描报告
 * @param results
 * @param fix
 */
export default (results: ScanResult[], fix: boolean): void => {
  // 输出字符串
  let output = '\n';
  // 错误数量
  let errorCount = 0;
  // 警告数量
  let warningCount = 0;
  // 可修复的错误数量
  let fixableErrorCount = 0;
  // 可修复的警告数量
  let fixableWarningCount = 0;
  // 确定最终摘要的颜色
  let summaryColor = 'yellow';

  // 消息转换函数
  const transformMessage = ({ line, column, rule, url, message, errored }) => {
    if (errored) summaryColor = 'red';
    let text = '';
    if (rule && url) {
      // 创建一个可点击的链接
      text = terminalLink(chalk.blue(rule), chalk.dim(` ${url} `), { fallback: !isDocker() });
    } else if (rule) {
      text = chalk.blue(rule);
    }

    return [
      '',
      chalk.dim(`${line}:${column}`),
      errored ? chalk.red('error') : chalk.yellow('warning'),
      message,
      text,
    ];
  };

  for (const result of results) {
    // 跳过无消息的结果
    if (result.messages.length === 0) continue;
    const { messages } = result;

    errorCount += result.errorCount;
    warningCount += result.warningCount;
    fixableErrorCount += result.fixableErrorCount;
    fixableWarningCount += result.fixableWarningCount;

    // 使用 chalk.underline 使文件路径加粗
    output += `${chalk.underline(result.filePath)}\n`;
    // 格式化输出
    output += `${table(messages.map(transformMessage), {
      align: ['.', 'r', 'l'],
      stringLength: (str) => stripAnsi(str).length,
    })}\n\n`;
  }

  // 计算总的问题数量
  const total = errorCount + warningCount;
  // 根据数量返回单数或复数形式的单词
  const pluralize = (word, count) => (count === 1 ? word : `${word}s`);

  // 修复日志
  if (fix) output += chalk.green('代码规范问题自动修复完成，请通过 git diff 确认修复效果 :D\n');
  if (fix && total > 0) {
    output += chalk.green('ps. 以上显示的是无法被自动修复的问题，需要手动进行修复\n');
  }

  // 扫描日志，预期:
  // ✖ x problems (y errors, z warnings)
  // y error and z warnings potentially fixable with the `lxl-fe-lint fix`
  //
  // ✔ no problems
  // 如果没有进行修复操作且存在错误或警告，输出错误摘要
  if (!fix && total > 0) {
    output += chalk[summaryColor].bold(
      [
        `${UNICODE.failure} `,
        total,
        pluralize(' problem', total),
        ' (',
        errorCount,
        pluralize(' error', errorCount),
        ', ',
        warningCount,
        pluralize(' warning', warningCount),
        ')\n',
      ].join(''),
    );
    if (fixableErrorCount > 0 || fixableWarningCount > 0) {
      output += chalk[summaryColor].bold(
        [
          '  ',
          fixableErrorCount,
          pluralize(' error', fixableErrorCount),
          ' and ',
          fixableWarningCount,
          pluralize(' warning', fixableWarningCount),
          ` potentially fixable with the \`${PKG_NAME} fix\``,
        ].join(''),
      );
    }
  }
  // 如果没有进行修复操作且没有问题，输出成功信息
  if (!fix && total === 0) output = chalk.green.bold(`${UNICODE.success} no problems`);

  // 使用 chalk.reset 清除所有样式并输出最终的 output 字符串
  console.log(chalk.reset(output));
};
