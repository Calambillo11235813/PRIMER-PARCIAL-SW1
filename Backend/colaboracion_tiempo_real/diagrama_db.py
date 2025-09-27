from channels.db import database_sync_to_async
from proyecto.models import DiagramaClase
from .models import SesionColaborativa, ConexionUsuario, CambioDiagrama

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
        diagrama = DiagramaClase.objects.get(id=diagrama_id)
        
        # Inicializar estructura si no existe
        if not diagrama.estructura:
            diagrama.estructura = {'nodos': [], 'relaciones': []}
        
        # Simular aplicación del cambio (implementar lógica real después)
        print(f"📝 Aplicando cambio al diagrama {diagrama_id}: {cambio.get('tipo')}")
        
        # Por ahora, simplemente marcamos la estructura como modificada
        diagrama.estructura['ultima_modificacion'] = str(timezone.now())
        
        diagrama.save()
        return True
        
    except DiagramaClase.DoesNotExist:
        print(f"❌ Diagrama {diagrama_id} no existe")
        return False
    except Exception as e:
        print(f"❌ Error aplicando cambio: {e}")
        return False

@database_sync_to_async
def registrar_cambio_diagrama(diagrama_id, cambio, usuario):
    """
    Registra un cambio en el diagrama en la base de datos.
    """
    try:
        sesion, creada = SesionColaborativa.objects.get_or_create(
            diagrama_id=diagrama_id,
            defaults={'activa': True}
        )
        
        cambio_obj = CambioDiagrama.objects.create(
            sesion=sesion,
            usuario=usuario,
            tipo_cambio=cambio.get('tipo', 'actualizar_nodo'),
            datos_cambio=cambio
        )
        print(f"📊 Cambio registrado: {cambio_obj.id}")
        return cambio_obj
        
    except Exception as e:
        print(f"❌ Error registrando cambio: {e}")
        return None

@database_sync_to_async
def obtener_timestamp_actual():
    from django.utils import timezone
    return timezone.now().isoformat()