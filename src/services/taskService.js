import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase.js'

const COLLECTION_NAME = 'tasks'

export const taskService = {
  async getTasks() {
    try {
      const tasksQuery = query(
        collection(db, COLLECTION_NAME), 
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(tasksQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }))
    } catch (error) {
      console.error('Görevler alınırken hata:', error)
      throw error
    }
  },

  async addTask(task) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return {
        id: docRef.id,
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('Görev eklenirken hata:', error)
      throw error
    }
  },

  async updateTask(taskId, updates) {
    try {
      const taskRef = doc(db, COLLECTION_NAME, taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date()
      })
      return { id: taskId, ...updates }
    } catch (error) {
      console.error('Görev güncellenirken hata:', error)
      throw error
    }
  },

  async deleteTask(taskId) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, taskId))
      return taskId
    } catch (error) {
      console.error('Görev silinirken hata:', error)
      throw error
    }
  },

  onTasksChange(callback) {
    const tasksQuery = query(
      collection(db, COLLECTION_NAME), 
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }))
      callback(tasks)
    }, (error) => {
      console.error('Real-time güncellemede hata:', error)
    })
  }
} 