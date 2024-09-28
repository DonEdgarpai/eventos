CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    cupo_disponible INT NOT NULL,
    tipo ENUM('gratuito', 'pago') NOT NULL,
    valor_base DECIMAL(10, 2),
    categoria ENUM('conferencias', 'seminarios', 'entretenimiento') NOT NULL,
    fecha_apertura_inscripciones DATE,
    fecha_cierre_inscripciones DATE
);

CREATE TABLE asistentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    celular VARCHAR(20)
);

CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT,
    asistente_id INT,
    tipo_entrada ENUM('gratis', 'general', 'VIP') NOT NULL,
    valor_pagado DECIMAL(10, 2) NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (asistente_id) REFERENCES asistentes(id)
);

CREATE TABLE lista_espera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT,
    asistente_id INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (asistente_id) REFERENCES asistentes(id)
);

CREATE TABLE codigos_promocionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    porcentaje_descuento DECIMAL(5, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);