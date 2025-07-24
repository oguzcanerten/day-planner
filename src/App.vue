<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-top">
        <div class="title-section">
          <!-- Boş alan - ortada hiçbir şey gösterilmiyor -->
        </div>
        
        <div class="header-right">
          <div class="date-section">
            <div 
              class="current-date clickable-date"
              @click="toggleDatePicker"
              title="Tarih seç"
            >
              <i class="fas fa-calendar-alt"></i>
              {{ selectedDateFormatted }}
              <i class="fas fa-chevron-down date-arrow" :class="{ 'rotate': showDatePicker }"></i>
            </div>
            
            <!-- Date Picker -->
            <div v-if="showDatePicker" class="date-picker" @click.stop>
              <div class="date-picker-header">
                <button @click="previousMonth" class="nav-btn">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span class="month-year">{{ currentMonthYear }}</span>
                <button @click="nextMonth" class="nav-btn">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              
              <div class="calendar-grid">
                <div class="day-header" v-for="day in weekDays" :key="day">{{ day }}</div>
                
                <div 
                  v-for="date in calendarDates" 
                  :key="date.fullDate"
                  class="calendar-day"
                  :class="{
                    'other-month': !date.isCurrentMonth,
                    'selected': isDateSelected(date.fullDate),
                    'today': isToday(date.fullDate),
                    'has-tasks': hasTasksOnDate(date.fullDate)
                  }"
                  @click="selectDate(date.fullDate)"
                >
                  {{ date.day }}
                  <div v-if="hasTasksOnDate(date.fullDate)" class="task-indicator">
                    {{ getTaskCountOnDate(date.fullDate) }}
                  </div>
                </div>
              </div>
              
              <div class="date-picker-footer">
                <button @click="selectToday" class="today-btn">Bugün</button>
                <button @click="closeDatePicker" class="close-btn">Kapat</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading-indicator">
        <i class="fas fa-spinner"></i>
        Firebase'den görevler yükleniyor...
      </div>
      
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        {{ error }}
      </div>
      
      <!-- Seçili tarih bilgisi -->
      <div class="selected-date-info">
        <h2>{{ selectedDateFormatted }} - Görevler</h2>
        <div class="date-stats">
          <span class="stat">
            <i class="fas fa-list-ul"></i>
            {{ getTasksByStatus('todo').length }} Yapılacak
          </span>
          <span class="stat">
            <i class="fas fa-spinner"></i>
            {{ getTasksByStatus('in-progress').length }} Devam Eden
          </span>
          <span class="stat">
            <i class="fas fa-check-circle"></i>
            {{ getTasksByStatus('done').length }} Tamamlanan
          </span>
        </div>
        
        <!-- Notes Section -->
        <div class="notes-section">
          <div class="notes-header">
            <h3>
              <i class="fas fa-sticky-note"></i>
              Günlük Notlar
            </h3>
            <button @click="addNote" class="add-note-btn" title="Not ekle">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          
          <div class="notes-list" v-if="dailyNotes.length > 0">
            <div 
              v-for="note in dailyNotes" 
              :key="note.id"
              class="note-item"
            >
              <div class="note-content">
                <i class="fas fa-circle note-bullet"></i>
                <span 
                  v-if="!note.isEditing"
                  class="note-text"
                  @dblclick="startEditingNote(note)"
                >
                  {{ note.text }}
                </span>
                                 <input 
                   v-if="note.isEditing"
                   v-model="note.editText"
                   @blur="saveNote(note)"
                   @keyup.enter="saveNote(note)"
                   @keyup.escape="cancelEditNote(note)"
                   class="note-input"
                   :ref="el => { if (el) noteInputRef = el }"
                 />
              </div>
              <button 
                @click="deleteNote(note.id)" 
                class="delete-note-btn"
                title="Notu sil"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div v-else class="no-notes">
            <i class="fas fa-clipboard"></i>
            <p>Bu günün henüz notu yok</p>
          </div>
        </div>
      </div>
    </header>

    <div class="board-container">
      <TaskColumn
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :tasks="getTasksByStatus(column.id)"
        :selected-date="selectedDate"
        @task-moved="moveTask"
        @add-task="addNewTask"
        @delete-task="deleteTask"
        @update-task="updateTask"
      />
      
      <!-- Reddit Widgets - Done column'ın yanında -->
      <div class="reddit-widgets-container">
        <!-- DevOps Widget -->
        <div class="reddit-widget">
          <div class="reddit-header">
            <i class="fab fa-reddit-alien"></i>
            <h3>r/devops</h3>
          </div>
          
          <div v-if="devopsPosts.length" class="reddit-carousel">
            <div 
              class="reddit-post active"
              @click="openRedditPost(currentDevOpsPost.permalink)"
            >
              <div class="post-rank">{{ currentDevOpsIndex + 1 }}</div>
              <div class="post-content">
                <h4 class="post-title">{{ currentDevOpsPost.title }}</h4>
                <div class="post-meta">
                  <span class="post-score">
                    <i class="fas fa-arrow-up"></i>
                    {{ formatScore(currentDevOpsPost.score) }}
                  </span>
                  <span class="post-comments">
                    <i class="fas fa-comment"></i>
                    {{ currentDevOpsPost.num_comments }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="carousel-dots">
              <div 
                v-for="(post, index) in devopsPosts" 
                :key="post.id"
                class="dot"
                :class="{ active: index === currentDevOpsIndex }"
                @click="currentDevOpsIndex = index"
              ></div>
            </div>
          </div>
          
          <div v-else class="reddit-loading">
            <i class="fab fa-reddit"></i>
            <p>Yükleniyor...</p>
          </div>
        </div>

        <!-- AWS Widget -->
        <div class="reddit-widget">
          <div class="reddit-header">
            <i class="fab fa-aws"></i>
            <h3>r/aws</h3>
          </div>
          
          <div v-if="awsPosts.length" class="reddit-carousel">
            <div 
              class="reddit-post active"
              @click="openRedditPost(currentAwsPost.permalink)"
            >
              <div class="post-rank">{{ currentAwsIndex + 1 }}</div>
              <div class="post-content">
                <h4 class="post-title">{{ currentAwsPost.title }}</h4>
                <div class="post-meta">
                  <span class="post-score">
                    <i class="fas fa-arrow-up"></i>
                    {{ formatScore(currentAwsPost.score) }}
                  </span>
                  <span class="post-comments">
                    <i class="fas fa-comment"></i>
                    {{ currentAwsPost.num_comments }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="carousel-dots">
              <div 
                v-for="(post, index) in awsPosts" 
                :key="post.id"
                class="dot"
                :class="{ active: index === currentAwsIndex }"
                @click="currentAwsIndex = index"
              ></div>
            </div>
          </div>
          
          <div v-else class="reddit-loading">
            <i class="fab fa-aws"></i>
            <p>Yükleniyor...</p>
          </div>
        </div>

        <!-- Kubernetes Widget -->
        <div class="reddit-widget">
          <div class="reddit-header">
            <i class="fas fa-dharmachakra"></i>
            <h3>r/kubernetes</h3>
          </div>
          
          <div v-if="kubernetesPosts.length" class="reddit-carousel">
            <div 
              class="reddit-post active"
              @click="openRedditPost(currentKubernetesPost.permalink)"
            >
              <div class="post-rank">{{ currentKubernetesIndex + 1 }}</div>
              <div class="post-content">
                <h4 class="post-title">{{ currentKubernetesPost.title }}</h4>
                <div class="post-meta">
                  <span class="post-score">
                    <i class="fas fa-arrow-up"></i>
                    {{ formatScore(currentKubernetesPost.score) }}
                  </span>
                  <span class="post-comments">
                    <i class="fas fa-comment"></i>
                    {{ currentKubernetesPost.num_comments }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="carousel-dots">
              <div 
                v-for="(post, index) in kubernetesPosts" 
                :key="post.id"
                class="dot"
                :class="{ active: index === currentKubernetesIndex }"
                @click="currentKubernetesIndex = index"
              ></div>
            </div>
          </div>
          
          <div v-else class="reddit-loading">
            <i class="fas fa-dharmachakra"></i>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </div>
      
      <!-- Sağda boş alan -->
      <div class="future-content-placeholder">
        <div class="placeholder-message">
          <i class="fas fa-plus-circle"></i>
          <p>Buraya yeni widget<br/>eklenecek</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.loading-indicator {
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.error-message {
  background: rgba(244, 67, 54, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.fa-spinner {
  /* Artık dönmüyor - sabit */
}

/* Date Picker Styles */
.clickable-date {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.clickable-date:hover {
  background: rgba(14, 165, 233, 0.1);
  transform: translateY(-1px);
}

.date-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.date-arrow.rotate {
  transform: rotate(180deg);
}

.date-section {
  position: relative;
}

.date-picker {
  position: absolute;
  top: 100%;
  right: 0;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 320px;
  backdrop-filter: blur(10px);
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.month-year {
  font-weight: 600;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.nav-btn {
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(14, 165, 233, 0.2);
  border-color: var(--accent-primary);
  color: white;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 15px;
}

.day-header {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  padding: 8px;
}

.calendar-day {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.calendar-day:hover {
  background: rgba(14, 165, 233, 0.2);
  color: white;
}

.calendar-day.other-month {
  color: rgba(255, 255, 255, 0.3);
}

.calendar-day.selected {
  background: var(--accent-primary);
  color: white;
  font-weight: 600;
}

.calendar-day.today {
  border: 2px solid var(--accent-primary);
  font-weight: 600;
}

.calendar-day.has-tasks {
  border: 1px solid rgba(34, 197, 94, 0.5);
}

.task-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #22c55e;
  color: white;
  font-size: 0.6rem;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.calendar-day.has-tasks .task-indicator {
  background: linear-gradient(45deg, #22c55e 50%, #0ea5e9 50%);
}

.date-picker-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.today-btn, .close-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.today-btn {
  background: var(--accent-primary);
  color: white;
}

.today-btn:hover {
  background: rgba(14, 165, 233, 0.8);
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Selected Date Info */
.selected-date-info {
  margin-top: 20px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(168, 85, 247, 0.1), rgba(34, 197, 94, 0.1));
  border: 1px solid transparent;
  background-clip: padding-box;
  border-radius: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.selected-date-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0ea5e9, #a855f7, #22c55e, #f59e0b);
  border-radius: 16px;
  padding: 1px;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  z-index: -1;
}

.selected-date-info h2 {
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.6rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.date-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

  .stat i {
    color: var(--accent-primary);
  }
  
  /* Notes Section Styles */
  .notes-section {
    margin-top: 20px;
    padding: 20px;
    background: rgba(14, 165, 233, 0.05);
    border: 1px solid rgba(14, 165, 233, 0.2);
    border-radius: 12px;
    text-align: left;
  }
  
  .notes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .notes-header h3 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
  }
  
  .add-note-btn {
    background: rgba(14, 165, 233, 0.2);
    border: 1px solid rgba(14, 165, 233, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
  }
  
  .add-note-btn:hover {
    background: rgba(14, 165, 233, 0.3);
    border-color: var(--accent-primary);
    color: white;
  }
  
  .notes-list {
    max-height: 200px;
    overflow-y: auto;
    padding-right: 10px;
  }
  
  .note-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: 10px;
    min-width: 0;
  }
  
  .note-item:last-child {
    border-bottom: none;
  }
  
  .note-content {
    flex-grow: 1;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }
  
  .note-bullet {
    color: var(--accent-primary);
    font-size: 0.6rem;
    margin-top: 5px;
    flex-shrink: 0;
  }
  
  .note-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    cursor: pointer;
    word-break: break-word;
    line-height: 1.4;
    flex: 1;
    overflow-wrap: break-word;
  }
  
  .note-text:hover {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .note-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 6px 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    outline: none;
    min-width: 0;
  }
  
  .note-input:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3);
  }
  
  .delete-note-btn {
    background: rgba(244, 67, 54, 0.2);
    border: 1px solid rgba(244, 67, 54, 0.3);
    border-radius: 6px;
    color: rgba(244, 67, 54, 0.8);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    margin-left: 10px;
    flex-shrink: 0;
  }
  
  .delete-note-btn:hover {
    background: rgba(244, 67, 54, 0.3);
    border-color: rgba(244, 67, 54, 0.5);
    color: white;
  }
  
  .no-notes {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    padding: 20px;
  }
  
  .no-notes i {
    font-size: 1.5rem;
    margin-bottom: 10px;
    display: block;
  }

  @media (max-width: 768px) {
    .date-picker {
      right: -50px;
      min-width: 280px;
    }
    
    .date-stats {
      gap: 15px;
    }
    
    .stat {
      font-size: 0.8rem;
    }
    
    .notes-section {
      margin-top: 15px;
      padding: 15px;
    }
    
    .notes-header h3 {
      font-size: 1rem;
    }
    
    .add-note-btn,
    .delete-note-btn {
      width: 25px;
      height: 25px;
    }
    
    .note-text,
    .note-input {
      font-size: 0.8rem;
    }
  }
</style>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import TaskColumn from './components/TaskColumn.vue'
import { useTasks } from './composables/useTasks.js'
import { noteService } from './services/noteService.js'

export default {
  name: 'App',
  components: {
    TaskColumn
  },
  setup() {
    const columns = ref([
      {
        id: 'todo',
        title: 'Yapılacaklar',
        icon: 'fas fa-list-ul',
        class: 'todo-column'
      },
      {
        id: 'in-progress',
        title: 'Devam Eden',
        icon: 'fas fa-spinner',
        class: 'in-progress-column'
      },
      {
        id: 'done',
        title: 'Tamamlanan',
        icon: 'fas fa-check-circle',
        class: 'done-column'
      }
    ])

    // Date picker states
    const selectedDate = ref(new Date())
    const showDatePicker = ref(false)
    const currentMonth = ref(new Date().getMonth())
    const currentYear = ref(new Date().getFullYear())
    
    const weekDays = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
    
    // 3 farklı subreddit için ayrı state'ler
    const devopsPosts = ref([])
    const awsPosts = ref([])
    const kubernetesPosts = ref([])
    
    const currentDevOpsIndex = ref(0)
    const currentAwsIndex = ref(0)
    const currentKubernetesIndex = ref(0)
    
    let devopsInterval = null
    let awsInterval = null
    let kubernetesInterval = null

    // Date formatting
    const selectedDateFormatted = computed(() => {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }
      return selectedDate.value.toLocaleDateString('tr-TR', options)
    })

    const currentMonthYear = computed(() => {
      const date = new Date(currentYear.value, currentMonth.value, 1)
      return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
    })

    // Calendar computation
    const calendarDates = computed(() => {
      const dates = []
      const firstDay = new Date(currentYear.value, currentMonth.value, 1)
      const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
      const startDate = new Date(firstDay)
      
      // Haftanın ilk gününe git (Pazartesi)
      const dayOfWeek = firstDay.getDay()
      const mondayDiff = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
      startDate.setDate(firstDay.getDate() + mondayDiff)
      
      // 6 hafta göster
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        dates.push({
          day: date.getDate(),
          fullDate: new Date(date),
          isCurrentMonth: date.getMonth() === currentMonth.value
        })
      }
      
      return dates
    })

    // Date picker methods
    const toggleDatePicker = () => {
      showDatePicker.value = !showDatePicker.value
      if (showDatePicker.value) {
        currentMonth.value = selectedDate.value.getMonth()
        currentYear.value = selectedDate.value.getFullYear()
      }
    }

    const closeDatePicker = () => {
      showDatePicker.value = false
    }

    const previousMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value -= 1
      } else {
        currentMonth.value -= 1
      }
    }

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value += 1
      } else {
        currentMonth.value += 1
      }
    }

    const selectDate = (date) => {
      selectedDate.value = new Date(date)
      closeDatePicker()
    }

    const selectToday = () => {
      selectedDate.value = new Date()
      currentMonth.value = new Date().getMonth()
      currentYear.value = new Date().getFullYear()
      closeDatePicker()
    }

    const isDateSelected = (date) => {
      return date.toDateString() === selectedDate.value.toDateString()
    }

    const isToday = (date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    // Task date utilities
    const formatDateForStorage = (date) => {
      return date.toISOString().split('T')[0] // YYYY-MM-DD format
    }

    const hasTasksOnDate = (date) => {
      const dateStr = formatDateForStorage(date)
      const hasTask = tasks.value.some(task => task.date === dateStr)
      const hasNote = allNotes.value.some(note => note.date === dateStr)
      return hasTask || hasNote
    }

    const getTaskCountOnDate = (date) => {
      const dateStr = formatDateForStorage(date)
      const taskCount = tasks.value.filter(task => task.date === dateStr).length
      const noteCount = allNotes.value.filter(note => note.date === dateStr).length
      return taskCount + noteCount
    }

    // Close date picker when clicking outside
    const handleClickOutside = (event) => {
      if (showDatePicker.value && !event.target.closest('.date-section')) {
        closeDatePicker()
      }
    }

    const fetchSubredditPosts = async (subreddit, postsRef, mockDataLoader) => {
      try {
        // Reddit API endpoint
        const apiUrl = `https://www.reddit.com/r/${subreddit}/hot.json?limit=5`
        
        // Önce direkt dene
        let response = await fetch(apiUrl, {
          signal: AbortSignal.timeout(3000),
          headers: {
            'User-Agent': 'day-planner-app/1.0'
          }
        })
        
        // CORS hatası varsa proxy kullan
        if (!response.ok || response.status === 0) {
          const proxyUrl = 'https://api.allorigins.win/raw?url='
          response = await fetch(
            `${proxyUrl}${encodeURIComponent(apiUrl)}`,
            { 
              signal: AbortSignal.timeout(5000)
            }
          )
        }
        
        if (response.ok) {
          const data = await response.json()
          console.log(`${subreddit} API Response:`, data)
          
          if (data.data && data.data.children && data.data.children.length > 0) {
            postsRef.value = data.data.children.map(post => ({
              id: post.data.id,
              title: post.data.title,
              score: post.data.score,
              num_comments: post.data.num_comments,
              permalink: post.data.permalink,
              url: `https://reddit.com${post.data.permalink}`
            }))
            console.log(`${subreddit} posts loaded:`, postsRef.value)
            return true
          }
        }
        
        // API çalışmazsa fallback yükle
        console.log(`${subreddit} API failed, using fallback data`)
        mockDataLoader()
        return false
      } catch (error) {
        console.error(`${subreddit} API error:`, error)
        mockDataLoader()
        return false
      }
    }

    const loadDevOpsMockData = () => {
      devopsPosts.value = [
        { id: '1', title: 'The Death of Traditional DevOps: How AI is reshaping our roles in 2025', score: 2847, num_comments: 312, permalink: '/r/devops/hot/', url: 'https://www.reddit.com/r/devops/hot/' },
        { id: '2', title: 'Platform Engineering vs DevOps: Why every company needs a Platform Team', score: 1956, num_comments: 267, permalink: '/r/devops/hot/', url: 'https://www.reddit.com/r/devops/hot/' },
        { id: '3', title: 'Replit AI deleted production database: A cautionary tale about AI agents', score: 3421, num_comments: 189, permalink: '/r/devops/hot/', url: 'https://www.reddit.com/r/devops/hot/' },
        { id: '4', title: 'From Tickets to Autonomy: AI takeover of ITSM and infrastructure management', score: 1534, num_comments: 143, permalink: '/r/devops/hot/', url: 'https://www.reddit.com/r/devops/hot/' },
        { id: '5', title: 'Why Observability beats Monitoring: Building resilient systems in 2025', score: 1789, num_comments: 98, permalink: '/r/devops/hot/', url: 'https://www.reddit.com/r/devops/hot/' }
      ]
    }

    const loadAwsMockData = () => {
      awsPosts.value = [
        { id: '1', title: 'AWS Lambda cold starts: How to optimize for sub-100ms performance', score: 1823, num_comments: 156, permalink: '/r/aws/hot/', url: 'https://www.reddit.com/r/aws/hot/' },
        { id: '2', title: 'EKS vs ECS vs Fargate: Which should you choose in 2025?', score: 2145, num_comments: 203, permalink: '/r/aws/hot/', url: 'https://www.reddit.com/r/aws/hot/' },
        { id: '3', title: 'S3 cost optimization: How I reduced our storage costs by 70%', score: 1687, num_comments: 89, permalink: '/r/aws/hot/', url: 'https://www.reddit.com/r/aws/hot/' },
        { id: '4', title: 'CDK vs Terraform for AWS: A comprehensive comparison', score: 1456, num_comments: 167, permalink: '/r/aws/hot/', url: 'https://www.reddit.com/r/aws/hot/' },
        { id: '5', title: 'AWS Well-Architected Framework: Real-world implementation guide', score: 1234, num_comments: 78, permalink: '/r/aws/hot/', url: 'https://www.reddit.com/r/aws/hot/' }
      ]
    }

    const loadKubernetesMockData = () => {
      kubernetesPosts.value = [
        { id: '1', title: 'Kubernetes 1.31 released: What\'s new for production workloads', score: 2456, num_comments: 234, permalink: '/r/kubernetes/hot/', url: 'https://www.reddit.com/r/kubernetes/hot/' },
        { id: '2', title: 'ArgoCD vs Flux: GitOps tools comparison for 2025', score: 1789, num_comments: 145, permalink: '/r/kubernetes/hot/', url: 'https://www.reddit.com/r/kubernetes/hot/' },
        { id: '3', title: 'Istio service mesh: Performance impact and alternatives', score: 1934, num_comments: 167, permalink: '/r/kubernetes/hot/', url: 'https://www.reddit.com/r/kubernetes/hot/' },
        { id: '4', title: 'RBAC best practices: Securing your Kubernetes cluster', score: 1567, num_comments: 123, permalink: '/r/kubernetes/hot/', url: 'https://www.reddit.com/r/kubernetes/hot/' },
        { id: '5', title: 'Horizontal Pod Autoscaler: Custom metrics and optimization', score: 1345, num_comments: 98, permalink: '/r/kubernetes/hot/', url: 'https://www.reddit.com/r/kubernetes/hot/' }
      ]
    }

    const startDevOpsCarousel = () => {
      if (devopsInterval) clearInterval(devopsInterval)
      devopsInterval = setInterval(() => {
        if (devopsPosts.value.length > 0) {
          currentDevOpsIndex.value = (currentDevOpsIndex.value + 1) % devopsPosts.value.length
        }
      }, 10000)
    }

    const startAwsCarousel = () => {
      if (awsInterval) clearInterval(awsInterval)
      awsInterval = setInterval(() => {
        if (awsPosts.value.length > 0) {
          currentAwsIndex.value = (currentAwsIndex.value + 1) % awsPosts.value.length
        }
      }, 10000)
    }

    const startKubernetesCarousel = () => {
      if (kubernetesInterval) clearInterval(kubernetesInterval)
      kubernetesInterval = setInterval(() => {
        if (kubernetesPosts.value.length > 0) {
          currentKubernetesIndex.value = (currentKubernetesIndex.value + 1) % kubernetesPosts.value.length
        }
      }, 10000)
    }

    const currentDevOpsPost = computed(() => {
      return devopsPosts.value[currentDevOpsIndex.value] || {}
    })

    const currentAwsPost = computed(() => {
      return awsPosts.value[currentAwsIndex.value] || {}
    })

    const currentKubernetesPost = computed(() => {
      return kubernetesPosts.value[currentKubernetesIndex.value] || {}
    })

    const openRedditPost = (permalink) => {
      window.open(`https://reddit.com${permalink}`, '_blank')
    }

    const formatScore = (score) => {
      if (score >= 1000) {
        return (score / 1000).toFixed(1) + 'k'
      }
      return score.toString()
    }

    const initializeAllSubreddits = async () => {
      // DevOps subreddit
      const devopsSuccess = await fetchSubredditPosts('devops', devopsPosts, loadDevOpsMockData)
      if (devopsSuccess || devopsPosts.value.length > 0) startDevOpsCarousel()

      // AWS subreddit  
      const awsSuccess = await fetchSubredditPosts('aws', awsPosts, loadAwsMockData)
      if (awsSuccess || awsPosts.value.length > 0) startAwsCarousel()

      // Kubernetes subreddit
      const kubernetesSuccess = await fetchSubredditPosts('kubernetes', kubernetesPosts, loadKubernetesMockData)
      if (kubernetesSuccess || kubernetesPosts.value.length > 0) startKubernetesCarousel()
    }

    onMounted(() => {
      initializeAllSubreddits()
      
      // Sadece dark tema aktif
      document.documentElement.setAttribute('data-theme', 'dark')
      
      // Click outside listener
      document.addEventListener('click', handleClickOutside)
      
      // Notes real-time listener
      startNotesRealTimeUpdates()
    })

    onUnmounted(() => {
      if (devopsInterval) clearInterval(devopsInterval)
      if (awsInterval) clearInterval(awsInterval)
      if (kubernetesInterval) clearInterval(kubernetesInterval)
      document.removeEventListener('click', handleClickOutside)
      
      // Notes listener'ı temizle
      stopNotesRealTimeUpdates()
    })

    const {
      tasks,
      loading,
      error,
      getTasksByStatus: originalGetTasksByStatus,
      moveTask,
      addNewTask: originalAddNewTask,
      deleteTask,
      updateTask
    } = useTasks()

    // Filter tasks by selected date
    const getTasksByStatus = (status) => {
      const selectedDateStr = formatDateForStorage(selectedDate.value)
      const allTasks = originalGetTasksByStatus(status)
      
      // Seçili tarihe göre filtrele
      const filteredTasks = allTasks.filter(task => {
        // Eğer task'ın date'i yoksa bugünün task'ı olarak say
        const taskDate = task.date || new Date().toISOString().split('T')[0]
        return taskDate === selectedDateStr
      })
      
      return filteredTasks
    }

    // Wrap addNewTask to pass selected date
    const addNewTask = (columnId) => {
      return originalAddNewTask(columnId, selectedDate.value)
    }

    // Notes section state and methods
    const allNotes = ref([])
    const noteInputRef = ref(null)
    let notesUnsubscribe = null

    // Real-time notes updates
    const startNotesRealTimeUpdates = () => {
      notesUnsubscribe = noteService.onNotesChange((updatedNotes) => {
        allNotes.value = updatedNotes
        console.log('📝 Notes yüklendi:', updatedNotes.length, 'not')
      })
    }

    const stopNotesRealTimeUpdates = () => {
      if (notesUnsubscribe) {
        notesUnsubscribe()
        notesUnsubscribe = null
      }
    }

    // Seçili tarihe göre notları filtrele
    const dailyNotes = computed(() => {
      const selectedDateStr = formatDateForStorage(selectedDate.value)
      return allNotes.value.filter(note => note.date === selectedDateStr)
    })

    const addNote = async () => {
      const selectedDateStr = formatDateForStorage(selectedDate.value)
      const newNote = {
        text: '',
        date: selectedDateStr
      }
      
      try {
        const savedNote = await noteService.addNote(newNote)
        
        // Real-time listener'dan gelecek nota isEditing ekle
        nextTick(() => {
          const noteFromList = allNotes.value.find(n => n.id === savedNote.id)
          if (noteFromList) {
            noteFromList.isEditing = true
            noteFromList.editText = ''
            nextTick(() => {
              if (noteInputRef.value) {
                noteInputRef.value.focus()
              }
            })
          }
        })
        
        console.log('✅ Not eklendi:', savedNote.id)
      } catch (error) {
        console.error('❌ Not eklenirken hata:', error)
      }
    }

    const startEditingNote = (note) => {
      note.isEditing = true
      note.editText = note.text
      nextTick(() => {
        if (noteInputRef.value) {
          noteInputRef.value.focus()
        }
      })
    }

    const saveNote = async (note) => {
      if (note.editText.trim()) {
        const trimmedText = note.editText.trim()
        note.text = trimmedText
        note.isEditing = false
        
        try {
          await noteService.updateNote(note.id, { text: trimmedText })
          console.log('✅ Not güncellendi:', note.id)
        } catch (error) {
          console.error('❌ Not güncellenirken hata:', error)
        }
      } else {
        // Boş not ise sil
        await deleteNote(note.id)
      }
    }

    const cancelEditNote = (note) => {
      if (!note.text) {
        // Yeni boş not ise sil
        deleteNote(note.id)
      } else {
        note.isEditing = false
      }
    }

    const deleteNote = async (noteId) => {
      try {
        await noteService.deleteNote(noteId)
        console.log('✅ Not silindi:', noteId)
      } catch (error) {
        console.error('❌ Not silinirken hata:', error)
      }
    }

    return {
      columns,
      tasks,
      loading,
      error,
      getTasksByStatus,
      moveTask,
      addNewTask,
      deleteTask,
      updateTask,
      
      // Date picker
      selectedDate,
      selectedDateFormatted,
      showDatePicker,
      currentMonthYear,
      calendarDates,
      weekDays,
      toggleDatePicker,
      closeDatePicker,
      previousMonth,
      nextMonth,
      selectDate,
      selectToday,
      isDateSelected,
      isToday,
      hasTasksOnDate,
      getTaskCountOnDate,
      
      // Reddit
      devopsPosts,
      awsPosts,
      kubernetesPosts,
      currentDevOpsIndex,
      currentAwsIndex,
      currentKubernetesIndex,
      currentDevOpsPost,
      currentAwsPost,
      currentKubernetesPost,
      openRedditPost,
      formatScore,

      // Notes
      allNotes,
      dailyNotes,
      noteInputRef,
      addNote,
      startEditingNote,
      saveNote,
      cancelEditNote,
      deleteNote
    }
  }
}
</script> 