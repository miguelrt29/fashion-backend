# Fashion Store — E-commerce de Moda

## Estructura
- Backend: ./backend/fashion-backend (NestJS + PostgreSQL)
- Frontend: ./frontend/fashion-frontend (Angular 21)

## Backend rutas activas
- POST /api/auth/register
- POST /api/auth/login
- GET/POST/PUT/DELETE /api/products
- POST /api/ai/chat, /recommendations, /visual-search

## Cambios realizados (Chatbot Asistente Virtual)
- Chatbot rediseñado como asistente virtual completo
- Creado `src/ai/store-knowledge.json` con info de: envíos, garantías, devoluciones, métodos de pago, contacto, FAQ
- Reescrito `src/ai/ai.service.ts` (limpio, sin errores de sintaxis)
- Eliminadas funciones innecesarias: `extractDominantColor()`, `searchByTextFilter()`, `extractProductType()`, `extractColor()`
- Mejorado `buildSystemPrompt()` para incluir base de conocimiento
- Corregido `parseJsonResponse()` para limpiar `**` y markdown
- Mantenido intacto: Cart, Favorites, Products, Orders (no se tocaron)

## Sistema de respuestas
- Saludos: Texto plano cordial
- Dudas sobre tienda: Usa `store-knowledge.json` (texto plano)
- Consulta de productos: JSON estructurado con productos del catálogo
- No usa `**`, markdown, ni comillas triples

## Reglas importantes
- Las API keys SIEMPRE en .env, nunca en el código
- Siempre habla en español. SIEMPRE
- PostgreSQL en localhost:5432, DB: fashion_store
- Frontend corre en localhost:4200
- Backend corre en localhost:3000
- BACKEND_URL=http://localhost:3000 en .env

## Tests
- `npm test -- ai.service.spec.ts` → 8/8 tests passing
- `npm run build` → Build exitoso sin errores

## Pendiente en backend
- Integrar sistema de tickets para escalamiento real (shouldEscalate)
- Cargar cupones promocionales en BD
- Agregar tiempos de entrega por ciudad en store-knowledge.json