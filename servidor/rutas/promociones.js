const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const [promocion] = await db.query(
      'SELECT * FROM promociones WHERE codigo = ? AND activo = 1 AND fecha_fin >= CURDATE()',
      [codigo]
    );

    if (promocion.length === 0) {
      return res.status(404).json({ message: 'Código promocional no válido o expirado' });
    }

    res.json(promocion[0]);
  } catch (error) {
    console.error('Error al validar código promocional:', error);
    res.status(500).json({ message: 'Error al validar código promocional' });
  }
});

module.exports = router;