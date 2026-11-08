<template>
  <div 
    class="fat-fish-widget"
    :style="widgetStyle"
    @click="onWidgetClick"
    @contextmenu.prevent="showContextMenu"
  >
    <!-- 鱼的SVG动画 -->
    <div class="fish-container" :class="['mood-' + fishState.mood, 'action-' + fishState.action]" ref="fishContainer">
      <svg class="fish-svg" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fishBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :style="{ 'stop-color': bodyColor }" />
            <stop offset="50%" :style="{ 'stop-color': bodyLightColor }" />
            <stop offset="100%" :style="{ 'stop-color': bellyColor }" />
          </linearGradient>
          <linearGradient id="fishBelly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FFF0F5;stop-opacity:1" />
            <stop offset="100%" :style="{ 'stop-color': bellyColor }" />
          </linearGradient>
          <radialGradient id="fishEye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
            <stop offset="60%" style="stop-color:#4A4A4A;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1A1A1A;stop-opacity:1" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <!-- 游动动画 -->
          <animateTransform 
            id="swimAnimation"
            attributeName="transform"
            type="translate"
            :values="swimValues"
            dur="4s"
            repeatCount="indefinite"
          />
        </defs>
        
        <!-- 鱼尾 -->
        <path 
          d="M 20 64 Q 0 30 10 64 Q 0 98 20 64" 
          fill="url(#fishBody)" 
          opacity="0.9"
          class="fish-tail"
        />
        
        <!-- 鱼身 -->
        <ellipse 
          class="fish-body"
          cx="64" cy="64" rx="50" ry="30" 
          fill="url(#fishBody)" 
          filter="url(#glow)"
        />
        
        <!-- 鱼腹 -->
        <ellipse 
          class="fish-belly"
          cx="64" cy="70" rx="40" ry="20" 
          fill="url(#fishBelly)"
        />
        
        <!-- 背鳍 -->
        <path 
          class="fish-fin dorsal-fin"
          d="M 50 35 Q 55 15 70 30 Q 65 35 50 35" 
          fill="url(#fishBody)" 
          opacity="0.8"
        />
        
        <!-- 腹鳍 -->
        <path 
          class="fish-fin ventral-fin"
          d="M 45 85 Q 40 100 55 90 Q 50 88 45 85" 
          fill="url(#fishBody)" 
          opacity="0.8"
        />
        <path 
          class="fish-fin ventral-fin right"
          d="M 85 85 Q 90 100 75 90 Q 80 88 85 85" 
          fill="url(#fishBody)" 
          opacity="0.8"
        />
        
        <!-- 鱼嘴 -->
        <path 
          class="fish-mouth"
          d="M 110 64 Q 120 64 110 70" 
          :stroke="bodyColor" 
          stroke-width="3" 
          fill="none" 
          stroke-linecap="round"
        />
        
        <!-- 鱼眼 -->
        <circle 
          class="fish-eye"
          cx="95" cy="55" r="10" 
          fill="url(#fishEye)"
        />
        <circle 
          class="fish-eye-highlight"
          cx="97" cy="53" r="3" 
          fill="#FFFFFF" 
          opacity="0.9"
        />
        <circle 
          class="fish-eye-highlight-small"
          cx="93" cy="57" r="1.5" 
          fill="#FFFFFF" 
          opacity="0.5"
        />
        
        <!-- 腮 -->
        <path 
          class="fish-gill"
          d="M 75 55 Q 70 64 75 73" 
          :stroke="bodyColor" 
          stroke-width="2" 
          fill="none" 
          opacity="0.6"
        />
        <path 
          class="fish-gill"
          d="M 75 60 Q 68 64 75 68" 
          :stroke="bodyColor" 
          stroke-width="1.5" 
          fill="none" 
          opacity="0.4"
        />
      </svg>
      
      <!-- 气泡效果 -->
      <div class="bubbles" v-if="fishState.action !== 'sleep'">
        <div class="bubble" v-for="(bubble, index) in bubbles" :key="index" :style="bubbleStyle(bubble)"></div>
      </div>
      
      <!-- 心情图标 -->
      <div class="mood-indicator" v-if="showMood && fishState.mood !== 'normal'">
        <span class="mood-icon">{{ moodIcon }}</span>
      </div>
      
      <!-- 等级显示 -->
      <div class="level-badge">
        Lv.{{ fishState.level }}
      </div>
      
      <!-- 名字标签 -->
      <div class="fish-name">{{ fishState.name }}</div>
    </div>
    
    <!-- 状态栏 -->
    <div class="status-bar" v-if="showStatusBar">
      <div class="status-item">
        <span class="status-icon">🍽️</span>
        <div class="status-bar-inner">
          <div class="status-fill hunger" :style="{ width: fishState.hunger + '%' }"></div>
        </div>
        <span class="status-value">{{ Math.round(fishState.hunger) }}%</span>
      </div>
      <div class="status-item">
        <span class="status-icon">😊</span>
        <div class="status-bar-inner">
          <div class="status-fill happiness" :style="{ width: fishState.happiness + '%' }"></div>
        </div>
        <span class="status-value">{{ Math.round(fishState.happiness) }}%</span>
      </div>
      <div class="status-item">
        <span class="status-icon">⚡</span>
        <div class="status-bar-inner">
          <div class="status-fill energy" :style="{ width: fishState.energy + '%' }"></div>
        </div>
        <span class="status-value">{{ Math.round(fishState.energy) }}%</span>
      </div>
    </div>
    
    <!-- 经验条 -->
    <div class="exp-bar" v-if="showExpBar">
      <div class="exp-fill" :style="{ width: expPercent + '%' }"></div>
      <span class="exp-text">{{ fishState.experience }} / {{ nextLevelExp }}</span>
    </div>
    
    <!-- 右键菜单 -->
    <div 
      class="context-menu" 
      v-if="showMenu" 
      :style="menuStyle"
      @click.stop
    >
      <div class="menu-item" @click="feedFish('normal')">
        <span>🍞</span> 喂食 (面包)
      </div>
      <div class="menu-item" @click="feedFish('premium')">
        <span>🍤</span> 喂食 (虾米)
      </div>
      <div class="menu-item" @click="feedFish('treat')">
        <span>🍭</span> 喂食 (零食)
      </div>
      <hr class="menu-divider" />
      <div class="menu-item" @click="playWithFish('ball')">
        <span>⚽</span> 玩球
      </div>
      <div class="menu-item" @click="playWithFish('chase')">
        <span>🏃</span> 追逐游戏
      </div>
      <div class="menu-item" @click="playWithFish('bubble')">
        <span>🫧</span> 吹泡泡
      </div>
      <hr class="menu-divider" />
      <div class="menu-item" @click="letFishSleep">
        <span>💤</span> 让它睡觉
      </div>
      <hr class="menu-divider" />
      <div class="menu-item" @click="openSettings">
        <span>⚙️</span> 设置
      </div>
    </div>
    
    <!-- 喂食/互动反馈动画 -->
    <transition-group name="feedback" tag="div" class="feedback-container">
      <div 
        v-for="(feedback, index) in feedbackMessages" 
        :key="feedback.id"
        class="feedback-message"
        :class="feedback.type"
      >
        {{ feedback.text }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useService } from '@dsh/app'

// 服务注入
const { desktopFatFish } = useService('desktop-fat-fish')

// 状态
const fishState = ref({
  name: '大肥鱼',
  mood: 'normal',
  hunger: 50,
  happiness: 50,
  energy: 100,
  action: 'idle',
  level: 1,
  experience: 0
})

const config = ref({
  showMood: true,
  showStatusBar: true,
  showExpBar: true,
  animationSpeed: 1.0
})

const showMenu = ref(false)
const menuStyle = ref({})
const feedbackMessages = ref([])
const bubbles = ref([
  { x: 100, y: 30, size: 4, delay: 0 },
  { x: 110, y: 20, size: 3, delay: 1000 },
  { x: 120, y: 10, size: 2, delay: 2000 }
])

let updateTimer = null
let bubbleTimer = null

// 计算属性
const bodyColor = computed(() => {
  switch (fishState.value.mood) {
    case 'happy': return '#FF6B9D'
    case 'excited': return '#FF3366'
    case 'hungry': return '#FFA07A'
    case 'sleepy': return '#B0C4DE'
    default: return '#FF6B9D'
  }
})

const bodyLightColor = computed(() => {
  switch (fishState.value.mood) {
    case 'happy': return '#FF9EB8'
    case 'excited': return '#FF6699'
    case 'hungry': return '#FFB68A'
    case 'sleepy': return '#C0D4EE'
    default: return '#FF9EB8'
  }
})

const bellyColor = computed(() => {
  switch (fishState.value.mood) {
    case 'happy': return '#FFD1DC'
    case 'excited': return '#FFB3C6'
    case 'hungry': return '#FFDAB9'
    case 'sleepy': return '#D0E0F0'
    default: return '#FFD1DC'
  }
})

const moodIcon = computed(() => {
  switch (fishState.value.mood) {
    case 'happy': return '😊'
    case 'excited': return '🤩'
    case 'hungry': return '😋'
    case 'sleepy': return '😴'
    default: return '😐'
  }
})

const swimValues = computed(() => {
  const speed = config.value.animationSpeed
  return `0,0; -${5*speed},${-3*speed}; ${5*speed},${3*speed}; 0,0`
})

const expPercent = computed(() => {
  const nextExp = getExpForLevel(fishState.value.level)
  return (fishState.value.experience / nextExp) * 100
})

const nextLevelExp = computed(() => getExpForLevel(fishState.value.level))

const widgetStyle = computed(() => ({
  width: '200px',
  height: '240px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  userSelect: 'none'
}))

// 经验计算
function getExpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// 气泡样式
function bubbleStyle(bubble) {
  return {
    left: bubble.x + 'px',
    bottom: bubble.y + 'px',
    width: bubble.size + 'px',
    height: bubble.size + 'px',
    animationDelay: bubble.delay + 'ms'
  }
}

// 从服务获取状态
async function fetchFishState() {
  try {
    const state = await desktopFatFish.getFishState()
    fishState.value = state
    config.value = state.config || config.value
  } catch (e) {
    console.error('获取鱼状态失败:', e)
  }
}

// 定期更新
function startAutoUpdate() {
  updateTimer = setInterval(fetchFishState, 5000)
  
  // 气泡动画
  bubbleTimer = setInterval(() => {
    bubbles.value = bubbles.value.map(b => ({
      ...b,
      y: b.y + 2,
      x: b.x + (Math.random() - 0.5) * 4
    })).filter(b => b.y < 140).concat([{
      x: 90 + Math.random() * 30,
      y: 10,
      size: 2 + Math.random() * 3,
      delay: 0
    }])
  }, 1000)
}

// 交互方法
function feedFish(foodType) {
  desktopFatFish.feedFish(foodType).then(result => {
    if (result.success) {
      fishState.value = result.fishState
      showFeedback(`+${foodType === 'premium' ? 50 : foodType === 'treat' ? 20 : 30} 饥饿度`, 'success')
    }
  })
  hideMenu()
}

function playWithFish(gameType) {
  desktopFatFish.playWithFish(gameType).then(result => {
    if (result.success) {
      fishState.value = result.fishState
      showFeedback(result.message, 'happy')
    }
  })
  hideMenu()
}

function letFishSleep() {
  desktopFatFish.letFishSleep().then(result => {
    if (result.success) {
      fishState.value = result.fishState
      showFeedback(result.message, 'sleep')
    }
  })
  hideMenu()
}

function openSettings() {
  // 触发设置页面打开事件
  window.dispatchEvent(new CustomEvent('dsh:open-settings', { 
    detail: { route: '/settings/desktop-fat-fish' } 
  }))
  hideMenu()
}

function showFeedback(text, type = 'info') {
  const id = Date.now() + Math.random()
  feedbackMessages.value.push({ id, text, type })
  setTimeout(() => {
    feedbackMessages.value = feedbackMessages.value.filter(f => f.id !== id)
  }, 2000)
}

function onWidgetClick(e) {
  // 左键点击：随机互动
  if (e.button === 0) {
    const actions = ['feed', 'play', 'sleep']
    const action = actions[Math.floor(Math.random() * actions.length)]
    if (action === 'feed') feedFish('normal')
    else if (action === 'play') playWithFish('ball')
    else letFishSleep()
  }
}

function showContextMenu(e) {
  e.preventDefault()
  showMenu.value = true
  menuStyle.value = {
    left: e.clientX + 'px',
    top: e.clientY + 'px'
  }
}

function hideMenu() {
  showMenu.value = false
}

// 点击外部关闭菜单
function handleClickOutside(e) {
  if (showMenu.value) hideMenu()
}

// 生命周期
onMounted(() => {
  fetchFishState()
  startAutoUpdate()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (updateTimer) clearInterval(updateTimer)
  if (bubbleTimer) clearInterval(bubbleTimer)
  document.removeEventListener('click', handleClickOutside)
})

// 监听配置变化
watch(() => config.value, (newConfig) => {
  desktopFatFish.updateConfig(newConfig)
}, { deep: true })
</script>

<style scoped>
.fat-fish-widget {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.fish-container {
  position: relative;
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 500px;
}

.fish-svg {
  width: 140px;
  height: 140px;
  transition: transform 0.3s ease;
}

.fish-svg:hover {
  transform: scale(1.05);
}

/* 游动动作 */
.fish-container.action-swim .fish-body,
.fish-container.action-swim .fish-tail,
.fish-container.action-swim .fish-fin {
  animation: swim 2s ease-in-out infinite;
}

.fish-container.action-swim .fish-tail {
  animation: tailSwim 1s ease-in-out infinite;
  transform-origin: 20px 64px;
}

.fish-container.action-swim .dorsal-fin {
  animation: finWave 1.5s ease-in-out infinite;
  transform-origin: 60px 35px;
}

.fish-container.action-swim .ventral-fin {
  animation: finWave 1.5s ease-in-out infinite 0.2s;
  transform-origin: 50px 88px;
}

.fish-container.action-swim .ventral-fin.right {
  animation: finWave 1.5s ease-in-out infinite 0.4s;
  transform-origin: 78px 88px;
}

/* 进食动作 */
.fish-container.action-eat .fish-mouth {
  animation: eatMouth 0.5s ease-in-out 3;
  transform-origin: 110px 64px;
}

.fish-container.action-eat .fish-body {
  animation: eatBody 0.5s ease-in-out 3;
}

/* 玩耍动作 */
.fish-container.action-play .fish-svg {
  animation: playJump 1s ease-in-out 2;
}

.fish-container.action-play .fish-tail {
  animation: tailFast 0.3s ease-in-out 6;
  transform-origin: 20px 64px;
}

/* 睡眠动作 */
.fish-container.action-sleep .fish-svg {
  animation: sleepFloat 3s ease-in-out infinite;
}

.fish-container.action-sleep .fish-eye {
  animation: sleepEye 3s ease-in-out infinite;
}

/* 心情样式 */
.fish-container.mood-happy .fish-svg {
  filter: drop-shadow(0 0 10px rgba(255, 107, 157, 0.5));
}

.fish-container.mood-excited .fish-svg {
  filter: drop-shadow(0 0 15px rgba(255, 51, 102, 0.7));
  animation: excitedShake 0.5s ease-in-out infinite;
}

.fish-container.mood-hungry .fish-svg {
  filter: drop-shadow(0 0 10px rgba(255, 160, 122, 0.5));
}

.fish-container.mood-sleepy .fish-svg {
  filter: drop-shadow(0 0 10px rgba(176, 196, 222, 0.5));
  opacity: 0.8;
}

.mood-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 24px;
  animation: moodPop 0.5s ease-out;
}

.level-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #FF6B9D, #FF9EB8);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.4);
}

.fish-name {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  font-weight: 500;
  color: #333;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
  white-space: nowrap;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-around;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.status-icon {
  font-size: 14px;
}

.status-bar-inner {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.status-fill.hunger { background: linear-gradient(90deg, #FF6B6B, #FFB36B); }
.status-fill.happiness { background: linear-gradient(90deg, #6BCB77, #4ECDC4); }
.status-fill.energy { background: linear-gradient(90deg, #FFD93D, #FF6B6B); }

.status-value {
  font-size: 10px;
  color: #666;
  min-width: 28px;
  text-align: right;
}

/* 经验条 */
.exp-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  position: relative;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B9D, #FFD1DC, #FF6B9D);
  background-size: 200% 100%;
  animation: expShine 2s linear infinite;
  border-radius: 0 0 16px 16px;
  transition: width 0.5s ease;
}

.exp-text {
  position: absolute;
  top: -18px;
  right: 8px;
  font-size: 10px;
  color: #999;
}

/* 气泡 */
.bubbles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.1));
  animation: bubbleRise 4s ease-in-out infinite;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 4px 0;
  min-width: 160px;
  z-index: 1000;
  animation: menuPop 0.15s ease-out;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
  transition: background 0.1s;
}

.menu-item:hover {
  background: #FFF0F5;
}

.menu-divider {
  margin: 4px 8px;
  border: none;
  border-top: 1px solid #F0F0F0;
}

/* 反馈消息 */
.feedback-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
}

.feedback-message {
  position: absolute;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  animation: feedbackFloat 2s ease-out forwards;
}

.feedback-message.success {
  background: linear-gradient(135deg, #6BCB77, #4ECDC4);
  color: white;
  box-shadow: 0 2px 10px rgba(107, 203, 119, 0.4);
}

.feedback-message.happy {
  background: linear-gradient(135deg, #FF6B9D, #FF9EB8);
  color: white;
  box-shadow: 0 2px 10px rgba(255, 107, 157, 0.4);
}

.feedback-message.sleep {
  background: linear-gradient(135deg, #B0C4DE, #C0D4EE);
  color: #333;
  box-shadow: 0 2px 10px rgba(176, 196, 222, 0.4);
}

/* 动画关键帧 */
@keyframes swim {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-3px) rotate(-2deg); }
  75% { transform: translateX(3px) rotate(2deg); }
}

@keyframes tailSwim {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

@keyframes finWave {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-10deg); }
}

@keyframes eatMouth {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(2); }
}

@keyframes eatBody {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes playJump {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(-10deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
  75% { transform: translateY(-15px) rotate(-5deg); }
}

@keyframes tailFast {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(30deg); }
}

@keyframes sleepFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(3px) rotate(1deg); }
}

@keyframes sleepEye {
  0%, 100% { r: 10; }
  50% { r: 1; }
}

@keyframes excitedShake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
}

@keyframes moodPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes expShine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes bubbleRise {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
}

@keyframes menuPop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes feedbackFloat {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -150%) scale(0.8); opacity: 0; }
}
</style>