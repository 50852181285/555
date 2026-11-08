/**
 * 桌面大肥鱼插件 - Host 侧入口
 * 
 * 一只可爱的大肥鱼游弋在鸿蒙桌面上，支持喂食、互动、心情变化等功能
 * 
 * @module index.js
 */

import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

/** 插件名称 */
export const name = 'desktop-fat-fish'

/** 安装包目录 */
const PKG_URL = new URL('./', import.meta.url)
const PKG_DIR = fileURLToPath(PKG_URL)

/** 读取包版本 */
function readPackageVersion() {
  try {
    return String(JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8')).version ?? '')
  } catch {
    return ''
  }
}

export const version = readPackageVersion()

/** 注入依赖：只需要 logger，其余功能可选 */
export const inject = ['logger']

/** 数据目录名称 */
const DATA_DIR_NAME = 'desktop-fat-fish-data'

/** 鱼的心情状态 */
const MOODS = {
  HAPPY: 'happy',
  NORMAL: 'normal',
  HUNGRY: 'hungry',
  SLEEPY: 'sleepy',
  EXCITED: 'excited'
}

/** 鱼的动作类型 */
const ACTIONS = {
  SWIM: 'swim',
  EAT: 'eat',
  SLEEP: 'sleep',
  PLAY: 'play',
  IDLE: 'idle'
}

/** 默认配置 */
const DEFAULT_CONFIG = {
  fishName: '大肥鱼',
  autoFeed: false,
  feedInterval: 3600000, // 1小时
  animationSpeed: 1.0,
  showMood: true,
  position: { x: 100, y: 100 }
}

/** 创建默认鱼状态 */
function createDefaultFishState() {
  return {
    name: '大肥鱼',
    mood: MOODS.NORMAL,
    hunger: 50, // 0-100，越低越饿
    happiness: 50, // 0-100
    energy: 100, // 0-100
    action: ACTIONS.IDLE,
    lastFeedTime: Date.now(),
    lastPlayTime: Date.now(),
    lastSleepTime: Date.now(),
    totalFeeds: 0,
    totalPlays: 0,
    level: 1,
    experience: 0
  }
}

/** 根据状态计算心情 */
function calculateMood(state) {
  if (state.hunger <= 20) return MOODS.HUNGRY
  if (state.energy <= 20) return MOODS.SLEEPY
  if (state.happiness >= 80 && state.hunger >= 60) return MOODS.EXCITED
  if (state.happiness >= 60 && state.hunger >= 50) return MOODS.HAPPY
  return MOODS.NORMAL
}

/** 计算经验值升级所需经验 */
function getExpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

/** 检查并处理升级 */
function checkLevelUp(state) {
  let leveledUp = false
  while (state.experience >= getExpForLevel(state.level)) {
    state.experience -= getExpForLevel(state.level)
    state.level++
    leveledUp = true
  }
  return leveledUp
}

/** 应用插件主函数 */
export function apply(ctx, config) {
  const logger = ctx.logger ?? console
  const home = path.resolve(os.homedir(), '.dsh')
  const dataDir = path.resolve(home, DATA_DIR_NAME)
  
  // 确保数据目录存在
  fs.mkdirSync(dataDir, { recursive: true })
  
  // 状态文件路径
  const stateFile = path.join(dataDir, 'fish-state.json')
  const configFile = path.join(dataDir, 'config.json')
  
  // 读取或初始化配置
  let userConfig = { ...DEFAULT_CONFIG }
  if (fs.existsSync(configFile)) {
    try {
      userConfig = { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(configFile, 'utf8')) }
    } catch (e) {
      logger.warn('[desktop-fat-fish] 配置文件读取失败，使用默认配置', e)
    }
  }
  
  // 合并配置
  const finalConfig = { ...userConfig, ...config }
  
  // 读取或初始化鱼状态
  let fishState = createDefaultFishState()
  if (fs.existsSync(stateFile)) {
    try {
      fishState = { ...createDefaultFishState(), ...JSON.parse(fs.readFileSync(stateFile, 'utf8')) }
      // 确保新字段存在
      fishState.name = finalConfig.fishName || fishState.name
    } catch (e) {
      logger.warn('[desktop-fat-fish] 状态文件读取失败，使用默认状态', e)
    }
  }
  
  // 保存配置
  function saveConfig() {
    try {
      fs.writeFileSync(configFile, JSON.stringify(finalConfig, null, 2))
    } catch (e) {
      logger.error('[desktop-fat-fish] 保存配置失败', e)
    }
  }
  
  // 保存状态
  function saveState() {
    try {
      fishState.mood = calculateMood(fishState)
      fs.writeFileSync(stateFile, JSON.stringify(fishState, null, 2))
    } catch (e) {
      logger.error('[desktop-fat-fish] 保存状态失败', e)
    }
  }
  
  // 定期保存状态
  const saveInterval = setInterval(saveState, 30000)
  saveInterval.unref?.()
  
  // 自动喂食定时器
  let autoFeedInterval = null
  if (finalConfig.autoFeed) {
    autoFeedInterval = setInterval(() => {
      feedFish('auto')
    }, finalConfig.feedInterval)
    autoFeedInterval.unref?.()
  }
  
  // 自然状态衰减（每分钟）
  const decayInterval = setInterval(() => {
    const now = Date.now()
    
    // 饥饿度增加（数值减少）
    const hoursSinceFeed = (now - fishState.lastFeedTime) / 3600000
    fishState.hunger = Math.max(0, fishState.hunger - hoursSinceFeed * 10)
    
    // 精力自然恢复
    const hoursSinceSleep = (now - fishState.lastSleepTime) / 3600000
    if (fishState.action === ACTIONS.SLEEP) {
      fishState.energy = Math.min(100, fishState.energy + hoursSinceSleep * 30)
    } else {
      fishState.energy = Math.max(0, fishState.energy - hoursSinceSleep * 5)
    }
    
    // 开心度自然下降
    const hoursSincePlay = (now - fishState.lastPlayTime) / 3600000
    fishState.happiness = Math.max(0, fishState.happiness - hoursSincePlay * 8)
    
    fishState.mood = calculateMood(fishState)
    saveState()
  }, 60000)
  decayInterval.unref?.()
  
  /** 喂食鱼 */
  function feedFish(foodType = 'normal') {
    const now = Date.now()
    fishState.lastFeedTime = now
    fishState.totalFeeds++
    
    // 不同食物效果不同
    const foodEffects = {
      normal: { hunger: 30, happiness: 5, exp: 10 },
      premium: { hunger: 50, happiness: 15, exp: 25 },
      treat: { hunger: 20, happiness: 30, exp: 15 }
    }
    
    const effect = foodEffects[foodType] || foodEffects.normal
    fishState.hunger = Math.min(100, fishState.hunger + effect.hunger)
    fishState.happiness = Math.min(100, fishState.happiness + effect.happiness)
    fishState.experience += effect.exp
    
    // 触发进食动画
    fishState.action = ACTIONS.EAT
    setTimeout(() => {
      fishState.action = ACTIONS.SWIM
    }, 3000)
    
    checkLevelUp(fishState)
    saveState()
    
    logger.info(`[desktop-fat-fish] ${fishState.name} 吃了 ${foodType} 食物，饥饿度: ${fishState.hunger}, 开心度: ${fishState.happiness}`)
    
    return {
      success: true,
      fishState: { ...fishState },
      message: `${fishState.name} 吃得真香！🐟`
    }
  }
  
  /** 陪鱼玩耍 */
  function playWithFish(gameType = 'ball') {
    const now = Date.now()
    fishState.lastPlayTime = now
    fishState.totalPlays++
    
    const gameEffects = {
      ball: { happiness: 20, energy: -10, exp: 15 },
      chase: { happiness: 25, energy: -15, exp: 20 },
      bubble: { happiness: 15, energy: -5, exp: 10 }
    }
    
    const effect = gameEffects[gameType] || gameEffects.ball
    fishState.happiness = Math.min(100, fishState.happiness + effect.happiness)
    fishState.energy = Math.max(0, fishState.energy + effect.energy)
    fishState.experience += effect.exp
    
    // 触发玩耍动画
    fishState.action = ACTIONS.PLAY
    setTimeout(() => {
      fishState.action = ACTIONS.SWIM
    }, 5000)
    
    checkLevelUp(fishState)
    saveState()
    
    logger.info(`[desktop-fat-fish] 陪 ${fishState.name} 玩 ${gameType}，开心度: ${fishState.happiness}, 精力: ${fishState.energy}`)
    
    return {
      success: true,
      fishState: { ...fishState },
      message: `${fishState.name} 玩得好开心！🎈`
    }
  }
  
  /** 让鱼睡觉 */
  function letFishSleep() {
    fishState.lastSleepTime = Date.now()
    fishState.action = ACTIONS.SLEEP
    
    // 睡眠恢复精力（模拟异步）
    const sleepDuration = 10000 // 10秒模拟睡眠
    const energyGain = 50
    
    setTimeout(() => {
      fishState.energy = Math.min(100, fishState.energy + energyGain)
      fishState.action = ACTIONS.SWIM
      saveState()
      logger.info(`[desktop-fat-fish] ${fishState.name} 醒来了，精力恢复到 ${fishState.energy}`)
    }, sleepDuration)
    
    saveState()
    
    return {
      success: true,
      fishState: { ...fishState },
      message: `${fishState.name} 去睡觉啦 💤`
    }
  }
  
  /** 重命名鱼 */
  function renameFish(newName) {
    if (!newName || newName.trim().length === 0) {
      return { success: false, message: '名字不能为空' }
    }
    if (newName.length > 20) {
      return { success: false, message: '名字太长了（最多20字符）' }
    }
    
    fishState.name = newName.trim()
    finalConfig.fishName = fishState.name
    saveConfig()
    saveState()
    
    return {
      success: true,
      fishState: { ...fishState },
      message: `鱼儿现在叫 ${fishState.name} 了！`
    }
  }
  
  /** 获取鱼状态 */
  function getFishState() {
    return {
      ...fishState,
      mood: calculateMood(fishState),
      nextLevelExp: getExpForLevel(fishState.level),
      config: { ...finalConfig }
    }
  }
  
  /** 更新配置 */
  function updateConfig(newConfig) {
    Object.assign(finalConfig, newConfig)
    saveConfig()
    
    // 处理自动喂食开关
    if (newConfig.autoFeed !== undefined) {
      if (autoFeedInterval) {
        clearInterval(autoFeedInterval)
        autoFeedInterval = null
      }
      if (finalConfig.autoFeed) {
        autoFeedInterval = setInterval(() => feedFish('auto'), finalConfig.feedInterval)
        autoFeedInterval.unref?.()
      }
    }
    
    return { success: true, config: { ...finalConfig } }
  }
  
  /** 重置数据 */
  function resetData() {
    fishState = createDefaultFishState()
    fishState.name = finalConfig.fishName
    saveState()
    return { success: true, fishState: { ...fishState }, message: '数据已重置' }
  }
  
  // 注册服务供前端调用
  ctx.provide('desktop-fat-fish', {
    getFishState,
    feedFish,
    playWithFish,
    letFishSleep,
    renameFish,
    updateConfig,
    resetData,
    MOODS,
    ACTIONS
  })
  
  // 提供 HTTP API（如果有 webServer）
  const webServer = ctx.get('webServer')
  if (webServer) {
    const router = webServer.router()
    
    router.get('/api/fish/state', (req, res) => {
      res.json(getFishState())
    })
    
    router.post('/api/fish/feed', (req, res) => {
      const { foodType } = req.body || {}
      res.json(feedFish(foodType))
    })
    
    router.post('/api/fish/play', (req, res) => {
      const { gameType } = req.body || {}
      res.json(playWithFish(gameType))
    })
    
    router.post('/api/fish/sleep', (req, res) => {
      res.json(letFishSleep())
    })
    
    router.post('/api/fish/rename', (req, res) => {
      const { name } = req.body || {}
      res.json(renameFish(name))
    })
    
    router.get('/api/fish/config', (req, res) => {
      res.json({ config: finalConfig })
    })
    
    router.post('/api/fish/config', (req, res) => {
      res.json(updateConfig(req.body || {}))
    })
    
    router.post('/api/fish/reset', (req, res) => {
      res.json(resetData())
    })
    
    webServer.use('/desktop-fat-fish', router)
  }
  
  // 清理函数
  ctx.onDispose(() => {
    clearInterval(saveInterval)
    clearInterval(decayInterval)
    if (autoFeedInterval) clearInterval(autoFeedInterval)
    saveState()
    logger.info('[desktop-fat-fish] 插件已卸载')
  })
  
  logger.info(`[desktop-fat-fish] 插件已加载 v${version}，欢迎 ${fishState.name}！🐟`)
  
  return {
    getFishState,
    feedFish,
    playWithFish,
    letFishSleep,
    renameFish,
    updateConfig,
    resetData
  }
}