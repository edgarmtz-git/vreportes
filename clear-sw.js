// Script para limpiar Service Workers en desarrollo
(function() {
  'use strict';
  
  if ('serviceWorker' in navigator) {
    // Desregistrar todos los Service Workers
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('🧹 Limpiando Service Workers...');
      registrations.forEach(function(registration) {
        console.log('🗑️ Desregistrando SW:', registration.scope);
        registration.unregister();
      });
      console.log('✅ Service Workers limpiados');
    }).catch(function(error) {
      console.log('❌ Error limpiando Service Workers:', error);
    });
    
    // Limpiar cache si existe
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('🗑️ Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(function() {
        console.log('✅ Cache limpiado');
      }).catch(function(error) {
        console.log('❌ Error limpiando cache:', error);
      });
    }
  }
})();
