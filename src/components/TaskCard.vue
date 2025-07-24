<template>
  <div 
    class="task-card"
    :class="{ 'editing': isEditing }"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <!-- Düzenlenebilir Başlık -->
    <h3 
      class="task-title editable-field"
      :class="{ 'editing': editingField === 'title' }"
      @dblclick="startEditing('title')"
      v-if="editingField !== 'title'"
    >
      {{ task.title }}
    </h3>
    <input 
      v-if="editingField === 'title'"
      v-model="editValues.title"
      @blur="saveField('title')"
      @keyup.enter="saveField('title')"
      @keyup.escape="cancelEdit"
      class="edit-input title-input"
      ref="titleInput"
    />
    
    <!-- Düzenlenebilir Açıklama -->
    <p 
      class="task-description editable-field"
      :class="{ 'editing': editingField === 'description' }"
      @dblclick="startEditing('description')"
      v-if="editingField !== 'description'"
    >
      {{ task.description }}
    </p>
    <textarea 
      v-if="editingField === 'description'"
      v-model="editValues.description"
      @blur="saveField('description')"
      @keyup.escape="cancelEdit"
      class="edit-input description-input"
      ref="descriptionInput"
    ></textarea>
    
    <div class="task-meta">
      <!-- Sadece öncelik, estimatedTime ve diğer alanlar kalsın. Tarih ile ilgili hiçbir satır olmasın. -->
      
      <!-- Düzenlenebilir Öncelik -->
      <span 
        class="task-priority editable-field"
        :class="[`priority-${task.priority}`, { 'editing': editingField === 'priority' }]"
        @dblclick="startEditing('priority')"
        v-if="editingField !== 'priority'"
      >
        {{ getPriorityText(task.priority) }}
      </span>
      <select 
        v-if="editingField === 'priority'"
        v-model="editValues.priority"
        @blur="saveField('priority')"
        @change="saveField('priority')"
        class="edit-select priority-select"
        ref="priorityInput"
      >
        <option value="low">Düşük</option>
        <option value="medium">Orta</option>
        <option value="high">Yüksek</option>
      </select>
      
      <!-- Düzenlenebilir Zaman -->
      <span 
        class="task-time editable-field"
        :class="{ 'editing': editingField === 'estimatedTime' }"
        @dblclick="startEditing('estimatedTime')"
        v-if="editingField !== 'estimatedTime'"
      >
        <i class="fas fa-clock"></i>
        {{ task.estimatedTime }}
      </span>
      <input 
        v-if="editingField === 'estimatedTime'"
        v-model="editValues.estimatedTime"
        @blur="saveField('estimatedTime')"
        @keyup.enter="saveField('estimatedTime')"
        @keyup.escape="cancelEdit"
        class="edit-input time-input"
        ref="timeInput"
        placeholder="2 saat"
      />
    </div>
    
    <div class="task-actions">
      <button 
        class="task-btn delete-btn" 
        @click="deleteTask"
        title="Görevi Sil"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'

export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['delete-task', 'update-task'],
  setup(props, { emit }) {
    const isEditing = ref(false)
    const editingField = ref(null)
    const editValues = ref({})

    const titleInput = ref(null)
    const descriptionInput = ref(null)
    const priorityInput = ref(null)
    const timeInput = ref(null)
    const dateInput = ref(null)

    const handleDragStart = (event) => {
      console.log('🎯 Drag başladı:', props.task.id)
      event.dataTransfer.setData('text/plain', props.task.id)
    }

    const getPriorityText = (priority) => {
      const priorityMap = {
        'high': 'Yüksek',
        'medium': 'Orta',
        'low': 'Düşük'
      }
      return priorityMap[priority] || priority
    }

    const startEditing = (field) => {
      editingField.value = field
      isEditing.value = true
      editValues.value = { ...props.task }
      
      nextTick(() => {
        const inputRef = {
          'title': titleInput,
          'description': descriptionInput,
          'priority': priorityInput,
          'estimatedTime': timeInput,
          'date': dateInput
        }[field]
        
        if (inputRef?.value) {
          inputRef.value.focus()
          if (field !== 'priority') {
            inputRef.value.select()
          }
        }
      })
    }

    const saveField = (field) => {
      const newValue = editValues.value[field]
      if (newValue && newValue !== props.task[field]) {
        emit('update-task', props.task.id, { [field]: newValue })
      }
      cancelEdit()
    }

    const cancelEdit = () => {
      editingField.value = null
      isEditing.value = false
      editValues.value = {}
    }

    const deleteTask = () => {
      if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
        emit('delete-task', props.task.id)
      }
    }

    return {
      isEditing,
      editingField,
      editValues,
      titleInput,
      descriptionInput,
      priorityInput,
      timeInput,
      dateInput,
      handleDragStart,
      getPriorityText,
      startEditing,
      saveField,
      cancelEdit,
      deleteTask
    }
  }
}
</script>

<style scoped>
.task-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.task-btn {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  transform: scale(1.05);
}

/* Düzenlenebilir Alan Stilleri */
.editable-field {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  padding: 4px 6px;
  margin: -4px -6px;
  position: relative;
}

.editable-field:hover {
  background: rgba(14, 165, 233, 0.1);
  box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.3);
  transform: translateY(-1px);
}

.editable-field:hover::after {
  content: "Çift tıkla düzenle";
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  animation: fadeInTooltip 0.3s ease-in-out 0.5s forwards;
}

@keyframes fadeInTooltip {
  from { opacity: 0; transform: translateX(-50%) translateY(5px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.editable-field.editing {
  background: rgba(14, 165, 233, 0.15);
  box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.4);
}

/* Input Stilleri */
.edit-input, .edit-select {
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: inherit;
  font-family: inherit;
  background: white;
  outline: none;
  width: 100%;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
  transition: all 0.3s ease;
}

.task-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-date i {
  color: #0ea5e9;
}

.edit-input:focus, .edit-select:focus {
  border-color: #0284c7;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.35);
  transform: translateY(-1px);
}

.title-input {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.description-input {
  font-size: 0.9rem;
  color: #666;
  min-height: 60px;
  resize: vertical;
  margin-bottom: 12px;
}

.time-input {
  font-size: 0.8rem;
  width: 80px;
  color: #888;
}

.priority-select {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 20px;
  width: auto;
  min-width: 80px;
}

/* Editing Mode */
.task-card.editing {
  cursor: default;
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3) !important;
  border-left-color: #0ea5e9 !important;
  border-color: rgba(14, 165, 233, 0.4) !important;
  transform: translateY(-2px);
}

.task-card.editing .task-actions {
  opacity: 1;
}

/* Dark Theme Support */
[data-theme="dark"] .edit-input,
[data-theme="dark"] .edit-select {
  background: #1e293b;
  border-color: #0ea5e9;
  color: #f1f5f9;
}

[data-theme="dark"] .edit-input:focus,
[data-theme="dark"] .edit-select:focus {
  border-color: #38bdf8;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
}

[data-theme="dark"] .editable-field:hover {
  background: rgba(14, 165, 233, 0.2);
  box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.4);
}

[data-theme="dark"] .task-btn {
  background: rgba(30, 41, 59, 0.9);
  color: #f1f5f9;
  border: 1px solid #475569;
}

[data-theme="dark"] .delete-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style> 