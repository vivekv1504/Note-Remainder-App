import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useTheme = (userId) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Load theme from Firestore when user is authenticated
  useEffect(() => {
    const loadTheme = async () => {
      if (!userId) {
        setTheme('light');
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().theme) {
          setTheme(userDoc.data().theme);
        } else {
          // Set default theme for new users
          await setDoc(userDocRef, { theme: 'light' }, { merge: true });
          setTheme('light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        setTheme('light');
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [userId]);

  // Apply theme to document root whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    if (!userId) return;

    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Save to Firestore
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { theme: newTheme }, { merge: true });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return { theme, toggleTheme, loading };
};
