/**
 * 根据当前工作目录和包信息来决定使用哪种ESLint配置
 * 返回lxl-eslint-config/react/xxx、lxl-eslint-config/typescript/react/xxx
 */
import glob from 'glob';
import type { PKG } from '../../types';

/**
 * 获取 ESLint 配置类型
 * @param cwd
 * @param pkg
 * @returns eslint-config-encode/index
 * @returns eslint-config-encode/react
 * @returns eslint-config-encode/typescript/index
 * @returns eslint-config-encode/typescript/react
 */
export function getESLintConfigType(cwd: string, pkg: PKG): string {
  // 查找所有非 node_modules 目录下的 .ts 或 .tsx 文件
  const tsFiles = glob.sync('./!(node_modules)/**/*.@(ts|tsx)', { cwd });
  // 查找所有非 node_modules 目录下的 .jsx 或 .tsx 文件
  const reactFiles = glob.sync('./!(node_modules)/**/*.@(jsx|tsx)', { cwd });
  // 查找所有非 node_modules 目录下的 .vue 文件
  const vueFiles = glob.sync('./!(node_modules)/**/*.vue', { cwd });
  // 获取项目依赖中的所有依赖名称
  const dependencies = Object.keys(pkg.dependencies || {});
  // 如果存在 .ts 或 .tsx 文件，则设置 language 为 'typescript'
  const language = tsFiles.length > 0 ? 'typescript' : '';
  let dsl = '';

  // dsl判断
  if (reactFiles.length > 0 || dependencies.some((name) => /^react(-|$)/.test(name))) {
    dsl = 'react';
  } else if (vueFiles.length > 0 || dependencies.some((name) => /^vue(-|$)/.test(name))) {
    dsl = 'vue';
  } else if (dependencies.some((name) => /^rax(-|$)/.test(name))) {
    dsl = 'rax';
  }

  // 返回lxl-eslint-config/react/xxx、lxl-eslint-config/typescript/react/xxx
  return (
    'lxl-eslint-config/' + `${language}/${dsl}`.replace(/\/$/, '/index').replace(/^\//, '')
  );
}
