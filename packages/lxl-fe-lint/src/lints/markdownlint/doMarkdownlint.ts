/**
 * 执行 Markdownlint 的 lint 检查，根据配置自动修复可修复的错误
 */
import fg from 'fast-glob';
import { readFile, writeFile } from 'fs-extra';
import markdownlint, { LintError } from 'markdownlint';
import markdownlintRuleHelpers from 'markdownlint-rule-helpers';
import { extname, join } from 'path';
import { Config, PKG, ScanOptions } from '../../types';
import { MARKDOWN_LINT_FILE_EXT, MARKDOWN_LINT_IGNORE_PATTERN } from '../../utils/constants';
import { formatMarkdownlintResults } from './formatMarkdownlintResults';
import { getMarkdownlintConfig } from './getMarkdownlintConfig';

export interface DoMarkdownlintOptions extends ScanOptions {
  pkg: PKG;
  config?: Config;
}

export async function doMarkdownlint(options: DoMarkdownlintOptions) {
  let files: string[];
  if (options.files) {
    // 过滤只包含 Markdown 文件
    files = options.files.filter((name) => MARKDOWN_LINT_FILE_EXT.includes(extname(name)));
  } else {
    // 构造 glob 模式，pattern 为 glob 模式字符串。
    // 假设 MARKDOWN_LINT_FILE_EXT 的值为 [".md", ".mkd", ".mdown"]，最终字符串是 `**/*.{md,mkd,mdown}`
    const pattern = join(
      options.include,
      `**/*.{${MARKDOWN_LINT_FILE_EXT.map((t) => t.replace(/^\./, '')).join(',')}}`,
    );
    // 使用 fast-glob 查找匹配的 Markdown 文件
    files = await fg(pattern, {
      cwd: options.cwd,
      ignore: MARKDOWN_LINT_IGNORE_PATTERN,
    });
  }
  // 执行 lint 检查
  const results = await markdownlint.promises.markdownlint({
    ...getMarkdownlintConfig(options, options.pkg, options.config),
    files,
  });
  // 修复
  if (options.fix) {
    await Promise.all(
      Object.keys(results).map((filename) => formatMarkdownFile(filename, results[filename])),
    );
  }
  // 格式化 lint 结果
  return formatMarkdownlintResults(results, options.quiet);
}

// 修复指定文件中的 lint 错误
async function formatMarkdownFile(filename: string, errors: LintError[]) {
  // 可修复的错误
  const fixes = errors?.filter((error) => error.fixInfo);

  if (fixes?.length > 0) {
    // 读取文件内容
    const originalText = await readFile(filename, 'utf8');
    // 应用修复操作
    const fixedText = markdownlintRuleHelpers.applyFixes(originalText, fixes);
    // 修复后的内容与原始内容不同
    if (originalText !== fixedText) {
      // 写入修复后的内容
      await writeFile(filename, fixedText, 'utf8');
      // 如果文件被修复，则返回未修复的错误
      return errors.filter((error) => !error.fixInfo);
    }
  }
  // 返回所有的 lint 错误
  return errors;
}
