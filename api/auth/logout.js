const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/auth/logout', async (req, res) => {
  try {
    console.log('🚪 Cerrando sesión...');
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Error al cerrar sesión:', error);
    res.status(500).json({
      success: false,
      message: `Error al cerrar sesión: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = app;