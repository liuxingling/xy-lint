/**
 * 获取已暂存的提交中的文件列表、以及获取未暂存但已被修改的文件列表。
 * 用于自动化脚本或者 CI/CD 流程中，以便在提交前检查文件状态
 */
import execa from 'execa';

/**
 * 获取已暂存的提交中的文件列表
 * @param options
 */
export const getCommitFiles = async (options: execa.Options = {}): Promise<string[]> => {
  try {
    const { stdout } = await execa(
      'git',
      [
        'diff',
        '--staged', // 比较 暂缓区 与 last commit 的差别
        '--diff-filter=ACMR', // 只显示 added、copied、modified、renamed 的文件
        '--name-only', // 只显示更改文件的名称
        '--ignore-submodules', // 忽略子模块的变化
      ],
      {
        ...options,
        all: true, // 允许传递所有选项到 execa
        cwd: options.cwd || process.cwd(), // 设置命令执行的工作目录，默认为当前工作目录
      },
    );

    // 分割成数组，并过滤掉空字符串
    return stdout ? stdout.split(/\s/).filter(Boolean) : [];
  } catch (e) {
    return [];
  }
};

/**
 * 获取未暂存但已被修改的文件列表
 * @param options
 */
export const getAmendFiles = async (options: execa.Options = {}): Promise<string> => {
  try {
    const { stdout } = await execa(
      'git',
      [
        'diff', // 比较 工作区 与 暂缓区的差别
        '--name-only', // 只显示更改文件的名称
      ],
      {
        ...options,
        all: true, // 允许传递所有选项到 execa
        cwd: options.cwd || process.cwd(), // 设置命令执行的工作目录，默认为当前工作目录
      },
    );

    // 直接返回 stdout
    return stdout;
  } catch (e) {
    return '';
  }
};
