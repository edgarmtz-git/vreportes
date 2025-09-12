const express = require('express');
const app = express();

app.get('/api/odoo-config', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        odooUrl: process.env.ODOO_URL || 'https://fexs.mx',
        odooDb: process.env.ODOO_DB || 'Productiva',
        dbHost: process.env.DB_HOST || '98.80.84.181',
        dbPort: process.env.DB_PORT || '5432',
        dbName: process.env.DB_NAME || 'Productiva',
        dbUser: process.env.DB_USER || 'odoo16'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: `Error al obtener configuración: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = app;
