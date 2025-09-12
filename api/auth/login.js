const express = require('express');
const app = express();

app.use(express.json());

// Simular autenticación con Odoo
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Intento de login:', email);
    
    // Simular respuesta exitosa
    const mockUser = {
      uid: 1,
      name: 'Usuario de Prueba',
      username: email,
      email: email,
      session_id: 'mock-session-' + Date.now()
    };
    
    res.json({
      success: true,
      message: 'Login exitoso',
      user: mockUser,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({
      success: false,
      message: `Error en login: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = app;