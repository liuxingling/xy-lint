/**
 * 格式化指定的文件
 */
import fg from 'fast-glob';
import { readFile, writeFile } from 'fs-extra';
import { extname, join } from 'path';
import prettier from 'prettier';
import { ScanOptions } from '../../types';
import { PRETTIER_FILE_EXT, PRETTIER_IGNORE_PATTERN } from '../../utils/constants';

export interface DoPrettierOptions extends ScanOptions {}

export async function doPrettier(options: DoPrettierOptions) {
  let files: string[] = [];
  if (options.files) {
    // 过滤只包含支持的文件
    files = options.files.filter((name) => PRETTIER_FILE_EXT.includes(extname(name)));
  } else {
    // 构造 glob 模式
    const pattern = join(
      options.include,
      `**/*.{${PRETTIER_FILE_EXT.map((t) => t.replace(/^\./, '')).join(',')}}`,
    );
    // 使用 fast-glob 查找匹配的文件
    files = await fg(pattern, {
      cwd: options.cwd,
      ignore: PRETTIER_IGNORE_PATTERN,
    });
  }
  // 并行处理所有文件
  await Promise.all(files.map(formatFile));
}

// 格式化单个文件
async function formatFile(filepath: string) {
  const text = await readFile(filepath, 'utf8');
  // 获取指定文件的 Prettier 配置
  const options = await prettier.resolveConfig(filepath);
  // 格式化文件内容
  const formatted = await prettier.format(text, { ...options, filepath });
  // 将格式化后的内容写回原文件
  await writeFile(filepath, formatted, 'utf8');
}
