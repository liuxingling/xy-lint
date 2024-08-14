/**
 * 获取当前系统的包管理器类型 npm/pnpm
 */
// 用于判断特定的命令是否存在于系统中
import { sync as commandExistsSync } from 'command-exists';

/**
 * npm 类型
 */
const promise: Promise<'npm' | 'pnpm'> = new Promise((resolve) => {
  if (!commandExistsSync('pnpm')) return resolve('npm');

  resolve('pnpm');
});

export default promise;
