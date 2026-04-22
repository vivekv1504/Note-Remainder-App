import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
const REPEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const useNotifications = (notes, userId, onComplete, onReminderTriggered) => {
  const audioRef = useRef(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedRingtone, setSelectedRingtone] = useState('/ringtone.wav');
  const selectedRingtoneRef = useRef(selectedRingtone);
  const lastNotifiedAt = useRef(
    JSON.parse(localStorage.getItem('lastNotifiedAt') || '{}')
  );
  const notesRef = useRef(notes);
  const notificationsEnabledRef = useRef(notificationsEnabled);

  // Keep refs up-to-date
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  useEffect(() => {
    selectedRingtoneRef.current = selectedRingtone;
  }, [selectedRingtone]);

  // Load notification preference from Firestore
  useEffect(() => {
    const loadNotificationPreference = async () => {
      if (!userId) {
        setNotificationsEnabled(true);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.notificationsEnabled !== undefined) {
            setNotificationsEnabled(data.notificationsEnabled);
          } else {
            await setDoc(userDocRef, { notificationsEnabled: true }, { merge: true });
            setNotificationsEnabled(true);
          }

          // Load selected ringtone from Firestore
          if (data.selectedRingtone) {
            setSelectedRingtone(data.selectedRingtone);
          }
        } else {
          await setDoc(userDocRef, { 
            notificationsEnabled: true,
            selectedRingtone: '/ringtone.wav'
          }, { merge: true });
          setNotificationsEnabled(true);
          setSelectedRingtone('/ringtone.wav');
        }
      } catch (error) {
        console.error('Error loading notification preference:', error);
        setNotificationsEnabled(true);
      }
    };

    loadNotificationPreference();
  }, [userId]);

  const playRingtone = useCallback(() => {
    const path = selectedRingtoneRef.current;
    let audioSrc = path;
    if (!path.startsWith('/') && !path.startsWith('data:')) {
      try {
        const customs = JSON.parse(localStorage.getItem('customRingtones') || '[]');
        const found = customs.find((r) => r.path === path);
        if (found) audioSrc = found.path;
      } catch {}
    }
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.volume = 1.0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error('[Ringtone] Play failed:', err.name, err.message);
      });
    }
  }, []);
  const stopAudio = () => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  }
};

  const setRingtone = (path) => {
    setSelectedRingtone(path);
    if (!userId) return;

    try {
      const userDocRef = doc(db, 'users', userId);
      setDoc(userDocRef, { selectedRingtone: path }, { merge: true }).catch((err) => {
        console.error('Error saving selected ringtone to Firestore:', err);
      });
    } catch (e) {
      console.error('[Ringtone] Error:', e);
    }
  };

  const showNotification = useCallback((note) => {
    // Play custom ringtone
    playRingtone();

    // Show toast notification with completely unique ID
    const uniqueId = `reminder-${note.id}`;
    toast.dismiss(uniqueId); // Dismiss any existing notification for this note

    toast.info(
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
          ⏰ Reminder!
        </div>
        <div style={{ fontSize: '0.95rem' }}>
          {note.title}
        </div>
          <button
      onClick={() => {
        stopAudio();
        onComplete(note.id);
        toast.dismiss(uniqueId);
      }}
      style={{
        background: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '0.3rem 0.75rem',
        fontSize: '0.8rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '0.25rem',
      }}
    >
      ✓ Mark as Complete
    </button>
      </div>,
      {
        toastId: uniqueId,
        autoClose: 20000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: false,
        closeButton: true,
        onClose: stopAudio,
      }
    );
  }, [playRingtone, onComplete]);

  // Check for due reminders every second
  useEffect(() => {
    const check = () => {
      // Only fire if permission is granted AND notifications are enabled
      if (!notificationsEnabledRef.current) {
        return;
      }

      const now = Date.now();
      const currentNotes = notesRef.current;

      if (!currentNotes || currentNotes.length === 0) return;

      currentNotes.forEach((note) => {
        // Skip completed notes
        if (note.completed) return;
        if (!note.reminderTime) return;

        const reminderTime = new Date(note.reminderTime).getTime();

        // Not yet due
        if (reminderTime > now) return;

        const entry = lastNotifiedAt.current[note.id];

        // Only fire if recently became due (within last 2 minutes) OR repeat interval passed
        //const isRecentlyDue = timeSinceDue < (2 * 60 * 1000); // 2 minutes
        const isFreshReminder = !entry || entry.forTime !== note.reminderTime;
        const isDueAgain = entry && (now - entry.firedAt) >= REPEAT_INTERVAL_MS;

        if (isFreshReminder || isDueAgain) {
          showNotification(note);

          if (!note.reminderTriggeredAt && onReminderTriggered) {
            onReminderTriggered(note.id).catch((error) => {
              console.error('Error persisting reminder trigger:', error);
            });
          }

          // Calculate the most recent "should have fired" interval boundary.
          // This prevents rapid-repeat when: (a) reminder was set long ago,
          // (b) notifications were disabled and re-enabled, or (c) page was reloaded.
          const elapsed = now - reminderTime;
          const missedIntervals = Math.floor(elapsed / REPEAT_INTERVAL_MS);
          const anchoredFiredAt = reminderTime + missedIntervals * REPEAT_INTERVAL_MS;
          lastNotifiedAt.current[note.id] = { firedAt: anchoredFiredAt, forTime: note.reminderTime };
          localStorage.setItem('lastNotifiedAt', JSON.stringify(lastNotifiedAt.current));
        }
      });
    };

    check();
    const interval = setInterval(check, 1000);

    return () => clearInterval(interval);
  }, [showNotification]);

  const toggleNotifications = async () => {
    if (!userId) return;

    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);

    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { notificationsEnabled: newValue }, { merge: true });
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  return {
    notificationsEnabled, toggleNotifications, selectedRingtone, setRingtone };
};
