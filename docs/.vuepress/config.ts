import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'

module.exports = {
  bundler: viteBundler(),  // 使用 Vite 作为打包工具
  theme: defaultTheme(),   // 使用默认主题
  title: '编码规范文档',
  description: '为项目提供编码规范的文档说明',
  themeConfig: {
    sidebar: [
      '/',
      '/eslint/',
      '/stylelint/',
      '/commitlint/',
      '/markdownlint/'
    ]
  }
}