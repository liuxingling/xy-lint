module.exports = {
  // 设置默认的严重性为警告
  defaultSeverity: "warning",

  // 使用 'stylelint-scss' 插件以支持 SCSS 特定规则
  plugins: ["stylelint-scss"],
  customSyntax: "postcss-lit"
  extends: "stylelint-config-standard-scss",

  rules: {
    /**
     * 可能的错误
     * @link https://stylelint.io/user-guide/rules/#possible-errors
     */
    // 禁用默认的 at-rule-no-unknown 规则，使用 SCSS 插件中的规则
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,

    // 禁用 block-no-empty 规则，允许空的代码块
    "block-no-empty": null,

    // 确保颜色值是有效的十六进制颜色
    "color-no-invalid-hex": true,

    // 确保注释内容不能为空
    "comment-no-empty": true,

    // 禁止在声明块中有重复的属性，除了值不同的连续重复属性
    "declaration-block-no-duplicate-properties": [
      true,
      {
        ignore: ["consecutive-duplicates-with-different-values"],
      },
    ],

    // 禁止使用缩写属性覆盖其他属性的值
    "declaration-block-no-shorthand-property-overrides": true,

    // 禁止字体系列中有重复的名称
    "font-family-no-duplicate-names": true,

    // 禁止在 calc() 函数中使用未间隔的运算符
    "function-calc-no-unspaced-operator": true,

    // 确保线性渐变的方向是标准的
    "function-linear-gradient-no-nonstandard-direction": true,

    // 禁止在关键帧中使用 !important
    "keyframe-declaration-no-important": true,

    // 确保媒体特性名称是已知的
    "media-feature-name-no-unknown": true,

    // 禁用 no-descending-specificity 规则，允许 CSS 选择器具有递减的特异性
    "no-descending-specificity": null,

    // 禁止重复的 @import 规则
    "no-duplicate-at-import-rules": true,

    // 禁止重复的选择器
    "no-duplicate-selectors": true,

    // 禁用 no-empty-source 规则，允许空的源文件
    "no-empty-source": null,

    // 禁止无效的双斜杠注释
    "no-invalid-double-slash-comments": true,

    // 确保属性名称是已知的
    "property-no-unknown": true,

    // 确保伪类是已知的，允许 global、local 和 export
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "local", "export"],
      },
    ],

    // 确保伪元素是已知的
    "selector-pseudo-element-no-unknown": true,

    // 禁止字符串中出现换行符
    "string-no-newline": true,

    // 确保单位是已知的，允许 rpx 单位
    "unit-no-unknown": [
      true,
      {
        ignoreUnits: ["rpx"],
      },
    ],

    /**
     * 风格问题
     * @link https://stylelint.io/user-guide/rules/list#stylistic-issues
     */

    // 颜色十六进制值需要使用短格式（如 #fff 而不是 #ffffff）
    "color-hex-length": ["short"],

    // 注释内部需要空格
    "comment-whitespace-inside": ["always"],

    // 属性声明的冒号前不需要空格
    "declaration-colon-space-before": ["never"],

    // 属性声明的冒号后需要空格
    "declaration-colon-space-after": ["always"],

    // 单行声明块中的最大声明数为 1
    "declaration-block-single-line-max-declarations": [1],

    // 声明块需要尾部分号，并将其标记为错误
    "declaration-block-trailing-semicolon": [
      "always",
      {
        severity: "error",
      },
    ],

    // 禁止在零长度值中使用单位，允许在自定义属性中使用单位
    "length-zero-no-unit": [
      true,
      {
        ignore: ["custom-properties"],
      },
    ],

    // 最大行长度为 100 个字符
    "max-line-length": [100],

    // 最大允许的 ID 选择器数量为 0
    "selector-max-id": [0],

    /**
     * stylelint-scss 插件规则
     * @link https://www.npmjs.com/package/stylelint-scss
     */
    // SCSS 双斜杠注释内部需要空格
    "scss/double-slash-comment-whitespace-inside": ["always"],
  },

  // 忽略所有 JavaScript 和 TypeScript 文件
  ignoreFiles: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
};
