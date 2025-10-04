# Prueba_1 - Backend + Frontend

Proyecto de ejemplo que contiene un backend en Node/Express y un frontend SPA simple usando React por CDN.

Estructura del repositorio (monorepo esperado):

- /backend -> servidor Express (puede arrancarse en su propio puerto)
- /client -> frontend estático (SPA) que consume la API en /api/productos

Instalación y ejecución (desde la raíz del repo):

1) Instalar dependencias del backend:

   cd backend
   npm install

2) Ejecutar backend:

   npm start

3) Abrir el cliente en un servidor estático o copiar los archivos de /client a la carpeta pública de un servidor. Para pruebas rápidas se puede servir la carpeta `client` usando `serve` (npm i -g serve) o apuntar el proxy al backend que sirve `public/`.

Endpoints relevantes (backend):

- GET /api/productos -> lista completa de productos
- GET /api/productos/:id -> producto por id
- GET /api/greeting -> mensaje de prueba
- POST /api/echo -> devuelve lo recibido en el body
