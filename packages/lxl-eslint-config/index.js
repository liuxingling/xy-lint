/**
 * 默认配置
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    commonjs: true,
    es6: true,
  },
  // 自定义规则集
  extends: [
    './rules/base/best-practices', // 最佳实践
    './rules/base/possible-errors', // 可能的错误
    './rules/base/style', // 风格问题
    './rules/base/variables', // 变量
    './rules/base/es6', // ES6
    './rules/base/strict', // 不限制严格模式
    './rules/imports', // 导入规则
  ],
  // 解析器
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // 不需要单独的 Babel 配置文件
    requireConfigFile: false,
    // ECMAScript 的版本
    ecmaVersion: 2020,
    // 使用的是 ES 模块
    sourceType: 'module',
    ecmaFeatures: {
      // 禁止在全局作用域中使用 return 语句
      globalReturn: false,
      // 启用全局严格模式（即 use strict）。
      impliedStrict: true,
      // 允许解析 JSX 语法。
      jsx: true,
    },
  },
  // 指定这是根配置文件，ESLint 将不会向上查找其他配置文件
  root: true,
};
