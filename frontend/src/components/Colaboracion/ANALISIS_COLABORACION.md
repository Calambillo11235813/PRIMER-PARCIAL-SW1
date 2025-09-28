# ANÁLISIS - carpeta Colaboracion (frontend)

Fecha: 2025-09-28

## 1. Resumen ejecutivo
La carpeta Colaboracion contiene la lógica de interacción en tiempo real del editor UML en el frontend. Está compuesta por componentes UI (ColaboracionWrapper, IndicadoresColaboracion), un hook central de conexión WS (useWebSocket.js), tests y un servicio adaptador (colaboracionService.js). El hook orquesta la conexión, envío/recepción de mensajes y mantiene el estado de presencia, errores y últimos cambios.

## 2. Estructura y responsabilidades
- ColaboracionWrapper.jsx
  - Componente contenedor que integra indicadores y provee contexto/punto de montaje del hook WS al editor.
- IndicadoresColaboracion.jsx
  - UI para mostrar usuarios conectados, estado de sincronización y notificaciones de edición concurrente.
- hooks/useWebSocket.js
  - Hook que maneja: apertura y cierre de WebSocket, reconexión, parsing de mensajes, envío de cambios, sincronización de estado y notificaciones de edición.
  - Expone: estaConectado, usuariosConectados, ultimoCambio, errores, enviarCambio, sincronizarEstado, notificarEdicion.
- services/colaboracionService.js
  - Adaptador/encapsulado para construir mensajes estandarizados / operaciones (posible solapamiento con CambioService en websocketService).
- tests (useWebSocket.test.jsx, diagramSerialization.test.js)
  - Pruebas unitarias para ciertas partes del hook y serialización; buena práctica ya presente.

## 3. Interacción con otros módulos
- EditorVisual (React Flow)
  - useWebSocket integra/coordina con hooks del editor (useEditorState, useDiagramHistory, useDiagramPersistence) para aplicar cambios entrantes y generar cambios salientes.
- services/apiConfig / authService
  - Token de auth (access_token) se lee normalmente desde localStorage y se incluye en la conexión WS (actualmente vía header list o query param según implementación).
- diagramService / projectService
  - Usados para operaciones REST complementarias (carga inicial, guardado de versiones, restauración).
- Backend (colaboracion_tiempo_real)
  - Mensajes WS deben cumplir el protocolo implementado en consumers.py; el frontend asume tipos como conexion_establecida, estado_sincronizado, cambio_confirmado, cambio_recibido, error.

## 4. Patrones clave observados
- Hook single-source-of-truth: useWebSocket centraliza la lógica de WS y expone API limpia al UI.
- Servicio de cambios (factory): CambioService/colaboracionService crea payloads estandarizados.
- Optimistic UI implícito: la arquitectura permite mostrar cambios locales y esperar confirmación del servidor (ACK).
- Separación transporte/negocio: servicios para WS y REST desacoplan el transporte de la lógica.
- Tests de hooks: uso de vitest/jest-dom y pruebas para serialización y hooks.

## 5. Riesgos e incumplimientos detectados
- Seguridad del token:
  - Token leído desde localStorage → riesgo XSS. No hay evidencia de cookie httpOnly/refresh token en WS.
- Transporte inseguro:
  - Si el hook usa ws:// (no wss://) será inseguro en producción.
- Robustez de conexión:
  - Reconexión con attempts limitados pero sin backoff exponencial ni jitter o heartbeat.
  - Falta de verificación de readyState antes de ws.send.
  - Timers/reintentos pueden quedar activos al cambiar diagramaId (posible fuga).
- Validación de mensajes:
  - No hay JSON Schema/validación de mensajes entrantes; riesgo de crash por payload malformado.
- Manejo ACK/optimistic:
  - No se evidencia patrón robusto de temporaryId → cambio_confirmado (mapping/replace) y rollback en error.
- Crecimiento de colecciones:
  - usuariosConectados y errores pueden crecer indefinidamente sin truncado/bounded history.
- Concurrency / race conditions:
  - En reconexión puede producirse duplicidad de operaciones o pérdida de orden si no hay re-sync completo.
- Tamaño de archivos / modularidad:
  - Debe revisarse que los componentes/hooks cumplan la regla del proyecto (≤150 líneas); si no, dividir.

## 6. Recomendaciones prioritarias (acciones concretas)
1. Documentar y versionar PROTOCOLO_WS.md (tipos de mensaje, payload, expected ACK, ejemplo de join/leave/edit/ack/error).
2. Implementar validación de mensajes entrantes (JSON Schema) en el cliente (y en consumers del backend).
3. Adoptar ACK flow robusto:
   - Al enviar: crear temporaryId local, mostrar optimistic update, enviar { tipo: 'cambio_diagrama', temporalId, cambio }.
   - Al recibir cambio_confirmado: reemplazar temporalId por id servidor; al recibir error revertir.
4. Seguridad token:
   - Preferir cookie httpOnly + refresh token para REST y WS. Si no posible, usar subprotocols o query param sobre WSS y documentarlo.
5. Mejora reconexión:
   - Implementar backoff exponencial con jitter y límite global.
   - Añadir heartbeat/ping-pong (ej. cada 25s) y cerrar/reconectar si no hay respuesta.
6. Robustez antes de enviar:
   - Comprobar ws.current?.readyState === WebSocket.OPEN antes de send; si no, encolar con límite.
7. Limpieza y bounded history:
   - Limitar errores almacenados a N items; manejar usuariosConectados como set con TTL si procede.
8. Tests E2E:
   - Añadir tests que simulen: envío concurrente por 2+ clientes, reconexión y re-sync, rollback en error.
9. Observabilidad:
   - Añadir logging y métricas (latencia entre enviar y cambio_confirmado, tasa de errores).
10. Refactor:
    - Centralizar tipos de mensaje y factories (CambioService) en un módulo compartido para evitar duplicidad con backend contract.

## 7. Próximos artefactos que puedo generar ahora
- PROTOCOLO_WS.md con JSON Schemas y ejemplos de mensajes (join, leave, cambio_diagrama, cambio_confirmado, estado_sincronizado, ping, pong, error).
- Patch de useWebSocket.js que añade:
  - readyState checks,
  - backoff exponencial con jitter,
  - heartbeat ping/pong,
  - temporaryId ACK pattern,
  - validación JSON Schema básica.
- Tests unitarios adicionales para ACK flow y reconexión (usando mock-socket).

## 8. Referencias a archivos clave (para revisar/editar)
- frontend/src/components/Colaboracion/useWebSocket.js
- frontend/src/components/Colaboracion/ColaboracionWrapper.jsx
- frontend/src/components/Colaboracion/IndicadoresColaboracion.jsx
- frontend/src/components/Colaboracion/services/colaboracionService.js
- backend: Backend/colaboracion_tiempo_real/consumers.py (para alinear protocolo)

---  
Fin del análisis.