/*
 * @Author: 刘 星玲 286735685@qq.com
 * @Date: 2024-08-04 14:19:07
 * @LastEditors: 刘 星玲 286735685@qq.com
 * @LastEditTime: 2024-08-04 14:19:13
 * @FilePath: /cdddrmyy-web/Users/liuxingling/work2024/encode-pro/xy-lint-0802/packages/lxl-commitlint-config/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
  parserPreset: "conventional-changelog-conventionalcommits",
  rules: {
    "body-leading-blank": [1, "always"],
    "body-max-line-length": [2, "always", 100],
    "footer-leading-blank": [1, "always"],
    "footer-max-line-length": [2, "always", 100],
    "header-max-length": [2, "always", 100],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [0],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "test", "refactor", "chore", "revert"],
    ],
  },
};
