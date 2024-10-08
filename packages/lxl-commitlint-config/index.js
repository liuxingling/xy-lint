module.exports = {
  // 使用 conventional-changelog-conventionalcommits 作为解析器预设
  parserPreset: 'conventional-changelog-conventionalcommits',
  rules: {
    // 提交信息的 body 部分需要以一个空行开头
    'body-leading-blank': [1, 'always'],
    // body 部分的每一行最大长度为 100 个字符
    'body-max-line-length': [2, 'always', 100],
    // 提交信息的 footer 部分需要以一个空行开头
    'footer-leading-blank': [1, 'always'],
    // footer 部分的每一行最大长度为 100 个字符
    'footer-max-line-length': [2, 'always', 100],
    // 提交信息的 header 部分最大长度为 100 个字符
    'header-max-length': [2, 'always', 100],
    // 提交信息的 scope 部分（如果存在）需要使用小写字母
    'scope-case': [2, 'always', 'lower-case'],
    // 不对 subject 部分的大小写进行检查
    'subject-case': [0],
    // 提交信息的 subject 部分不能是空的
    'subject-empty': [2, 'never'],
    // 提交信息的 subject 部分不能以句点 `.` 结尾
    'subject-full-stop': [2, 'never', '.'],
    // 提交信息的 type 部分需要使用小写字母
    'type-case': [2, 'always', 'lower-case'],
    // 提交信息的 type 部分不能为空
    'type-empty': [2, 'never'],
    // 允许的提交类型列表
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'test', 'refactor', 'chore', 'revert'],
    ],
  },
};
