import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  bundler: viteBundler(),  // 使用 Vite 作为打包工具
  theme: defaultTheme({
     // 默认主题配置
     navbar: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '脚手架',
        link: '/cli/lxl-fe-lint.md',
      },
    ],
  }),   // 使用默认主题
  base: '/xy-lint/',
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '编码规范文档',
      description: '为项目提供编码规范的文档说明',
    },
  },
})