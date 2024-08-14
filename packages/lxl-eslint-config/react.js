module.exports = {
  extends: ['./index', './rules/react'].map(require.resolve), // 通过 require.resolve 方法，将相对路径解析为绝对路径
  // 配置解析器选项
  parserOptions: {
    // 直接向 Babel 传递配置
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
};
