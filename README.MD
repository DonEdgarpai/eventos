Eventos - Gestión de Eventos
Descripción
Este proyecto es una aplicación web para la gestión de eventos. Permite a los usuarios visualizar una lista de eventos, inscribirse, ver detalles, reseñas y una galería de imágenes para cada evento. Los administradores tienen la capacidad de crear, editar y eliminar eventos desde un panel administrativo.

La aplicación está desarrollada en React.js para el frontend y Express.js para el backend. La base de datos utilizada es MySQL, gestionada a través de la base de datos MariaDB.

Características
Ver lista de eventos con detalles como fecha, lugar, tipo, cupo disponible y más.
Funcionalidad de administración para crear, editar y eliminar eventos.
Los usuarios pueden ver reseñas y calificaciones asociadas a cada evento.
Galería de imágenes disponible para cada evento.
Inscripción a eventos a través de fechas definidas de apertura y cierre.
Tecnologías
Frontend:
React.js (con Vite)
Tailwind CSS para el diseño de la interfaz
React Router para la navegación
Axios para las llamadas HTTP
JavaScript ES6+
Backend:
Express.js para la API
MySQL/MariaDB para la base de datos
Node.js como entorno de ejecución
bcrypt para la encriptación de contraseñas
Multer para la subida de imágenes
Requisitos
Node.js >= 14.0
MySQL/MariaDB
Git
Configuración del Proyecto
Clonar el repositorio:

git clone https://github.com/DonEdgarpai/eventos.git


Configurar Backend:
Dirígete a la carpeta servidor:

cd servidor


Instala las dependencias:

npm install


Configura el archivo .env con tus variables de entorno:

DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_de_tu_base_de_datos


Ejecuta las migraciones para crear las tablas necesarias en la base de datos:

node db.js


Inicia el servidor:

npm run dev

Configurar Frontend:
Dirígete a la carpeta cliente:

cd cliente


Instala las dependencias:

npm install


Configura las variables de entorno en el archivo .env:

REACT_APP_API_URL=http://localhost:5000 ( aqui va el puerto de tu local host)

ahora iniciar tu cliente npm start


Base de Datos
El archivo base-de-datos/esquema.sql contiene el esquema de la base de datos. Asegúrate de ejecutar este archivo en tu servidor MySQL/MariaDB para crear las tablas necesarias para el proyecto.

Scripts Disponibles
En el directorio de cada parte del proyecto (cliente y servidor), puedes ejecutar los siguientes comandos:

npm start
Ejecuta la aplicación en modo producción.

npm run dev
Ejecuta la aplicación en modo desarrollo.

Endpoints Principales (Backend)
GET /eventos - Lista de eventoss
GET /eventos/
- Detalles de un evento
POST /eventos - Crear un nuevo evento (requiere autenticación)
PUT /eventos/
- Editar un evento existente (requiere autenticación)
DELETE /eventos/
- Eliminar un evento (requiere autenticación)
Estructura del Proyecto
bash
Copiar código
├── base-de-datos
│   └── esquema.sql
├── cliente
│   ├── public
│   ├── src
│   │   ├── componentes
│   │   ├── ui
│   │   ├── App.js
│   │   ├── index.js
│   └── package.json
├── servidor
│   ├── rutas
│   │   ├── eventos.js
│   │   ├── asistentes.js
│   │   └── pagos.js
│   ├── db.js
│   └── package.json
├── .gitignore
├── README.md

