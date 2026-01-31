import { useEffect, useRef } from 'react';
import { Task } from '../types';

export const useNotifications = (tasks: Task[]) => {
  const processedReminders = useRef<Set<string>>(new Set());

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = async () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      
      // Pobierz rejestrację SW dla powiadomień mobilnych
      let swRegistration: ServiceWorkerRegistration | undefined = undefined;
      if ('serviceWorker' in navigator) {
        // Używamy getRegistration zamiast ready, aby nie blokować wykonania jeśli SW nie jest zainstalowany
        swRegistration = await navigator.serviceWorker.getRegistration().catch(() => undefined);
      }

      tasks.forEach(task => {
        if (!task.reminder_date || task.is_completed) return;

        const reminderTime = new Date(task.reminder_date);
        const uniqueKey = `${task.id}-${task.reminder_date}`;
        const timeDiff = now.getTime() - reminderTime.getTime();
        
        // Powiadom jeśli czas minął (timeDiff >= 0), ale nie dawniej niż 60 sekund temu
        if (timeDiff >= 0 && timeDiff < 60000) {
          if (!processedReminders.current.has(uniqueKey)) {
            const title = `🔔 ${task.title}`;
            const options: NotificationOptions = {
              body: task.description || 'Przypomnienie o zadaniu',
              tag: uniqueKey, // Zapobiega duplikatom
              requireInteraction: true,
              icon: '/vite.svg', // Ikona aplikacji
              badge: '/vite.svg'
            };

            // Użyj SW jeśli dostępny (lepsze dla mobile), w przeciwnym razie zwykłe API
            if (swRegistration) {
              swRegistration.showNotification(title, options);
            } else {
              new Notification(title, options);
            }

            // Odtwórz dźwięk
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch((e) => console.log('Audio play failed:', e));
            } catch (e) {
              console.error('Audio error:', e);
            }

            processedReminders.current.add(uniqueKey);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 5000); // Sprawdzaj co 5 sekund
    return () => clearInterval(interval);
  }, [tasks]);
};