from channels.db import database_sync_to_async
from django.db import transaction
from django.utils import timezone  # ← AGREGAR ESTA LÍNEA
import logging

from proyecto.models import DiagramaClase
from .models import SesionColaborativa, ConexionUsuario, CambioDiagrama


logger = logging.getLogger(__name__)


@database_sync_to_async
def verificar_acceso_diagrama(diagrama_id, usuario):
    try:
        diagrama = DiagramaClase.objects.get(id=diagrama_id)
        return diagrama.usuario_tiene_acceso(usuario)
    except DiagramaClase.DoesNotExist:
        return False

@database_sync_to_async
def obtener_o_crear_sesion(diagrama_id):
    diagrama = DiagramaClase.objects.get(id=diagrama_id)
    sesion, creada = SesionColaborativa.objects.get_or_create(
        diagrama=diagrama,
        defaults={'activa': True}
    )
    return sesion

@database_sync_to_async
def obtener_sesion_activa(diagrama_id):
    try:
        return SesionColaborativa.objects.get(diagrama_id=diagrama_id, activa=True)
    except SesionColaborativa.DoesNotExist:
        return None

@database_sync_to_async
def registrar_conexion_usuario(sesion, usuario, channel_name):
    conexion, creada = ConexionUsuario.objects.update_or_create(
        sesion=sesion,
        usuario=usuario,
        defaults={
            'canal_id': channel_name,
            'desconectado': False
        }
    )
    return conexion

@database_sync_to_async
def desregistrar_conexion_usuario(sesion, usuario):
    try:
        conexion = ConexionUsuario.objects.get(
            sesion=sesion,
            usuario=usuario,
            desconectado=False
        )
        conexion.desconectado = True
        conexion.save()
        return True
    except ConexionUsuario.DoesNotExist:
        return False

@database_sync_to_async
def obtener_usuarios_conectados(diagrama_id):
    try:
        sesion = SesionColaborativa.objects.get(diagrama_id=diagrama_id, activa=True)
        conexiones = ConexionUsuario.objects.filter(
            sesion=sesion,
            desconectado=False
        ).select_related('usuario')
        return [
            {
                'id': conexion.usuario.id,
                'nombre': f"{conexion.usuario.nombre} {conexion.usuario.apellido}",
                'correo': conexion.usuario.correo_electronico,
                'fecha_conexion': conexion.fecha_conexion.isoformat()
            }
            for conexion in conexiones
        ]
    except SesionColaborativa.DoesNotExist:
        return []

@database_sync_to_async
def obtener_estado_diagrama(diagrama_id):
    try:
        diagrama = DiagramaClase.objects.get(id=diagrama_id)
        return diagrama.estructura or {'nodos': [], 'relaciones': []}
    except DiagramaClase.DoesNotExist:
        return {'nodos': [], 'relaciones': []}

@database_sync_to_async
def aplicar_cambio_diagrama(diagrama_id, cambio, usuario):
    """
    Aplica un cambio al diagrama en la base de datos.
    """
    try:
        logger.info(f"🔧 Aplicando cambio al diagrama {diagrama_id}: {cambio.get('tipo')}")
        
        # Import defensivo/local para evitar NameError si hay diferencias de carga
        from django.utils import timezone as _timezone

        with transaction.atomic():
            diagrama = DiagramaClase.objects.get(id=diagrama_id)
            
            # Inicializar estructura si no existe
            if not diagrama.estructura:
                diagrama.estructura = {'nodos': [], 'relaciones': []}
            
            # Aplicar cambio según el tipo
            tipo_cambio = cambio.get('tipo')
            datos = cambio.get('datos', {})
            
            if tipo_cambio == 'crear_nodo':
                if 'nodos' not in diagrama.estructura:
                    diagrama.estructura['nodos'] = []
                
                # Verificar que el nodo no exista ya
                nodo_existente = next((n for n in diagrama.estructura['nodos'] if n.get('id') == datos.get('id')), None)
                if not nodo_existente:
                    diagrama.estructura['nodos'].append(datos)
                    logger.info(f"✅ Nodo creado: {datos.get('id')}")
                else:
                    logger.warning(f"⚠️  Nodo ya existe: {datos.get('id')}")
            
            # ... otros casos ...

            # Actualizar timestamp
            diagrama.estructura['ultima_modificacion'] = _timezone.now().isoformat()
            diagrama.fecha_actualizacion = _timezone.now()
            
            diagrama.save()
            logger.info(f"✅ Diagrama {diagrama_id} guardado exitosamente")
            return True
            
    except DiagramaClase.DoesNotExist:
        logger.warning(f"Diagrama {diagrama_id} no existe")
        return False
    except Exception as e:
        logger.exception(f"Error aplicando cambio al diagrama {diagrama_id}: {e}")
        return False

@database_sync_to_async
def registrar_cambio_diagrama(diagrama_id, cambio, usuario):
    """
    Registra un cambio en el diagrama en la base de datos.
    Devuelve el id del cambio registrado (int) o None en fallo.
    """
    try:
        # Obtener o crear sesión (usar diagrama_id o diagrama según su modelo)
        # Usamos la opción segura con objeto DiagramaClase
        diagrama = DiagramaClase.objects.get(id=diagrama_id)
        sesion, creada = SesionColaborativa.objects.get_or_create(
            diagrama=diagrama,
            defaults={'activa': True}
        )
        
        cambio_obj = CambioDiagrama.objects.create(
            sesion=sesion,
            usuario=usuario,
            tipo_cambio=cambio.get('tipo', 'actualizar_nodo'),
            datos_cambio=cambio
        )
        
        logger.info(f"📊 Cambio registrado en BD: {cambio_obj.id}")
        # Devolver solo el id para evitar problemas de transporte/serialización
        return cambio_obj.id
        
    except Exception as e:
        logger.exception(f"❌ Error registrando cambio: {e}")
        return None

@database_sync_to_async
def obtener_timestamp_actual():
    from django.utils import timezone
    return timezone.now().isoformat()