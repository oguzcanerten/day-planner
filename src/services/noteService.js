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

const COLLECTION_NAME = 'notes'

export const noteService = {
  async getNotes() {
    try {
      const notesQuery = query(
        collection(db, COLLECTION_NAME), 
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(notesQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }))
    } catch (error) {
      console.error('Notlar alınırken hata:', error)
      throw error
    }
  },

  async addNote(note) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...note,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return {
        id: docRef.id,
        ...note,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('Not eklenirken hata:', error)
      throw error
    }
  },

  async updateNote(noteId, updates) {
    try {
      const noteRef = doc(db, COLLECTION_NAME, noteId)
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: new Date()
      })
      return { id: noteId, ...updates }
    } catch (error) {
      console.error('Not güncellenirken hata:', error)
      throw error
    }
  },

  async deleteNote(noteId) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, noteId))
      return noteId
    } catch (error) {
      console.error('Not silinirken hata:', error)
      throw error
    }
  },

  onNotesChange(callback) {
    const notesQuery = query(
      collection(db, COLLECTION_NAME), 
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(notesQuery, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }))
      callback(notes)
    }, (error) => {
      console.error('Real-time not güncellemede hata:', error)
    })
  }
} 