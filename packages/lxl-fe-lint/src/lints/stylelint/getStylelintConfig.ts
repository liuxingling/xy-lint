/**
 * 根据提供的选项和配置生成 stylelint 的配置对象
 */
import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';
import { LinterOptions } from 'stylelint';
import type { Config, PKG, ScanOptions } from '../../types';
import { STYLELINT_IGNORE_PATTERN } from '../../utils/constants';

/**
 * 获取 Stylelint 配置
 */
export function getStylelintConfig(opts: ScanOptions, pkg: PKG, config: Config): LinterOptions {
  const { cwd, fix } = opts;
  // 没启用 stylelint，返回空对象
  if (config.enableStylelint === false) return {} as any;

  const lintConfig: any = {
    fix: Boolean(fix), // 是否启用自动修复
    allowEmptyInput: true, // 允许处理空输入
  };

  if (config.stylelintOptions) {
    // 若用户传入了 stylelintOptions，则合并到 lintConfig 中。
    Object.assign(lintConfig, config.stylelintOptions);
  } else {
    // 根据扫描目录下有无lintrc文件，若无则使用默认的 lint 配置
    const lintConfigFiles = glob.sync('.stylelintrc?(.@(js|yaml|yml|json))', { cwd });
    if (lintConfigFiles.length === 0 && !pkg.stylelint) {
      // 使用默认的 lint 配置
      lintConfig.config = {
        extends: 'lxl-stylelint-config',
      };
    }

    // 根据扫描目录下有无lintignore文件
    const ignoreFilePath = path.resolve(cwd, '.stylelintignore');
    if (!fs.existsSync(ignoreFilePath)) {
      // 使用默认的 ignore 配置
      lintConfig.ignorePattern = STYLELINT_IGNORE_PATTERN;
    }
  }

  return lintConfig;
}
