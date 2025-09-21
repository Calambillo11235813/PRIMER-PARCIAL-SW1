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

Estos estándares aplican a backend (Django), frontend (React) y cualquier integración futura.

---

## 🟠 **Actualización reciente**

- **Migración completa a autenticación JWT:** El backend y frontend ahora usan tokens JWT para login, logout y protección de endpoints, eliminando la dependencia de cookies y CSRF.
- **Flujo de login y navegación corregido:** El frontend actualiza correctamente el estado de usuario tras login y permite la navegación entre Dashboard, Perfil y Registro.
- **Validación y manejo de errores mejorados:** El frontend muestra mensajes claros en caso de error de autenticación y gestiona el estado de carga y sesión de manera robusta.
- **Documentación y estructura de archivos revisada:** Todos los cambios y archivos nuevos están documentados y ubicados según los estándares definidos.
- **Editor visual funcional:** Implementación exitosa del editor de diagramas UML con React Flow, incluyendo drag-and-drop, edición modal y carga de datos. Resueltos errores de rendering y compatibilidad, mejorando la facilidad de uso y mantenibilidad del frontend.

