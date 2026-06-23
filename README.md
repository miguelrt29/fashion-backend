# Fashion Store - E-commerce de Moda

## Descripcion
Fashion Store es una plataforma de comercio electronico de moda que permite a los usuarios explorar, buscar y comprar productos de ropa, calzado y accesorios. Cuenta con un backend robusto en NestJS y un frontend moderno en Angular 21, ademas de un asistente virtual impulsado por IA para mejorar la experiencia del cliente.

## Tecnologias Utilizadas
### Backend
- NestJS (Framework Node.js)
- PostgreSQL (Base de datos relacional)
- HuggingFace API (Modelo de lenguaje meta-llama/Llama-3.2-1B-Instruct)
- TypeScript
- Jest (Pruebas unitarias)

### Frontend
- Angular 21
- TypeScript
- HTML/CSS

## Estructura del Proyecto
```
fashion-store/
├── README.md                # Este archivo
├── backend/
│   └── fashion-backend/     # Backend NestJS
│       ├── src/
│       │   ├── ai/          # Modulo de Inteligencia Artificial
│       │   │   ├── ai.service.ts
│       │   │   ├── ai.controller.ts
│       │   │   ├── store-knowledge.json  # Base de conocimiento de la tienda
│       │   │   ├── embedding.service.ts  # Servicio de embeddings para busqueda visual
│       │   │   └── helpers/  # Funciones auxiliares (similitud de coseno)
│       │   ├── auth/        # Modulo de autenticacion
│       │   ├── products/    # Modulo de productos
│       │   ├── cart/        # Modulo de carrito (pendiente)
│       │   ├── favorites/   # Modulo de favoritos (pendiente)
│       │   ├── orders/      # Modulo de pedidos
│       │   └── users/       # Modulo de usuarios (pendiente)
│       ├── .env             # Variables de entorno (no versionar)
│       ├── package.json
│       └── AGENTS.md        # Instrucciones para agentes de IA
└── frontend/
    └── fashion-frontend/    # Frontend Angular 21
        ├── src/
        │   ├── app/
        │   │   ├── services/  # Servicios HTTP para consumir el backend
        │   │   ├── pages/     # Paginas de la aplicacion
        │   │   └── components/ # Componentes reutilizables
        └── package.json
```

## Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior, configurado en localhost:5432)
- Angular CLI (v21 o superior)
- Cuenta en HuggingFace con API key para el modelo de IA

## Configuracion del Entorno
### Backend
1. Crear un archivo `.env` en `backend/fashion-backend/` con las siguientes variables (nunca subir al repositorio):
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_contraseña
DATABASE_NAME=fashion_store
HUGGING_FACE_API_KEY=hf_tu_api_key_de_huggingface
BACKEND_URL=http://localhost:3000
JWT_SECRET=tu_secreto_jwt
```
2. Asegurarse de que la base de datos `fashion_store` exista en PostgreSQL.

### Frontend
1. Configurar la URL del backend en `frontend/fashion-frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Instalacion
### Backend
```bash
cd backend/fashion-backend
npm install
```

### Frontend
```bash
cd frontend/fashion-frontend
npm install
```

## Ejecucion del Proyecto
### Backend (Modo desarrollo con hot-reload)
```bash
cd backend/fashion-backend
npm run start:dev
```
El backend se ejecutara en `http://localhost:3000`.

### Frontend
```bash
cd frontend/fashion-frontend
ng serve
```
El frontend se ejecutara en `http://localhost:4200`.

## Endpoints del Backend (Activos)
### Autenticacion
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesion

### Productos
- `GET /api/products` - Listar todos los productos
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Inteligencia Artificial
- `POST /api/ai/chat` - Chat con el asistente virtual
- `POST /api/ai/recommendations` - Obtener recomendaciones de productos
- `POST /api/ai/visual-search` - Busqueda visual de productos

## Asistente Virtual (Chatbot)
Fashion Store cuenta con un asistente virtual que cumple con las siguientes reglas:
- Responde saludos con texto plano cordial (sin JSON)
- Proporciona informacion de la tienda usando `store-knowledge.json` (envios, garantias, devoluciones, pagos) en texto plano
- Muestra productos en formato JSON estructurado al consultar el catalogo
- No utiliza markdown, ** ni formatos innecesarios en sus respuestas
- Soporta busqueda por texto y busqueda visual mediante embeddings
- Responde siempre en espanol, maximo 2 oraciones

### Base de Conocimiento
El archivo `src/ai/store-knowledge.json` contiene:
- Informacion de contacto y horarios de atencion
- Politicas de envio (costo $15,000 COP, gratis en compras superiores a $150,000 COP)
- Garantia de 30 dias por defectos de fabrica
- Periodo de devoluciones de 15 dias
- Metodos de pago aceptados (Stripe, MercadoPago, Contraentrega)
- Preguntas frecuentes (FAQ)

## Archivos Estáticos
El backend sirve imagenes subidas en `http://localhost:3000/uploads`, utilizado para las imagenes de los productos.

## Pruebas
### Backend
Ejecutar todas las pruebas:
```bash
cd backend/fashion-backend
npm test
```
Ejecutar pruebas del servicio de IA (8 pruebas pasando):
```bash
npm test -- ai.service.spec.ts
```

## Funcionalidades Pendientes (Backend)
- Carrito de compras (Cart)
- Favoritos (Favorites)
- Reseñas de productos (Reviews)
- Gestion de usuarios (Users)
- Boletin de noticias (Newsletter)
- Cupones de descuento (Coupons)

## Reglas de Desarrollo
- Todas las claves API deben estar en archivos `.env`, nunca en el codigo fuente
- Todo el codigo, documentacion y respuestas de la IA deben estar en espanol
- PostgreSQL se ejecuta en `localhost:5432` con base de datos `fashion_store`
- No modificar los modulos: Cart, Favorites, Products, Users, Orders (salvo indicacion contraria)
- No utilizar emojis en las respuestas de la IA ni en el codigo

## Contribucion
Si deseas contribuir, por favor sigue las reglas de desarrollo y crea un pull request con tus cambios detallando las modificaciones realizadas.

## Licencia
Este proyecto es de uso privado. Todos los derechos reservados.
