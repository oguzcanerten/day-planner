<template>
  <div :class="['task-column', column.class]">
    <div class="column-header">
      <i :class="column.icon" class="column-icon"></i>
      <h2 class="column-title">{{ column.title }}</h2>
      <span class="task-count">{{ tasks.length }}</span>
    </div>

    <div 
      class="task-list"
      @dragover.prevent
      @drop="handleDrop"
    >
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @delete-task="(taskId) => $emit('delete-task', taskId)"
        @update-task="(taskId, updates) => $emit('update-task', taskId, updates)"
      />
      
      <button 
        class="add-task-btn"
        @click="$emit('add-task', column.id, selectedDate)"
      >
        <i class="fas fa-plus"></i>
        Yeni Görev Ekle
      </button>
    </div>
  </div>
</template>

<script>
import TaskCard from './TaskCard.vue'

export default {
  name: 'TaskColumn',
  components: {
    TaskCard
  },
  props: {
    column: {
      type: Object,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    },
    selectedDate: {
      type: Date,
      required: true
    }
  },
  emits: ['task-moved', 'add-task', 'delete-task', 'update-task'],
  setup(props, { emit }) {
    const handleDrop = (event) => {
      event.preventDefault()
      const taskId = event.dataTransfer.getData('text/plain')
      
      console.log('📦 Drop:', { taskId, newStatus: props.column.id })
      
      if (taskId) {
        emit('task-moved', taskId, props.column.id)
      }
    }

    return {
      handleDrop
    }
  }
}
</script> 