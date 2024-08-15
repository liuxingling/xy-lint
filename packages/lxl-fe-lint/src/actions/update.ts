/**
 * 检查并安装最新版本的 NPM 包
 */
import { execSync } from 'child_process'; // 这个函数可以在子进程中同步执行命令行命令。与异步的 exec 相比，它会阻塞进程直到命令完成执行。
import ora from 'ora'; // 在命令行中显示加载动画
import log from '../utils/log';
import npmType from '../utils/npm-type';
import { PKG_NAME, PKG_VERSION } from '../utils/constants';


/**
 * 检查最新版本号
 */
const checkLatestVersion = async (): Promise<string | null> => {
  // 指定包管理工具
  const npm = await npmType;
  // 获取包的最新版本号
  const latestVersion = execSync(`${npm} view ${PKG_NAME} version`).toString('utf-8').trim();

  // 已经是最新版本了，不需要更新
  if (PKG_VERSION === latestVersion) return null;

  // 将当前版本号切割为数组
  const compareArr = PKG_VERSION.split('.').map(Number);
  // 将最新版本号切割为数组
  const beComparedArr = latestVersion.split('.').map(Number);

  // 依次比较版本号每一位大小
  for (let i = 0; i < compareArr.length; i++) {
    if (compareArr[i] > beComparedArr[i]) {
      return null;
    } else if (compareArr[i] < beComparedArr[i]) {
      return latestVersion;
    }
  }
  return null;
};

/**
 * 检查包的版本，发现新版本自动安装
 * @param install - 自动安装最新包
 */
export default async (install = true) => {
  const checking = ora(`[${PKG_NAME}] 正在检查最新版本...`);
  checking.start();

  try {
    const npm = await npmType;
    const latestVersion = await checkLatestVersion();
    checking.stop();

    if (latestVersion && install) {
      const update = ora(`[${PKG_NAME}] 存在新版本，将升级至 ${latestVersion}`);

      update.start();

      execSync(`${npm} i -g ${PKG_NAME}`);

      update.stop();
    } else if (latestVersion) {
      log.warn(
        `最新版本为 ${latestVersion}，本地版本为 ${PKG_VERSION}，请尽快升级到最新版本。\n你可以执行 ${npm} install -g ${PKG_NAME}@latest 来安装此版本\n`,
      );
    } else if (install) {
      log.info(`当前没有可用的更新`);
    }
  } catch (e) {
    checking.stop();
    log.error(e);
  }
};
