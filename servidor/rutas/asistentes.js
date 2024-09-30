const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los asistentes
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM asistentes';
    let params = [];
    
    if (req.query.filtro) {
      query += ' WHERE nombres LIKE ? OR apellidos LIKE ?';
      params = [`%${req.query.filtro}%`, `%${req.query.filtro}%`];
    }
    
    const [asistentes] = await db.query(query, params);
    res.json(asistentes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo asistente
router.post('/', async (req, res) => {
  const { nombres, apellidos, fecha_nacimiento, email, celular } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO asistentes (nombres, apellidos, fecha_nacimiento, email, celular) VALUES (?, ?, ?, ?, ?)',
      [nombres, apellidos, fecha_nacimiento, email, celular]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener un asistente por ID
router.get('/:id', async (req, res) => {
  try {
    const [asistente] = await db.query('SELECT * FROM asistentes WHERE id = ?', [req.params.id]);
    if (asistente.length === 0) {
      return res.status(404).json({ message: 'Asistente no encontrado' });
    }
    res.json(asistente[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un asistente
router.put('/:id', async (req, res) => {
  const { nombres, apellidos, fecha_nacimiento, email, celular } = req.body;
  try {
    await db.query(
      'UPDATE asistentes SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, email = ?, celular = ? WHERE id = ?',
      [nombres, apellidos, fecha_nacimiento, email, celular, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Eliminar un asistente
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM asistentes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Asistente eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener eventos de un asistente
router.get('/:id/eventos', async (req, res) => {
  try {
    const [eventos] = await db.query(
      `SELECT e.*, ae.fecha_compra 
       FROM eventos e 
       JOIN asistentes_eventos ae ON e.id = ae.evento_id 
       WHERE ae.asistente_id = ?`,
      [req.params.id]
    );
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancelar la asistencia a un evento
router.delete('/:asistente_id/eventos/:evento_id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM asistentes_eventos WHERE asistente_id = ? AND evento_id = ?',
      [req.params.asistente_id, req.params.evento_id]
    );
    res.json({ message: 'Asistencia cancelada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Registrar un asistente a un evento
router.post('/:id/eventos', async (req, res) => {
  const { evento_id } = req.body;
  const asistente_id = req.params.id;
  try {
    // Verificar si hay cupos disponibles
    const [evento] = await db.query('SELECT cupo_disponible FROM eventos WHERE id = ?', [evento_id]);
    if (evento[0].cupo_disponible <= 0) {
      return res.status(400).json({ message: 'No hay cupos disponibles para este evento' });
    }

    // Registrar al asistente
    await db.query(
      'INSERT INTO asistentes_eventos (asistente_id, evento_id, fecha_compra) VALUES (?, ?, NOW())',
      [asistente_id, evento_id]
    );

    // Actualizar cupo disponible
    await db.query('UPDATE eventos SET cupo_disponible = cupo_disponible - 1 WHERE id = ?', [evento_id]);

    res.status(201).json({ message: 'Asistente registrado al evento exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener asistentes de un evento
router.get('/evento/:eventoId', async (req, res) => {
  try {
    const [asistentes] = await db.query(
      `SELECT a.* FROM asistentes a
       JOIN asistentes_eventos ae ON a.id = ae.asistente_id
       WHERE ae.evento_id = ?`,
      [req.params.eventoId]
    );
    res.json(asistentes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verificar-email', async (req, res) => {
  const { email, id } = req.body;
  try {
    let query = 'SELECT COUNT(*) as count FROM asistentes WHERE email = ?';
    let params = [email];

    if (id) {
      query += ' AND id != ?';
      params.push(id);
    }

    const [result] = await db.query(query, params);
    const existe = result[0].count > 0;

    res.json({ existe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;