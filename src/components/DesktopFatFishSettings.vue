<template>
  <div class="fat-fish-settings">
    <div class="settings-header">
      <h1>🐟 桌面大肥鱼设置</h1>
      <p class="subtitle">自定义你的桌面宠物大肥鱼</p>
    </div>
    
    <div class="settings-content">
      <!-- 基本设置 -->
      <section class="settings-section">
        <h2 class="section-title">基本设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">鱼的名字</label>
          <input 
            v-model="config.fishName" 
            class="setting-input"
            placeholder="给你的大肥鱼起个名字"
            maxlength="20"
            @blur="saveConfig"
          />
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" v-model="config.autoFeed" @change="saveConfig" />
            自动喂食
          </label>
          <p class="setting-desc">开启后会定时自动喂食（面包）</p>
        </div>
        
        <div class="setting-item" v-if="config.autoFeed">
          <label class="setting-label">喂食间隔</label>
          <div class="input-with-unit">
            <input 
              type="number" 
              v-model.number="feedIntervalHours" 
              class="setting-input"
              min="1"
              max="24"
              @blur="updateFeedInterval"
            />
            <span class="unit">小时</span>
          </div>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">动画速度</label>
          <input 
            type="range" 
            v-model.number="config.animationSpeed" 
            class="setting-slider"
            min="0.5"
            max="2"
            step="0.1"
            @input="saveConfig"
          />
          <span class="slider-value">{{ config.animationSpeed.toFixed(1) }}x</span>
        </div>
      </section>
      
      <!-- 显示设置 -->
      <section class="settings-section">
        <h2 class="section-title">显示设置</h2>
        
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" v-model="config.showMood" @change="saveConfig" />
            显示心情图标
          </label>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" v-model="config.showStatusBar" @change="saveConfig" />
            显示状态栏（饥饿/开心/精力）
          </label>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" v-model="config.showExpBar" @change="saveConfig" />
            显示经验条
          </label>
        </div>
      </section>
      
      <!-- 鱼的状态预览 -->
      <section class="settings-section">
        <h2 class="section-title">当前状态</h2>
        
        <div class="status-preview">
          <div class="preview-fish" :class="['mood-' + fishState.mood, 'action-' + fishState.action]">
            <svg viewBox="0 0 128 128" class="preview-svg">
              <defs>
                <linearGradient id="previewBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" :style="{ 'stop-color': previewBodyColor }" />
                  <stop offset="50%" :style="{ 'stop-color': previewBodyLightColor }" />
                  <stop offset="100%" :style="{ 'stop-color': previewBellyColor }" />
                </linearGradient>
              </defs>
              <path d="M 20 64 Q 0 30 10 64 Q 0 98 20 64" fill="url(#previewBody)" opacity="0.9"/>
              <ellipse cx="64" cy="64" rx="50" ry="30" fill="url(#previewBody)"/>
              <ellipse cx="64" cy="70" rx="40" ry="20" fill="#FFF0F5"/>
              <path d="M 50 35 Q 55 15 70 30 Q 65 35 50 35" fill="url(#previewBody)" opacity="0.8"/>
              <path d="M 45 85 Q 40 100 55 90 Q 50 88 45 85" fill="url(#previewBody)" opacity="0.8"/>
              <path d="M 85 85 Q 90 100 75 90 Q 80 88 85 85" fill="url(#previewBody)" opacity="0.8"/>
              <path d="M 110 64 Q 120 64 110 70" :stroke="previewBodyColor" stroke-width="3" fill="none" stroke-linecap="round"/>
              <circle cx="95" cy="55" r="10" fill="#4A4A4A"/>
              <circle cx="97" cy="53" r="3" fill="#FFFFFF" opacity="0.9"/>
            </svg>
          </div>
          
          <div class="preview-info">
            <div class="preview-name">{{ fishState.name }}</div>
            <div class="preview-mood">
              <span class="mood-label">心情：</span>
              <span class="mood-value">{{ moodText }}</span>
            </div>
            <div class="preview-level">
              <span class="mood-label">等级：</span>
              <span class="mood-value">Lv.{{ fishState.level }} ({{ fishState.experience }}/{{ nextLevelExp }}经验)</span>
            </div>
            <div class="preview-stats">
              <div class="stat">
                <span class="stat-icon">🍽️</span>
                <span class="stat-label">饥饿度</span>
                <span class="stat-value">{{ Math.round(fishState.hunger) }}%</span>
                <div class="mini-bar"><div class="mini-fill hunger" :style="{ width: fishState.hunger + '%' }"></div></div>
              </div>
              <div class="stat">
                <span class="stat-icon">😊</span>
                <span class="stat-label">开心度</span>
                <span class="stat-value">{{ Math.round(fishState.happiness) }}%</span>
                <div class="mini-bar"><div class="mini-fill happiness" :style="{ width: fishState.happiness + '%' }"></div></div>
              </div>
              <div class="stat">
                <span class="stat-icon">⚡</span>
                <span class="stat-label">精力</span>
                <span class="stat-value">{{ Math.round(fishState.energy) }}%</span>
                <div class="mini-bar"><div class="mini-fill energy" :style="{ width: fishState.energy + '%' }"></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 快速操作 -->
      <section class="settings-section">
        <h2 class="section-title">快速操作</h2>
        
        <div class="action-buttons">
          <button class="action-btn feed" @click="quickFeed('normal')">
            <span>🍞</span> 喂面包
          </button>
          <button class="action-btn feed premium" @click="quickFeed('premium')">
            <span>🍤</span> 喂虾米
          </button>
          <button class="action-btn feed treat" @click="quickFeed('treat')">
            <span>🍭</span> 喂零食
          </button>
        </div>
        
        <div class="action-buttons">
          <button class="action-btn play" @click="quickPlay('ball')">
            <span>⚽</span> 玩球
          </button>
          <button class="action-btn play chase" @click="quickPlay('chase')">
            <span>🏃</span> 追逐
          </button>
          <button class="action-btn play bubble" @click="quickPlay('bubble')">
            <span>🫧</span> 吹泡泡
          </button>
        </div>
        
        <div class="action-buttons">
          <button class="action-btn sleep" @click="quickSleep">
            <span>💤</span> 睡觉
          </button>
        </div>
      </section>
      
      <!-- 危险区域 -->
      <section class="settings-section danger-zone">
        <h2 class="section-title">危险区域</h2>
        <p class="warning-text">以下操作不可恢复，请谨慎使用</p>
        
        <button class="danger-btn" @click="confirmReset">
          <span>🗑️</span> 重置所有数据
        </button>
      </section>
      
      <!-- 关于 -->
      <section class="settings-section about">
        <h2 class="section-title">关于</h2>
        <div class="about-info">
          <p>桌面大肥鱼插件 v{{ version }}</p>
          <p>一只可爱的大肥鱼陪伴你的桌面时光</p>
          <p class="credits">基于 DSH (DeepSeek Harness) 开发</p>
        </div>
      </section>
    </div>
    
    <!-- 确认对话框 -->
    <div class="modal-overlay" v-if="showConfirmModal">
      <div class="modal">
        <h3>确认重置</h3>
        <p>这将删除所有鱼的数据（名字、等级、经验、状态等），无法恢复。确定要继续吗？</p>
        <div class="modal-actions">
          <button class="btn cancel" @click="showConfirmModal = false">取消</button>
          <button class="btn danger" @click="executeReset">确定重置</button>
        </div>
      </div>
    </div>
    
    <!-- 反馈提示 -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="(toast, index) in toasts" :key="toast.id" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useService } from '@dsh/app'

const { desktopFatFish } = useService('desktop-fat-fish')

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
  fishName: '大肥鱼',
  autoFeed: false,
  feedInterval: 3600000,
  animationSpeed: 1.0,
  showMood: true,
  showStatusBar: true,
  showExpBar: true
})

const version = '1.0.0'
const showConfirmModal = ref(false)
const toasts = ref([])
let saveTimer = null

const feedIntervalHours = computed({
  get: () => config.value.feedInterval / 3600000,
  set: (val) => { config.value.feedInterval = val * 3600000 }
})

const nextLevelExp = computed(() => getExpForLevel(fishState.value.level))

const moodText = computed(() => {
  const moods = {
    happy: '开心 😊',
    excited: '兴奋 🤩',
    hungry: '饿了 😋',
    sleepy: '困了 😴',
    normal: '平静 😐'
  }
  return moods[fishState.value.mood] || '未知'
})

const previewBodyColor = computed(() => {
  switch (fishState.value.mood) {
    case 'happy': return '#FF6B9D'
    case 'excited': return '#FF3366'
    case 'hungry': return '#FFA07A'
    case 'sleepy': return '#B0C4DE'
    default: return '#FF6B9D'
  }
})

const previewBodyLightColor = computed(() => {
  switch (fishState.value.mood) {
    case 'happy': return '#FF9EB8'
    case 'excited': return '#FF6699'
    case 'hungry': return '#FFB68A'
    case 'sleepy': return '#C0D4EE'
    default: return '#FF9EB8'
  }
})

const previewBellyColor = computed(() => {
  switch (fishState.value.mood) {
    case 'happy': return '#FFD1DC'
    case 'excited': return '#FFB3C6'
    case 'hungry': return '#FFDAB9'
    case 'sleepy': return '#D0E0F0'
    default: return '#FFD1DC'
  }
})

function getExpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

async function fetchState() {
  try {
    const state = await desktopFatFish.getFishState()
    fishState.value = state
    config.value = { ...config.value, ...state.config }
  } catch (e) {
    console.error('获取状态失败:', e)
  }
}

function saveConfig() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    desktopFatFish.updateConfig(config.value)
    showToast('设置已保存', 'success')
  }, 300)
}

function updateFeedInterval() {
  config.value.feedInterval = feedIntervalHours.value * 3600000
  saveConfig()
}

async function quickFeed(foodType) {
  const result = await desktopFatFish.feedFish(foodType)
  if (result.success) {
    fishState.value = result.fishState
    showToast(result.message, 'success')
  }
}

async function quickPlay(gameType) {
  const result = await desktopFatFish.playWithFish(gameType)
  if (result.success) {
    fishState.value = result.fishState
    showToast(result.message, 'happy')
  }
}

async function quickSleep() {
  const result = await desktopFatFish.letFishSleep()
  if (result.success) {
    fishState.value = result.fishState
    showToast(result.message, 'sleep')
  }
}

function confirmReset() {
  showConfirmModal.value = true
}

async function executeReset() {
  const result = await desktopFatFish.resetData()
  if (result.success) {
    fishState.value = result.fishState
    showToast('数据已重置', 'success')
  }
  showConfirmModal.value = false
}

function showToast(message, type = 'info') {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 2500)
}

onMounted(() => {
  fetchState()
  // 定期刷新状态
  setInterval(fetchState, 10000)
})

watch(() => config.value.fishName, (newName) => {
  if (newName && newName !== fishState.value.name) {
    desktopFatFish.renameFish(newName)
  }
})
</script>

<style scoped>
.fat-fish-settings {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

.settings-header {
  text-align: center;
  margin-bottom: 32px;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF6B9D, #FF9EB8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.subtitle {
  color: #999;
  font-size: 15px;
}

.settings-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 107, 157, 0.1);
  box-shadow: 0 4px 20px rgba(255, 107, 157, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #FF6B9D;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 107, 157, 0.1);
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #444;
  cursor: pointer;
}

.setting-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #FF6B9D;
}

.setting-desc {
  margin: 6px 0 0 28px;
  font-size: 12px;
  color: #999;
}

.setting-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: white;
}

.setting-input:focus {
  outline: none;
  border-color: #FF6B9D;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.15);
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit .setting-input {
  flex: 1;
  max-width: 100px;
}

.unit {
  color: #999;
  font-size: 14px;
}

.setting-slider {
  flex: 1;
  accent-color: #FF6B9D;
}

.slider-value {
  font-size: 13px;
  color: #FF6B9D;
  font-weight: 500;
  min-width: 45px;
}

/* 状态预览 */
.status-preview {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.preview-fish {
  flex-shrink: 0;
}

.preview-svg {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 4px 12px rgba(255, 107, 157, 0.3));
}

.preview-fish.mood-happy .preview-svg {
  animation: previewSwim 3s ease-in-out infinite;
}

.preview-fish.mood-excited .preview-svg {
  animation: previewExcited 0.5s ease-in-out infinite;
}

.preview-fish.mood-sleepy .preview-svg {
  opacity: 0.7;
  animation: previewSleep 3s ease-in-out infinite;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.preview-mood, .preview-level {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.mood-label {
  font-size: 14px;
  color: #999;
  min-width: 60px;
}

.mood-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.preview-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  font-size: 16px;
}

.stat-label {
  font-size: 13px;
  color: #666;
  min-width: 55px;
}

.stat-value {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  min-width: 40px;
  text-align: right;
}

.mini-bar {
  flex: 1;
  height: 5px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.mini-fill.hunger { background: linear-gradient(90deg, #FF6B6B, #FFB36B); }
.mini-fill.happiness { background: linear-gradient(90deg, #6BCB77, #4ECDC4); }
.mini-fill.energy { background: linear-gradient(90deg, #FFD93D, #FF6B6B); }

/* 快速操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.action-btn {
  flex: 1;
  min-width: 100px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.1s, box-shadow 0.2s;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn.feed {
  background: linear-gradient(135deg, #FF6B9D, #FF9EB8);
  color: white;
  box-shadow: 0 3px 10px rgba(255, 107, 157, 0.3);
}

.action-btn.feed.premium {
  background: linear-gradient(135deg, #FF8C42, #FFA56B);
  box-shadow: 0 3px 10px rgba(255, 140, 66, 0.3);
}

.action-btn.feed.treat {
  background: linear-gradient(135deg, #A855F7, #C084FC);
  box-shadow: 0 3px 10px rgba(168, 85, 247, 0.3);
}

.action-btn.play {
  background: linear-gradient(135deg, #4ECDC4, #6EE7E7);
  color: white;
  box-shadow: 0 3px 10px rgba(78, 205, 196, 0.3);
}

.action-btn.play.chase {
  background: linear-gradient(135deg, #34D399, #6EE7B7);
  box-shadow: 0 3px 10px rgba(52, 211, 153, 0.3);
}

.action-btn.play.bubble {
  background: linear-gradient(135deg, #60A5FA, #93C5FD);
  box-shadow: 0 3px 10px rgba(96, 165, 250, 0.3);
}

.action-btn.sleep {
  background: linear-gradient(135deg, #B0C4DE, #C0D4EE);
  color: #333;
  box-shadow: 0 3px 10px rgba(176, 196, 222, 0.3);
  max-width: 200px;
  margin: 0 auto;
}

/* 危险区域 */
.danger-zone {
  border-color: rgba(255, 107, 107, 0.2);
}

.danger-zone .section-title {
  color: #FF6B6B;
  border-bottom-color: rgba(255, 107, 107, 0.1);
}

.warning-text {
  font-size: 13px;
  color: #FF6B6B;
  margin: 0 0 16px 0;
}

.danger-btn {
  width: 100%;
  padding: 14px;
  background: white;
  border: 2px dashed #FF6B6B;
  border-radius: 12px;
  color: #FF6B6B;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background 0.2s, border-color 0.2s;
}

.danger-btn:hover {
  background: #FFF0F0;
  border-color: #FF4444;
}

/* 关于 */
.about .section-title {
  border-bottom: none;
  margin-bottom: 12px;
}

.about-info {
  text-align: center;
  color: #999;
  font-size: 13px;
  line-height: 2;
}

.credits {
  margin-top: 8px;
  font-size: 12px !important;
  color: #BBB !important;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

.modal h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.modal p {
  margin: 0 0 24px 0;
  color: #666;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.cancel {
  background: #F0F0F0;
  color: #666;
}

.btn.cancel:hover {
  background: #E0E0E0;
}

.btn.danger {
  background: linear-gradient(135deg, #FF6B6B, #FF4444);
  color: white;
}

.btn.danger:hover {
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

/* Toast 提示 */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  animation: toastIn 0.3s ease, toastOut 0.3s ease 2.2s forwards;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: linear-gradient(135deg, #6BCB77, #4ECDC4);
  color: white;
}

.toast.happy {
  background: linear-gradient(135deg, #FF6B9D, #FF9EB8);
  color: white;
}

.toast.sleep {
  background: linear-gradient(135deg, #B0C4DE, #C0D4EE);
  color: #333;
}

.toast.info {
  background: linear-gradient(135deg, #60A5FA, #93C5FD);
  color: white;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes previewSwim {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-5px) rotate(-3deg); }
  75% { transform: translateX(5px) rotate(3deg); }
}

@keyframes previewExcited {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

@keyframes previewSleep {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes toastOut {
  to { opacity: 0; transform: translateX(100px); }
}

/* 响应式 */
@media (max-width: 600px) {
  .fat-fish-settings {
    padding: 16px;
  }
  
  .status-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .preview-stats {
    width: 100%;
  }
  
  .stat {
    justify-content: space-between;
  }
  
  .action-btn {
    min-width: 0;
    flex: 1 1 45%;
  }
}
</style>