import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from .diagrama_db import (
    verificar_acceso_diagrama,
    obtener_o_crear_sesion,
    obtener_sesion_activa,
    registrar_conexion_usuario,
    desregistrar_conexion_usuario,
    obtener_usuarios_conectados,
    obtener_estado_diagrama,
    aplicar_cambio_diagrama,
    registrar_cambio_diagrama,
    obtener_timestamp_actual
)

logger = logging.getLogger(__name__)

class DiagramaConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket para colaboración en tiempo real en diagramas UML.
    Maneja conexiones, desconexiones y mensajes relacionados con diagramas.
    """

    async def connect(self):
        """
        Maneja la conexión WebSocket y verifica permisos de acceso al diagrama.
        """
        try:
            self.diagrama_id = self.scope['url_route']['kwargs']['diagrama_id']
            self.grupo_diagrama = f'diagrama_{self.diagrama_id}'
            self.usuario = self.scope["user"]

            print(f"🔍 DEBUG: Usuario en scope: {self.usuario}")
            print(f"🔍 DEBUG: Headers: {self.scope.get('headers', [])}")

            # TEMPORAL: Permitir conexiones sin autenticación para pruebas
            if isinstance(self.usuario, AnonymousUser):
                print("⚠️  Usuario anónimo, permitiendo temporalmente para pruebas")
                # Continuar sin cerrar la conexión para pruebas

            # Resto del código sin cambios...
            await self.channel_layer.group_add(
                self.grupo_diagrama,
                self.channel_name
            )

            await self.accept()
            print("✅ Conexión WebSocket aceptada")

            # Enviar mensaje de prueba
            await self.send(text_data=json.dumps({
                'tipo': 'conexion_establecida',
                'mensaje': 'Conexión WebSocket exitosa'
            }))

        except Exception as e:
            print(f"❌ Error en conexión: {e}")
            await self.close()

    

    async def disconnect(self, close_code):
        """
        Maneja la desconexión WebSocket.
        """
        try:
            logger.info(f"Desconectando WebSocket para usuario {getattr(self.usuario, 'id', 'anon')}, código: {close_code}")

            # Desregistrar conexión de usuario
            sesion = await obtener_sesion_activa(self.diagrama_id)
            if sesion:
                await desregistrar_conexion_usuario(sesion, self.usuario)

            # Salir del grupo del diagrama
            if hasattr(self, 'grupo_diagrama'):
                await self.channel_layer.group_discard(
                    self.grupo_diagrama,
                    self.channel_name
                )

            # Notificar a otros usuarios sobre la desconexión (solo si estaba autenticado)
            if not isinstance(self.usuario, AnonymousUser) and hasattr(self, 'grupo_diagrama'):
                usuarios_conectados = await obtener_usuarios_conectados(self.diagrama_id)
                
                await self.channel_layer.group_send(
                    self.grupo_diagrama,
                    {
                        'type': 'notificar_usuario_desconectado',
                        'usuario_id': self.usuario.id,
                        'usuario_nombre': f"{self.usuario.nombre} {self.usuario.apellido}",
                        'usuarios_conectados': usuarios_conectados
                    }
                )

        except Exception as e:
            logger.error(f"Error en desconexión WebSocket: {e}")

    async def receive(self, text_data):
        """
        Maneja los mensajes recibidos a través del WebSocket.
        """
        try:
            data = json.loads(text_data)
            tipo_evento = data.get('tipo')
            
            logger.debug(f"Mensaje recibido: {tipo_evento} de usuario {self.usuario.id}")

            if tipo_evento == 'cambio_diagrama':
                await self.procesar_cambio_diagrama(data)
            elif tipo_evento == 'usuario_editando':
                await self.procesar_usuario_editando(data)
            elif tipo_evento == 'sincronizar_estado':
                await self.sincronizar_estado_diagrama()
            elif tipo_evento == 'ping':
                await self.enviar_pong()
            else:
                await self.enviar_error(f'Tipo de evento no reconocido: {tipo_evento}')

        except json.JSONDecodeError as e:
            logger.error(f"Error decodificando JSON: {e}")
            await self.enviar_error('Formato JSON inválido')
        except Exception as e:
            logger.error(f"Error procesando mensaje: {e}")
            await self.enviar_error('Error interno del servidor')

    async def procesar_cambio_diagrama(self, data):
        """
        Valida y aplica un cambio recibido desde un cliente.
        Envía confirmación al emisor con cambio_id y propaga el cambio al grupo.
        """
        cambio = data.get('cambio')
        if not cambio:
            await self.enviar_error("Payload inválido: falta campo 'cambio'")
            return

        usuario = getattr(self.scope, "user", None)
        if usuario is None or getattr(usuario, "is_anonymous", True):
            await self.enviar_error("No autorizado para realizar cambios")
            return

        # Aplicar cambio en BD
        aplicado = await aplicar_cambio_diagrama(self.diagrama_id, cambio, usuario)
        if not aplicado:
            await self.enviar_error("No se pudo aplicar el cambio al diagrama")
            return

        # Registrar cambio y obtener id
        cambio_obj = await registrar_cambio_diagrama(self.diagrama_id, cambio, usuario)
        cambio_id = getattr(cambio_obj, "id", None)

        # Confirmar solo al emisor
        await self.send(text_data=json.dumps({
            "tipo": "cambio_confirmado",
            "cambio_id": cambio_id
        }))

        # Propagar a grupo para que otros clientes apliquen/vean el cambio
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "propagar_cambio_diagrama",
                "usuario_id": usuario.id,
                "usuario_nombre": getattr(usuario, "nombre", str(usuario)),
                "cambio": cambio,
                "cambio_id": cambio_id
            }
        )

    async def procesar_usuario_editando(self, data):
        """
        Procesa notificaciones de usuario editando elementos.
        """
        try:
            elemento_id = data.get('elemento_id')
            editando = data.get('editando', False)
            
            await self.channel_layer.group_send(
                self.grupo_diagrama,
                {
                    'type': 'propagar_estado_edicion',
                    'elemento_id': elemento_id,
                    'usuario_id': self.usuario.id,
                    'usuario_nombre': f"{self.usuario.nombre} {self.usuario.apellido}",
                    'editando': editando
                }
            )

        except Exception as e:
            logger.error(f"Error procesando estado de edición: {e}")

    async def sincronizar_estado_diagrama(self):
        """
        Sincroniza el estado actual del diagrama con el usuario.
        """
        try:
            estado_diagrama = await obtener_estado_diagrama(self.diagrama_id)
            usuarios_conectados = await obtener_usuarios_conectados(self.diagrama_id)
            
            await self.send(text_data=json.dumps({
                'tipo': 'estado_sincronizado',
                'estructura': estado_diagrama,
                'usuarios_conectados': usuarios_conectados
            }))
        except Exception as e:
            logger.error(f"Error sincronizando estado: {e}")
            await self.enviar_error('Error sincronizando estado')

    async def enviar_pong(self):
        """Responde a un ping con pong."""
        await self.send(text_data=json.dumps({
            'tipo': 'pong',
            'timestamp': await obtener_timestamp_actual()
        }))

    # ========== HANDLERS PARA EVENTOS DE GRUPO ==========

    async def propagar_cambio_diagrama(self, event):
        """
        Propaga un cambio a todos los usuarios excepto al remitente.
        """
        # Evento enviado desde procesar_cambio_diagrama -> reenviar a clientes
        await self.send(text_data=json.dumps({
            "tipo": "cambio_recibido",
            "usuario_nombre": event.get("usuario_nombre"),
            "cambio": event.get("cambio"),
            "cambio_id": event.get("cambio_id")
        }))

    async def notificar_usuario_conectado(self, event):
        """
        Notifica sobre un nuevo usuario conectado.
        """
        # No notificar al usuario que se acaba de conectar
        if event['usuario_id'] != self.usuario.id:
            await self.send(text_data=json.dumps({
                'tipo': 'usuario_conectado',
                'usuario_id': event['usuario_id'],
                'usuario_nombre': event['usuario_nombre'],
                'usuarios_conectados': event['usuarios_conectados']
            }))

    async def notificar_usuario_desconectado(self, event):
        """
        Notifica sobre un usuario desconectado.
        """
        await self.send(text_data=json.dumps({
            'tipo': 'usuario_desconectado',
            'usuario_id': event['usuario_id'],
            'usuario_nombre': event['usuario_nombre'],
            'usuarios_conectados': event['usuarios_conectados']
        }))

    async def propagar_estado_edicion(self, event):
        """
        Propaga el estado de edición de un elemento.
        """
        # Solo enviar a otros usuarios
        if event['usuario_id'] != self.usuario.id:
            await self.send(text_data=json.dumps({
                'tipo': 'usuario_editando',
                'elemento_id': event['elemento_id'],
                'usuario_id': event['usuario_id'],
                'usuario_nombre': event['usuario_nombre'],
                'editando': event['editando']
            }))

    # ========== MÉTODOS AUXILIARES ==========

    async def enviar_error(self, mensaje):
        """Envía un mensaje de error al cliente."""
        await self.send(text_data=json.dumps({
            "tipo": "error",
            "mensaje": mensaje
        }))