import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useNotes = (userId) => {
  const [notes, setNotes] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for active notes
  useEffect(() => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query only non-deleted notes
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      where('deleted', '==', false)
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sortedNotes = notesData.sort((a, b) => {
          return new Date(a.reminderTime) - new Date(b.reminderTime);
        });

        setNotes(sortedNotes);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Real-time listener for deleted notes
  useEffect(() => {
    if (!userId) {
      setDeletedNotes([]);
      return;
    }

    const deletedQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      where('deleted', '==', true)
    );

    const unsubscribe = onSnapshot(deletedQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDeletedNotes(data);
    });

    return () => unsubscribe();
  }, [userId]);

  const addNote = async (title, body, reminderTime, type = 'note', isFakeData = false) => {
    if (!userId) return;

    try {
      await addDoc(collection(db, 'notes'), {
        userId,
        title,
        body: body || '',
        reminderTime,
        type: type,
        completed: false,
        deleted: false,
        isFakeData: isFakeData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const updateNote = async (id, updates) => {
    if (!userId) return;

    try {
      const noteRef = doc(db, 'notes', id);
      const normalizedUpdates = { ...updates };

      // When reminder time changes, reset trigger state so future reminders can be tracked again.
      if (Object.prototype.hasOwnProperty.call(normalizedUpdates, 'reminderTime')) {
        normalizedUpdates.reminderTriggeredAt = null;
      }

      await updateDoc(noteRef, {
        ...normalizedUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  // Soft-delete: mark as deleted instead of removing from Firestore
  const deleteNote = async (id) => {
    if (!userId) return;
    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, { deleted: true, deletedAt: serverTimestamp() });
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const restoreNote = async (id) => {
    if (!userId) return;
    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, { deleted: false, deletedAt: null });
    } catch (error) {
      console.error('Error restoring note:', error);
      throw error;
    }
  };

  const permanentlyDeleteNote = async (id) => {
    if (!userId) return;
    try {
      const noteRef = doc(db, 'notes', id);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Error permanently deleting note:', error);
      throw error;
    }
  };

  const toggleComplete = async (id) => {
    if (!userId) return;

    try {
      const note = notes.find((n) => n.id === id);
      if (note) {
        const noteRef = doc(db, 'notes', id);
        const isCompleting = !note.completed;
        await updateDoc(noteRef, {
          completed: isCompleting,
          completedAt: isCompleting ? serverTimestamp() : null,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error toggling note:', error);
      throw error;
    }
  };

  const markReminderTriggered = async (id) => {
    if (!userId) return;

    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, {
        reminderTriggeredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking reminder as triggered:', error);
      throw error;
    }
  };

  return {
    notes,
    deletedNotes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentlyDeleteNote,
    toggleComplete,
    markReminderTriggered,
  };
};
