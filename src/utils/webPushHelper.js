import API from '../services/api';

// Helper to convert VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToWebPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Web push notifications not supported by this browser.');
    return;
  }

  try {
    // 1. Get VAPID public key from backend
    const keyRes = await API.get('/api/notifications/vapid-public-key');
    const vapidPublicKey = keyRes.data.vapidPublicKey;

    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured on backend.');
      return;
    }

    // 2. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied.');
      return;
    }

    // 3. Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    
    // Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      console.log('New web push subscription created.');
    }

    // 4. Send subscription details to backend
    await API.post('/api/notifications/web-subscribe', subscription);
    console.log('Web push subscription saved successfully on server.');
  } catch (err) {
    console.error('Error subscribing to web push:', err.message);
  }
};
