import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ensureNotificationPermission, showSystemNotification } from '../utils/reminderNotifications';
const REPEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RINGTONE = `${import.meta.env.BASE_URL}ringtone.wav`;

// Normalize Firestore timestamps (Timestamp instance, {seconds}, or ms number)
// into a millisecond epoch. Returns null when it can't be resolved.
const toMillis = (value) => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return null;
};

export const useNotifications = (notes, userId, onComplete, onReminderTriggered) => {
  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedRingtone, setSelectedRingtone] = useState(DEFAULT_RINGTONE);
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
            selectedRingtone: DEFAULT_RINGTONE
          }, { merge: true });
          setNotificationsEnabled(true);
          setSelectedRingtone(DEFAULT_RINGTONE);
        }
      } catch (error) {
        console.error('Error loading notification preference:', error);
        setNotificationsEnabled(true);
      }
    };

    loadNotificationPreference();
  }, [userId]);

  // Ask for OS notification permission so reminders can also surface while the
  // app is backgrounded/minimized (not just as in-page toasts).
  useEffect(() => {
    if (notificationsEnabled) {
      ensureNotificationPermission();
    }
  }, [notificationsEnabled]);

  // Lazily create ONE reusable audio element. Reusing a single element (instead
  // of `new Audio()` per reminder) is what lets us keep it "unlocked" for
  // autoplay after the first user gesture.
  const getAudioEl = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    return audioRef.current;
  };

  const resolveAudioSrc = (path) => {
    let audioSrc = path;
    if (!path.startsWith('/') && !path.startsWith('data:')) {
      try {
        const customs = JSON.parse(localStorage.getItem('customRingtones') || '[]');
        const found = customs.find((r) => r.path === path);
        if (found) audioSrc = found.path;
      } catch {
        // Ignore malformed customRingtones cache.
      }
    }
    return audioSrc;
  };

  const playRingtone = useCallback(() => {
    const audio = getAudioEl();
    audio.src = resolveAudioSrc(selectedRingtoneRef.current);
    audio.muted = false;
    audio.volume = 1.0;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err && err.name === 'NotAllowedError') {
          // Autoplay is blocked until the user interacts with the page at least
          // once. The toast + OS notification still alert the user; audio will
          // play for subsequent reminders after any tap/click/keypress.
          console.warn('[Ringtone] Autoplay blocked until first interaction:', err.message);
        } else {
          console.error('[Ringtone] Play failed:', err.name, err.message);
        }
      });
    }
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Unlock audio playback on the first user interaction so reminder ringtones
  // can be played later from the timer without a direct user gesture (browser
  // autoplay policy). We play the element muted once, then reset it.
  useEffect(() => {
    const unlock = () => {
      if (audioUnlockedRef.current) return;
      const audio = getAudioEl();
      audio.src = resolveAudioSrc(selectedRingtoneRef.current);
      audio.muted = true;
      const finish = () => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audioUnlockedRef.current = true;
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(finish).catch(() => {
          // Some browsers reject muted programmatic play too; ignore and retry
          // on the next interaction.
        });
      } else {
        finish();
      }
    };

    const events = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, []);

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
    // Surface an OS-level notification when the tab isn't focused so the user
    // still gets alerted while the app is backgrounded/minimized.
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      showSystemNotification({
        title: '⏰ Reminder!',
        body: note.title,
        tag: `reminder-${note.id}`,
      });
    }

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

        const isFreshReminder = !entry || entry.forTime !== note.reminderTime;
        const isDueAgain = entry && (now - entry.firedAt) >= REPEAT_INTERVAL_MS;

        // Bug fix: prevent the "sudden burst on reopen". If this device has no
        // local dedup record (e.g. fresh reload / different device / cleared
        // storage) but Firestore shows the reminder was ALREADY triggered for
        // this exact time within the repeat window, don't re-alert. Seed the
        // local record so it rejoins the normal 5-minute repeat cadence.
        if (isFreshReminder && !isDueAgain) {
          const triggeredMs = toMillis(note.reminderTriggeredAt);
          if (triggeredMs && (now - triggeredMs) < REPEAT_INTERVAL_MS) {
            lastNotifiedAt.current[note.id] = { firedAt: triggeredMs, forTime: note.reminderTime };
            localStorage.setItem('lastNotifiedAt', JSON.stringify(lastNotifiedAt.current));
            return;
          }
        }

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
