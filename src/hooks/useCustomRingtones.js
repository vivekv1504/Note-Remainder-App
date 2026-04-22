import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useCustomRingtones = (userId) => {
  const [customRingtones, setCustomRingtones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load custom ringtones from Firestore with real-time listener
  useEffect(() => {
    if (!userId) {
      setCustomRingtones([]);
      return;
    }

    const ringtoneCollection = collection(db, 'users', userId, 'customRingtones');

    // Real-time listener for custom ringtones
    const unsubscribe = onSnapshot(
      ringtoneCollection,
      (snapshot) => {
        const ringtones = [];
        snapshot.forEach((docSnapshot) => {
          ringtones.push({
            id: docSnapshot.id,
            label: docSnapshot.data().label,
            path: docSnapshot.data().path,
            icon: '🎶',
            custom: true,
          });
        });
        setCustomRingtones(ringtones);
        setError(null);
      },
      (err) => {
        console.error('Error loading custom ringtones:', err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Add a new custom ringtone to Firestore
  const addRingtone = useCallback(
    async (label, dataUrl) => {
      if (!userId) {
        setError('User not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const ringtoneCollection = collection(db, 'users', userId, 'customRingtones');
        const docRef = await addDoc(ringtoneCollection, {
          label,
          path: dataUrl,
          createdAt: new Date(),
        });

        // Also save to localStorage as a fallback
        try {
          const all = JSON.parse(localStorage.getItem('customRingtones') || '[]');
          all.push({ id: docRef.id, label, path: dataUrl, icon: '🎶', custom: true });
          localStorage.setItem('customRingtones', JSON.stringify(all));
        } catch {}

        return docRef.id;
      } catch (err) {
        console.error('Error adding custom ringtone:', err);
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Delete a custom ringtone from Firestore
  const deleteRingtone = useCallback(
    async (ringtoneId) => {
      if (!userId) {
        setError('User not authenticated');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const ringtoneRef = doc(
          db,
          'users',
          userId,
          'customRingtones',
          ringtoneId
        );
        await deleteDoc(ringtoneRef);

        // Also remove from localStorage
        try {
          const all = JSON.parse(localStorage.getItem('customRingtones') || '[]');
          const updated = all.filter((r) => r.id !== ringtoneId);
          localStorage.setItem('customRingtones', JSON.stringify(updated));
        } catch {}

        return true;
      } catch (err) {
        console.error('Error deleting custom ringtone:', err);
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  return {
    customRingtones,
    loading,
    error,
    addRingtone,
    deleteRingtone,
  };
};
