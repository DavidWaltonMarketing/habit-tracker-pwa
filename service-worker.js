self.addEventListener('install', event => {
    console.log('Service Worker installed');
  });
  
  self.addEventListener('activate', event => {
    console.log('Service Worker activated');
  });
  
  // Simple push notification (works if triggered by the page)
  self.addEventListener('message', event => {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  });
  