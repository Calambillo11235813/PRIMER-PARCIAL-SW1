# CONTEXTO DESARROLLADO (Actualizado)

## 🟢 Avances Realizados

1. **Configuración del entorno**
   - Entorno virtual Python y dependencias instaladas.
   - Docker y PostgreSQL configurados con archivo `.env`.

2. **Backend Django**
   - Proyecto y app `usuario` inicializados.
   - Modelo `UsuarioPersonalizado` con campos en español y migraciones aplicadas.
   - Endpoints REST para login, logout y CRUD de usuarios implementados con Django REST Framework.
   - Backend de autenticación personalizado por correo electrónico.
   - Validación y manejo correcto del campo `username` en el modelo y serializer.
   - Depuración y corrección de errores de registro (duplicados, validaciones).
   - Ejemplo de uso y documentación de endpoints en JSON.

3. **Frontend React**
   - Proyecto React con Vite y Tailwind configurado.
   - Servicios para autenticación y usuarios (`authService.js`, `usuarioService.js`, `apiConfig.js`).
   - Componentes principales: Login, Navbar, Registro y PerfilUsuario.
   - Página de perfil de usuario con edición y visualización de datos.
   - Manejo de sesión y cierre de sesión desde el frontend.
   - Navegación entre login y registro usando React Router.
   - Corrección de duplicidad en la barra de navegación y mejora de UX.
   - Registro de usuario funcional y redirección automática tras registro.
   - **Editor Visual para Diagramas UML**: Implementación completa del editor de diagramas usando React Flow. Incluye nodos custom para clases UML (ClaseNodeRF.jsx), drag-and-drop funcional desde Sidebar, edición de clases vía modal (EditarClaseModal.jsx), y carga de diagramas existentes desde el backend. Migración exitosa de React Diagrams a React Flow para mejor estabilidad y facilidad de uso, resolviendo errores de rendering y permitiendo diseño colaborativo básico.

---

## 🟡 Próximos Pasos

- Validaciones y permisos avanzados en endpoints.
- Panel de proyectos y gestión de diagramas UML.
- Colaboración en tiempo real (Django Channels).
- Generación automática de código backend desde diagramas.
- Integración de IA para sugerencias y generación de diagramas.
- Mejorar la edición y guardado del perfil de usuario.
- Implementar notificaciones y manejo de errores en el frontend.

---

## 🟣 Estado Actual

- Autenticación y gestión básica de usuarios funcional.
- Registro de usuarios y navegación entre páginas funcionando.
- Interfaz de usuario intuitiva y conectada al backend.
- **Editor visual para diagramas UML operativo**: Permite arrastrar clases, editar propiedades y cargar diagramas existentes, cumpliendo con CU4 y CU6.
- Listo para avanzar con módulos colaborativos, panel de proyectos y diagramas UML.

---

## 🔵 Estándares de Desarrollo

La IA debe seguir estrictamente estas indicaciones para mantener consistencia, claridad y calidad en todo el código generado:


- **Comentarios y Documentación**: Seguir **PEP 8** para Python. Incluir docstrings en clases, funciones y métodos con descripciones claras, ejemplos de uso y parámetros. Usar comentarios en línea para lógica compleja.
- **Nombres de Variables, Funciones y Clases**: Usar español para mayor claridad y coherencia (e.g., `ProyectoListaCrear` en lugar de `ProjectListCreate`). Evitar abreviaturas innecesarias.
- **Navegación y Componentes**: En frontend, usar React Router para navegación y componentes reutilizables. Mantener estructura modular.
- **General**: Priorizar legibilidad, evitar código duplicado, y validar contra factores de calidad (correctitud, eficiencia, fiabilidad, facilidad de uso, mantenimiento, portabilidad, seguridad).
- **Modularidad y tamaño de archivos**: Ningún archivo debe superar las 150 líneas de código. Si es necesario, dividir el código en componentes o módulos adicionales para mantener la modularidad y facilitar el mantenimiento.


Estos estándares aplican a backend (Django), frontend (React) y cualquier integración futura.

---

🟢 AVANCES REALIZADOS - RESUMEN COMPLETO
1. CONFIGURACIÓN DEL ENTORNO
✅ Entorno virtual Python y dependencias instaladas

✅ Docker y PostgreSQL configurados con archivo .env

✅ Redis configurado para Channel Layers (modo memoria para desarrollo)

2. BACKEND DJANGO - COMPLETO
Autenticación y Usuarios
✅ Modelo UsuarioPersonalizado con campos en español

✅ Sistema de roles integrado (Anfitrión, Colaborador)

✅ Endpoints REST completos para CRUD de usuarios

✅ Autenticación JWT implementada y funcionando

✅ Backend personalizado por correo electrónico

✅ Validaciones robustas y manejo de errores

Gestión de Proyectos y Diagramas
✅ Modelos Proyecto y DiagramaClase con relaciones completas

✅ Sistema de colaboradores en proyectos (ManyToMany)

✅ Campo JSON para estructura de diagramas (compatible con React Flow)

✅ Serializers y vistas CRUD completas

✅ Permisos de acceso implementados

COLABORACIÓN EN TIEMPO REAL - NUEVO 🚀
✅ App colaboracion_tiempo_real creada y configurada

✅ WebSockets con Django Channels funcionando correctamente

✅ Middleware de autenticación JWT para WebSockets implementado

✅ Consumidores WebSocket para manejo de conexiones y mensajes

✅ Modelos para sesiones colaborativas, conexiones y cambios

✅ Sincronización en tiempo real entre múltiples usuarios

✅ Pruebas exitosas con múltiples clientes conectados simultáneamente

3. FRONTEND REACT - COMPLETO
Autenticación y Navegación
✅ Proyecto React con Vite y Tailwind CSS configurado

✅ Servicios para autenticación JWT (authService.js)

✅ Componentes: Login, Registro, Navbar, PerfilUsuario

✅ Navegación con React Router funcionando

✅ Manejo de estado de sesión y tokens JWT

Editor UML Avanzado
✅ Editor visual con React Flow completamente funcional

✅ Nodos custom para clases UML (ClaseNodeRF.jsx)

✅ Drag & drop desde sidebar

✅ Edición modal de propiedades de clases

✅ Arquitectura modular con componentes especializados:

hooks/usePointsManagement.js - Gestión de puntos

hooks/useDragAndDrop.js - Lógica de arrastre

components/UMLSymbols/ - Símbolos UML estándar

components/MultiplicidadLabels.jsx - Etiquetas

components/ConnectionHandles.jsx - Handles

components/RelationshipLine.jsx - Líneas

Integración Backend-Frontend
✅ Carga y guardado de diagramas desde backend

✅ Navegación entre páginas con estado de sesión robusto

✅ Validación y manejo de errores mejorado

4. INTEGRACIÓN COMPLETA - NUEVO 🎯
✅ Flujo de autenticación JWT backend-frontend funcionando

✅ WebSockets integrados y probados exitosamente

✅ Comunicación bidireccional en tiempo real demostrada

✅ Múltiples usuarios pueden conectarse simultáneamente

✅ Sincronización de cambios funcionando correctamente