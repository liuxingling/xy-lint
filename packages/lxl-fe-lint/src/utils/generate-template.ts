/**
 * 根据模板文件生成配置文件，并将它们写入到项目中指定的目录
 */
import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import glob from 'glob'; // 用于文件路径的模式匹配，这里用来查找模板文件
import ejs from 'ejs'; // 用于在模板中嵌入 JavaScript
import {
  ESLINT_IGNORE_PATTERN,
  STYLELINT_FILE_EXT,
  STYLELINT_IGNORE_PATTERN,
  MARKDOWN_LINT_IGNORE_PATTERN,
} from './constants';

/**
 * vscode 配置合并
 * @param filepath
 * @param content
 */
const mergeVSCodeConfig = (filepath: string, content: string) => {
  // 不需要 merge
  if (!fs.existsSync(filepath)) return content;

  try {
    // 读取现有的配置文件，并解析为 JSON 对象
    const targetData = fs.readJSONSync(filepath);
    // 将新生成的内容解析为 JSON 对象
    const sourceData = JSON.parse(content);
    // 递归合并两个对象。如果某些属性是数组，则去重后合并数组
    // 将合并后的对象转换回 JSON 字符串，并美化格式化（缩进 2 个空格）。
    return JSON.stringify(
      _.mergeWith(targetData, sourceData, (target, source) => {
        if (Array.isArray(target) && Array.isArray(source)) {
          return [...new Set(source.concat(target))];
        }
      }),
      null,
      2,
    );
  } catch (e) {
    return '';
  }
};

/**
 * 实例化模板
 * @param cwd
 * @param data
 * @param vscode
 */
export default (cwd: string, data: Record<string, any>, vscode?: boolean) => {
  // 获得模板文件所在的绝对路径
  const templatePath = path.resolve(__dirname, '../config');
  // 根据传入的模式在指定目录中同步查找文件。
  // _vscode/*.ejs 匹配 VSCode 专用的模板，**/*.ejs 匹配所有模板文件
  const templates = glob.sync(`${vscode ? '_vscode' : '**'}/*.ejs`, { cwd: templatePath });
  for (const name of templates) {
    // 生成目标文件的路径，将 .ejs 扩展名去掉，并将 _ 前缀替换为 .（主要针对 VSCode 配置文件）
    const filepath = path.resolve(cwd, name.replace(/\.ejs$/, '').replace(/^_/, '.'));
    // 使用 ejs 渲染模板文件，将模板文件内容转换为最终的配置文件内容。
    // 渲染时传入的上下文包括 ESLint、Stylelint、Markdownlint 的忽略模式和文件扩展名，还有传入的 data 数据
    let content = ejs.render(fs.readFileSync(path.resolve(templatePath, name), 'utf8'), {
      eslintIgnores: ESLINT_IGNORE_PATTERN,
      stylelintExt: STYLELINT_FILE_EXT,
      stylelintIgnores: STYLELINT_IGNORE_PATTERN,
      markdownLintIgnores: MARKDOWN_LINT_IGNORE_PATTERN,
      ...data,
    });

    // 如果模板文件是 VSCode 的配置文件,则合并已有的配置和新生成的配置
    if (/^_vscode/.test(name)) {
      content = mergeVSCodeConfig(filepath, content);
    }

    // 如果渲染后的内容为空，跳过文件生成
    if (!content.trim()) continue;

    // 将渲染后的内容写入到目标文件中，使用 UTF-8 编码
    fs.outputFileSync(filepath, content, 'utf8');
  }
};