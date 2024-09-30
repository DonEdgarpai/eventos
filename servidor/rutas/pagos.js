const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { eventoId, tipoEntrada, codigosPromocionales, total, esGratuito } = req.body;

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Verificar entradas disponibles
    const [evento] = await connection.query('SELECT * FROM eventos WHERE id = ?', [eventoId]);
    if (evento[0].cupo_disponible <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'No hay entradas disponibles' });
    }

    // Validar límite de códigos promocionales
    if (!esGratuito && codigosPromocionales.length > 2) {
      await connection.rollback();
      return res.status(400).json({ message: 'No se pueden aplicar más de dos códigos promocionales' });
    }

    let totalFinal = esGratuito ? 0 : total;

    if (!esGratuito) {
      // Calcular descuento total
      let descuentoTotal = 0;
      for (const codigo of codigosPromocionales) {
        const [promocion] = await connection.query('SELECT porcentaje_descuento FROM promociones WHERE codigo = ?', [codigo]);
        if (promocion.length > 0) {
          descuentoTotal += promocion[0].porcentaje_descuento;
        }
      }
      totalFinal = Math.max(total * (1 - descuentoTotal / 100), evento[0].valor_base * 0.7);
    }

    // Realizar la compra o inscripción
    const codigosUtilizados = esGratuito ? null : codigosPromocionales.join(',');
    const [result] = await connection.query(
      'INSERT INTO inscripciones (evento_id, tipo_entrada, valor_pagado, codigos_promocionales_utilizados) VALUES (?, ?, ?, ?)',
      [eventoId, tipoEntrada, totalFinal, codigosUtilizados]
    );
    const inscripcionId = result.insertId;

    // Actualizar cupo disponible
    await connection.query('UPDATE eventos SET cupo_disponible = cupo_disponible - 1 WHERE id = ?', [eventoId]);

    await connection.commit();
    res.status(201).json({ message: esGratuito ? 'Inscripción realizada con éxito' : 'Compra realizada con éxito', inscripcionId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al realizar la compra:', error);
    res.status(500).json({ message: 'Error al procesar la compra' });
  } finally {
    if (connection) connection.release();
  }
});

router.post('/lista-espera', async (req, res) => {
  const { eventoId, email } = req.body;

  try {
    await db.query('INSERT INTO lista_espera (evento_id, email) VALUES (?, ?)', [eventoId, email]);
    res.status(201).json({ message: 'Agregado a la lista de espera' });
  } catch (error) {
    console.error('Error al agregar a la lista de espera:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
});

module.exports = router;