# ANÁLISIS PROFUNDO — Backend (proyecto + colaboracion_tiempo_real)

Fecha: 2025-09-28

## Archivos analizados
- Backend/proyecto/models.py
- Backend/proyecto/serializer.py
- Backend/proyecto/views.py
- Backend/colaboracion_tiempo_real/models.py
- Backend/colaboracion_tiempo_real/serializers.py
- Backend/colaboracion_tiempo_real/views.py (vacío)

---

## Resumen rápido
- Dominio principal: Proyecto → DiagramaClase. Proyecto tiene creador (FK) y colaboradores (M2M). DiagramaClase guarda estructura JSON del diagrama.
- Control de acceso: métodos en modelo Proyecto (usuario_tiene_acceso) y DiagramaClase (delegando al proyecto). Serializers exponen `usuario_tiene_acceso`.
- Endpoints principales (proyecto.views):
  - Proyectos: list/create (filtrado por creador o colaboradores si autenticado).
  - Proyectos detalle: Retrieve/Update/Delete con permiso IsAuthenticated y queryset limitado a creador/colaborador.
  - Diagramas: list/create, detail/update/delete; queryset limitado a usuarios con acceso.
  - PUT para DiagramaDetalle usa partial_update (permite enviar solo `estructura`).
  - ProyectosPorUsuario expone proyectos por creador (permission AllowAny — revisar).
- Colaboración en tiempo real:
  - SesionColaborativa: OneToOne con DiagramaClase (estado de sesión por diagrama).
  - ConexionUsuario: registro por usuario/sesión con canal_id y unique_together (sesion, usuario).
  - CambioDiagrama: historiza cambios con tipo, datos JSON y flag sincronizado.
  - Serializers en `colaboracion_tiempo_real` exponen usuarios conectados y cambios; están preparados para API REST de estado de sesión y cambios.

---

## Relaciones clave y flujo esperado
1. Usuario crea Proyecto (creador). Pueden añadirse colaboradores via M2M.
2. Proyecto contiene DiagramaClase(s) con campo `estructura` JSON (serializable para React Flow).
3. Al iniciar colaboración en un diagrama:
   - Debe existir/crearse SesionColaborativa(diagrama).
   - Cada WebSocket open crea/actualiza ConexionUsuario (registro con canal_id).
   - Cambios entrantes se guardan como CambioDiagrama referenciando la Sesion (y usuario).
4. REST endpoints de diagramas permiten lectura/escritura solo si request.user es creador o colaborador (filtros en get_queryset).
5. El frontend debe solicitar lista de diagramas/proyectos a endpoints protegidos; WS middleware valida JWT y consumers coordinan Sesion/Conexion/Cambios.

---

## Observaciones técnicas y puntos de riesgo
- Permisos:
  - ProyectosPorUsuario usa AllowAny; expone proyectos creados por un usuario sin auth — revisar si es intencional.
  - ProyectoDetalleActualizarEliminar y endpoints diagramas usan IsAuthenticated, pero get_queryset filtra por creador/colaboradores: correcto.
- Serializers:
  - ProyectoSerializer añade `colaboradores_ids` con queryset=User.objects.all(); al crear/update convierte IDs a relaciones: buena UX para frontend.
  - Crear: `create` hace proyecto = Proyecto.objects.create(**validated_data) y luego set() de colaboradores. Asegurar que `validated_data` no contenga campo `creador` (perform_create en view lo añade).
- Model SesionColaborativa:
  - OneToOne con DiagramaClase: implica 1 sesión activa por diagrama; OK.
  - ConexionUsuario unique_together (sesion, usuario): un usuario solo una conexión por sesión registrada; si el mismo usuario abre varias pestañas, el modelo impediría duplicidad — revisar si deseado (quizá permitir múltiples conexiones por usuario con diferente canal_id).
- CambioDiagrama:
  - Histórico ordenado por timestamp descendente; flag sincronizado booleano — útil para replay/ack.
- Performance:
  - get_queryset en vistas filtra con Q(creador=user) | Q(colaboradores=user) pero no usa select_related/prefetch_related → potencial N+1 al serializar `colaboradores`. Recomendar prefetch_related('colaboradores') en queryset.
- Concurrencia / eventos:
  - No se ve aquí código consumers.py pero los modelos permiten event-sourcing-like storage de cambios; hay que asegurar idempotencia y orden de aplicación.
- Seguridad WS / tokens:
  - JWT usado por frontend; backend debe validar JWT en middleware (existe middleware en colaboracion_tiempo_real).
- Consistencia de sesión:
  - SesionColaborativa creado OneToOne puede dificultar mantener historial de sesiones separadas (se reusa misma fila). Ok pero documentar política de retención/activa/inactiva.
- Migraciones: existen y deben aplicarse en despliegue.

---

## Recomendaciones prácticas (prioritarias)
1. Revisar ConexionUsuario.unique_together: permitir múltiples conexiones por mismo usuario (distintas pestañas) si se desea testing por pestañas. Si se quiere una sola conexión, documentarlo y bloquear UI.
2. Añadir prefetch_related/select_related en vistas para evitar N+1 al serializar colaboradores y proyecto en list endpoints.
   - Ejemplo: Proyecto.objects.filter(...).prefetch_related('colaboradores')
3. Revisar ProyectosPorUsuario permission_class: cambiar a IsAuthenticated si no se quiere exponer proyectos por usuario públicamente.
4. Añadir endpoint/API para invitaciones:
   - POST /api/proyectos/{id}/invitaciones/ que acepte correo_electronico y rol, cree una Invitation (modelo) o directamente agregue colaborador (si user existe), envíe correo/WS notification.
5. Si se desea pruebas locales con dos pestañas del mismo usuario, actualizar ConexionUsuario para permitir varias conexiones por usuario; para pruebas con usuarios distintos, usar sessionStorage tokens en frontend (ya aplicado).
6. Definir política de limpieza/compactación de CambioDiagrama: archivado o merge para evitar crecimiento indefinido.
7. Documentar contratos REST y WS (proto) y añadir tests E2E que cubran: invitación → aceptar → acceso a diagrama → colaboración WS.
8. Considerar permitir múltiples SesionColaborativa por diagrama si se quiere sesiones históricas en paralelo (o versionar sesiones).

---

## Tareas inmediatas que puedo generar
- Crear endpoint Django + serializer + permisos para invitaciones (POST) y vista que:
  - Verifique permiso de invitador (creador o rol con permiso).
  - Añada usuario a proyecto.colaboradores si ya existe o cree Invitation con token.
  - Emitir evento WS "invitacion_recibida" si usuario está conectado.
- Añadir prefetch_related en ProyectoListaCrear.get_queryset y en Diagrama endpoints.
- Ajustar ConexionUsuario unique_together según política (permitir múltiples conexiones por usuario).
- Generar tests unitarios para views de invitación y comportamiento de SesionColaborativa/ConexionUsuario.

---  
Fin del análisis.