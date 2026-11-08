/**
 * 桌面大肥鱼插件 - Client 侧（浏览器端）
 * 
 * 提供桌面端的可视化组件和设置页面
 * 
 * @module client.js
 */

// 导出客户端入口，供 DSH Web 端加载
export { default as DesktopFatFishWidget } from './components/DesktopFatFishWidget.vue'
export { default as DesktopFatFishSettings } from './components/DesktopFatFishSettings.vue'

// 组件注册信息
export const clientMeta = {
  name: 'desktop-fat-fish',
  version: '1.0.0',
  widgets: [
    {
      name: 'DesktopFatFishWidget',
      displayName: '桌面大肥鱼',
      description: '一只可爱的大肥鱼游弋在桌面上',
      category: 'desktop',
      defaultSize: { width: 200, height: 200 },
      resizable: true
    }
  ],
  settings: [
    {
      name: 'DesktopFatFishSettings',
      displayName: '大肥鱼设置',
      description: '配置大肥鱼的行为和外观',
      route: '/settings/desktop-fat-fish'
    }
  ]
}