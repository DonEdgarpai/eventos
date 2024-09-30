const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM eventos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
});

// Obtener eventos activos
router.get('/activos', async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      'SELECT * FROM eventos WHERE fecha >= ? AND cupo_disponible > 0 ORDER BY fecha ASC',
      [currentDate]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener eventos activos:', error);
    res.status(500).json({ message: 'Error al obtener eventos activos' });
  }
});

// Obtener un evento específico
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM eventos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ message: 'Error al obtener evento' });
  }
});

// Crear un nuevo evento
router.post('/', async (req, res) => {
  const { titulo, descripcion, fecha, hora, lugar, cupo_disponible, tipo, valor_base, categoria, fecha_apertura_inscripciones, fecha_cierre_inscripciones } = req.body;
  try {

    const valorBase = tipo === 'gratuito' ? 0 : valor_base;

    const [result] = await db.query(
      'INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar, cupo_disponible, tipo, valor_base, categoria, fecha_apertura_inscripciones, fecha_cierre_inscripciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, fecha, hora, lugar, cupo_disponible, tipo, valorBase, categoria, fecha_apertura_inscripciones, fecha_cierre_inscripciones]
    );
    
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ message: 'Error al crear evento' });
  }
});

// Actualizar un evento
router.put('/:id', async (req, res) => {
  const { titulo, descripcion, fecha, hora, lugar, cupo_disponible, tipo, valor_base, categoria, fecha_apertura_inscripciones, fecha_cierre_inscripciones } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE eventos SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, lugar = ?, cupo_disponible = ?, tipo = ?, valor_base = ?, categoria = ?, fecha_apertura_inscripciones = ?, fecha_cierre_inscripciones = ? WHERE id = ?',
      [titulo, descripcion, fecha, hora, lugar, cupo_disponible, tipo, valor_base, categoria, fecha_apertura_inscripciones, fecha_cierre_inscripciones, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ message: 'Error al actualizar evento' });
  }
});

// Eliminar un evento
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM eventos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ message: 'Error al eliminar evento' });
  }
});

// Obtener capacidad de un evento
router.get('/:id/capacidad', async (req, res) => {
  try {
    const [evento] = await db.query('SELECT cupo_disponible FROM eventos WHERE id = ?', [req.params.id]);
    if (evento.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    const [asistentes] = await db.query('SELECT COUNT(*) as ocupada FROM asistentes_eventos WHERE evento_id = ?', [req.params.id]);
    
    const capacidad = {
      total: evento[0].cupo_disponible,
      ocupada: asistentes[0].ocupada,
      disponible: evento[0].cupo_disponible - asistentes[0].ocupada
    };
    
    res.json(capacidad);
  } catch (error) {
    console.error('Error al obtener capacidad del evento:', error);
    res.status(500).json({ message: 'Error al obtener capacidad del evento' });
  }
});

// Obtener lista de espera de un evento
router.get('/:id/lista-espera', async (req, res) => {
  try {
    const [listaEspera] = await db.query(
      `SELECT a.id, a.nombres, a.apellidos, le.fecha_registro
       FROM asistentes a
       JOIN lista_espera le ON a.id = le.asistente_id
       WHERE le.evento_id = ?
       ORDER BY le.fecha_registro`,
      [req.params.id]
    );
    
    res.json(listaEspera);
  } catch (error) {
    console.error('Error al obtener lista de espera:', error);
    res.status(500).json({ message: 'Error al obtener lista de espera' });
  }
});

// Obtener reseñas de un evento
router.get('/:id/resenas', async (req, res) => {
  try {
    const [resenas] = await db.query(
      'SELECT r.*, u.nombre as nombre_usuario FROM resenas r LEFT JOIN usuarios u ON r.usuario_id = u.id WHERE r.evento_id = ? ORDER BY r.fecha_creacion DESC',
      [req.params.id]
    );
    res.json(resenas);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
});

// Agregar reseña a un evento
router.post('/:id/resenas', async (req, res) => {
  const { calificacion, comentario } = req.body;
  const eventoId = req.params.id;

  try {
    if (!calificacion || !comentario) {
      return res.status(400).json({ message: 'La calificación y el comentario son requeridos' });
    }

    const [result] = await db.query(
      'INSERT INTO resenas (evento_id, calificacion, comentario) VALUES (?, ?, ?)',
      [eventoId, calificacion, comentario]
    );

    res.status(201).json({ id: result.insertId, message: 'Reseña agregada correctamente' });
  } catch (error) {
    console.error('Error al agregar reseña:', error);
    res.status(500).json({ message: 'Error al agregar reseña' });
  }
});

// Obtener imágenes de un evento
router.get('/:id/imagenes', async (req, res) => {
  try {
    const [imagenes] = await db.query('SELECT * FROM imagenes_evento WHERE evento_id = ?', [req.params.id]);
    res.json(imagenes);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ message: 'Error al obtener imágenes' });
  }
});

// Agregar imagen a un evento
router.post('/:id/imagenes', upload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
  }

  const url = `/uploads/${req.file.filename}`;

  try {
    const [result] = await db.query(
      'INSERT INTO imagenes_evento (evento_id, url) VALUES (?, ?)',
      [req.params.id, url]
    );
    res.status(201).json({ id: result.insertId, url: url, message: 'Imagen subida correctamente' });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: 'Error al subir imagen' });
  }
});

module.exports = router;