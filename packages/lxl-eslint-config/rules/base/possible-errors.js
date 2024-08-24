/**
 * 可能的错误
 */
module.exports = {
  rules: {
    // 禁止 for 循环出现方向错误的循环，比如 for (i = 0; i < 10; i--)
    'for-direction': 'error',
    // getter 必须有返回值，并且禁止返回空，比如 return;
    'getter-return': [
      'error',
      {
        allowImplicit: false,
      },
    ],
    // 不要在循环中使用 await，应使用 Promise.all()
    'no-await-in-loop': 'warn',
    // 禁止与负零进行比较
    'no-compare-neg-zero': 'error',
    // 不要在条件表达式中使用赋值语句
    'no-cond-assign': ['error', 'always'],
    // 生产环境禁止使用 console
    'no-console': 'warn',
    // 禁止在条件判断中使用常量，如if (true) { // do nothing},但可以在循环中使用，如while (true) {break; // 假设有某种条件会跳出循环}
    'no-constant-condition': [
      'error',
      {
        checkLoops: false,
      },
    ],
    // 禁止在正则表达式中出现 Ctrl 键的 ASCII 表示，即禁止使用 /\x1f/
    // @off 几乎不会遇到这种场景
    'no-control-regex': 'off',
    // 禁止使用 debugger
    'no-debugger': 'error',
    // 禁止在函数参数中出现重复名称的参数
    'no-dupe-args': 'error',
    // 禁止在对象字面量中出现重复名称的键名（key）
    'no-dupe-keys': 'error',
    // 禁止在 switch 语句中出现重复测试表达式的 case
    'no-duplicate-case': 'error',
    // 禁止出现空代码块，允许 catch 为空代码块
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    // 禁止在正则表达式中使用空的字符集 []
    'no-empty-character-class': 'error',
    // 禁止将 catch 的第一个参数 error 重新赋值
    'no-ex-assign': 'error',
    // 禁止不必要的布尔类型转换，比如 !! 或 Boolean
    'no-extra-boolean-cast': 'error',
    // 禁止不必要的小括号
    'no-extra-parens': [
      'off',
      'all',
      {
        // 允许在条件赋值中使用额外括号
        conditionalAssign: true,
        // 不允许在嵌套的二元表达式中使用不必要的括号，如：((a + b) * c)
        nestedBinaryExpressions: false,
        // 不允许在return语句中的赋值表达式周围使用不必要的括号，如：return (a = b)
        returnAssign: false,
        // 在JSX中忽略此规则
        ignoreJSX: 'all',
        // 不对箭头函数中的条件表达式强制使用此规则
        enforceForArrowConditionals: false,
      },
    ],
    // 禁止出现多余的分号
    'no-extra-semi': 'error',
    // 禁止将一个函数声明重新赋值，如：// function foo() {} foo = bar
    'no-func-assign': 'error',
    // 禁止在 if 代码块内出现函数声明.both:不允许在嵌套块中声明 function 和 var
    'no-inner-declarations': ['error', 'both'],
    // 禁止在 RegExp 构造函数中出现非法的正则表达式
    'no-invalid-regexp': 'error',
    // 禁止使用特殊空白符（比如全角空格），除非是出现在字符串、正则表达式或模版字符串中
    'no-irregular-whitespace': [
      'error',
      {
        // 允许字符串字面量中的任何空白字符
        skipStrings: true,
        // 禁止注释中包含任何空白字符
        skipComments: false,
        // 允许正则表达式字面量中的任何空白字符
        skipRegExps: true,
        // 允许模板字面量中存在任何空白字符
        skipTemplates: true,
      },
    ],
    // 禁止在正则的字符集语法 [] 中使用由多个字符点构成的字符
    'no-misleading-character-class': 'error',
    // 禁止将 Math, JSON 或 Reflect 直接作为函数调用
    'no-obj-calls': 'error',
    // 不要直接在对象上调用 Object.prototypes 上的方法
    'no-prototype-builtins': 'error',
    // 禁止在正则表达式中出现连续的空格，必须使用 /foo {3}bar/ 代替
    'no-regex-spaces': 'error',
    // 禁止在数组中出现连续的逗号，如 let foo = [,,]
    'no-sparse-arrays': 'error',
    // 禁止在普通字符串中出现模版字符串里的变量形式，如 'Hello ${name}!'
    // 但不排除有时普通字符串内容就是这样，因此这条开为 warn 级别
    'no-template-curly-in-string': 'warn',
    // 禁止出现难以理解的多行表达式，如：
    // let foo = bar
    // [1, 2, 3].forEach(baz);
    'no-unexpected-multiline': 'error',
    // 禁止在 return, throw, break 或 continue 之后还有代码
    'no-unreachable': 'error',
    // 禁止在 finally 中出现 return, throw, break 或 continue
    'no-unsafe-finally': 'error',
    // 禁止在 in 或 instanceof 操作符的左侧使用感叹号，如 if (!key in object)
    'no-unsafe-negation': 'error',
    // 避免因使用 await 或 yield 导致的竞争性赋值
    'require-atomic-updates': 'warn',
    // 必须使用 isNaN(foo) 而不是 foo === NaN
    'use-isnan': 'error',
    // 注释必须符合 jsdoc 的规范，jsdoc 要求太严格
    'valid-jsdoc': 'off',
    // typeof 表达式比较的对象必须是 'undefined', 'object', 'boolean', 'number', 'string', 'function' 或 'symbol'
    'valid-typeof': 'error',
  },
};
