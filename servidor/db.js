const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error conectando a la base de datos:', err);
    } else {
      console.log('Conexión a la base de datos establecida correctamente');
      connection.release();
    }
  });
  
  module.exports = pool.promise();

module.exports = pool.promise();