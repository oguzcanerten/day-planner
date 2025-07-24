import { ref, onMounted, onUnmounted } from 'vue'
import { taskService } from '../services/taskService.js'

export function useTasks() {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  const getTasksByStatus = (status) => {
    return tasks.value.filter(task => task.status === status)
  }

  const loadTasks = async () => {
    try {
      loading.value = true
      error.value = null
      tasks.value = await taskService.getTasks()
    } catch (err) {
      error.value = 'Görevler yüklenirken hata oluştu'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const addTask = async (taskData) => {
    try {
      error.value = null
      const newTask = await taskService.addTask(taskData)
      return newTask
    } catch (err) {
      error.value = 'Görev eklenirken hata oluştu'
      console.error(err)
      throw err
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      error.value = null
      await taskService.updateTask(taskId, updates)
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = { ...tasks.value[taskIndex], ...updates }
      }
    } catch (err) {
      error.value = 'Görev güncellenirken hata oluştu'
      console.error('❌ Task güncelleme hatası:', err)
      throw err
    }
  }

  const deleteTask = async (taskId) => {
    try {
      error.value = null
      await taskService.deleteTask(taskId)
      tasks.value = tasks.value.filter(t => t.id !== taskId)
    } catch (err) {
      error.value = 'Görev silinirken hata oluştu'
      console.error(err)
      throw err
    }
  }

  const moveTask = async (taskId, newStatus) => {
    try {
      console.log('🔄 Task taşınıyor:', taskId, '→', newStatus)
      await updateTask(taskId, { status: newStatus })
      console.log('✅ Task başarıyla taşındı!')
    } catch (err) {
      console.error('❌ Görev taşınırken hata:', err)
    }
  }

  const addNewTask = async (columnId, selectedDate = null) => {
    // Seçili tarihi YYYY-MM-DD formatına çevir
    const dateForStorage = selectedDate 
      ? selectedDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    
    const newTask = {
      title: 'Yeni Görev',
      description: 'Görev açıklamasını buraya yazın...',
      status: columnId,
      priority: 'medium',
      estimatedTime: '2 saat',
      date: dateForStorage
    }
    
    try {
      await addTask(newTask)
    } catch (err) {
      console.error('Yeni görev eklenirken hata:', err)
    }
  }

  const startRealTimeUpdates = () => {
    unsubscribe = taskService.onTasksChange((updatedTasks) => {
      // Mevcut task'lara date field ekle (migration)
      const tasksWithDate = updatedTasks.map(task => {
        if (!task.date) {
          // Date field yoksa bugünün tarihi ver
          task.date = new Date().toISOString().split('T')[0]
          // Firebase'e silent update yap
          taskService.updateTask(task.id, { date: task.date }).catch(err => {
            console.log('Migration update failed:', err)
          })
        }
        return task
      })
      
      tasks.value = tasksWithDate
      loading.value = false
    })
  }

  const stopRealTimeUpdates = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  onMounted(() => {
    loading.value = true
    startRealTimeUpdates()
  })

  onUnmounted(() => {
    stopRealTimeUpdates()
  })

  return {
    tasks,
    loading,
    error,
    getTasksByStatus,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addNewTask,
    loadTasks
  }
} 