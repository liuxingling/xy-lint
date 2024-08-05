import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  bundler: viteBundler(),  // 使用 Vite 作为打包工具
  theme: defaultTheme(),   // 使用默认主题
  base: '/xy-lint/',
  title: '编码规范文档',
  description: '为项目提供编码规范的文档说明',
})