import json
from channels.db import database_sync_to_async
from proyecto.models import DiagramaClase

class ServicioSincronizacion:
    """
    Servicio para manejar la sincronización de diagramas en tiempo real.
    """
    
    @database_sync_to_async
    def aplicar_cambio_diagrama(self, diagrama_id, cambio):
        """
        Aplica un cambio al diagrama en la base de datos.
        
        Args:
            diagrama_id (int): ID del diagrama
            cambio (dict): Datos del cambio a aplicar
            
        Returns:
            bool: True si se aplicó exitosamente
        """
        try:
            diagrama = DiagramaClase.objects.get(id=diagrama_id)
            estructura_actual = diagrama.estructura or {}
            
            # Aplicar cambio según el tipo
            tipo_cambio = cambio.get('tipo')
            datos_cambio = cambio.get('datos', {})
            
            if tipo_cambio == 'crear_nodo':
                self._crear_nodo(estructura_actual, datos_cambio)
            elif tipo_cambio == 'actualizar_nodo':
                self._actualizar_nodo(estructura_actual, datos_cambio)
            elif tipo_cambio == 'eliminar_nodo':
                self._eliminar_nodo(estructura_actual, datos_cambio)
            elif tipo_cambio == 'crear_relacion':
                self._crear_relacion(estructura_actual, datos_cambio)
            elif tipo_cambio == 'actualizar_relacion':
                self._actualizar_relacion(estructura_actual, datos_cambio)
            elif tipo_cambio == 'eliminar_relacion':
                self._eliminar_relacion(estructura_actual, datos_cambio)
            
            # Guardar cambios
            diagrama.estructura = estructura_actual
            diagrama.save()
            
            return True
            
        except DiagramaClase.DoesNotExist:
            return False
        except Exception as e:
            print(f"Error aplicando cambio: {e}")
            return False

    def _crear_nodo(self, estructura, datos_nodo):
        """Crea un nuevo nodo en la estructura."""
        if 'nodos' not in estructura:
            estructura['nodos'] = []
        
        # Verificar que el nodo no exista
        nodo_id = datos_nodo.get('id')
        if not any(nodo.get('id') == nodo_id for nodo in estructura['nodos']):
            estructura['nodos'].append(datos_nodo)

    def _actualizar_nodo(self, estructura, datos_nodo):
        """Actualiza un nodo existente."""
        if 'nodos' not in estructura:
            return
            
        nodo_id = datos_nodo.get('id')
        for i, nodo in enumerate(estructura['nodos']):
            if nodo.get('id') == nodo_id:
                estructura['nodos'][i] = {**nodo, **datos_nodo}
                break

    def _eliminar_nodo(self, estructura, datos_nodo):
        """Elimina un nodo de la estructura."""
        if 'nodos' not in estructura:
            return
            
        nodo_id = datos_nodo.get('id')
        estructura['nodos'] = [
            nodo for nodo in estructura['nodos'] 
            if nodo.get('id') != nodo_id
        ]

    def _crear_relacion(self, estructura, datos_relacion):
        """Crea una nueva relación."""
        if 'relaciones' not in estructura:
            estructura['relaciones'] = []
        
        relacion_id = datos_relacion.get('id')
        if not any(rel.get('id') == relacion_id for rel in estructura['relaciones']):
            estructura['relaciones'].append(datos_relacion)

    def _actualizar_relacion(self, estructura, datos_relacion):
        """Actualiza una relación existente."""
        if 'relaciones' not in estructura:
            return
            
        relacion_id = datos_relacion.get('id')
        for i, relacion in enumerate(estructura['relaciones']):
            if relacion.get('id') == relacion_id:
                estructura['relaciones'][i] = {**relacion, **datos_relacion}
                break

    def _eliminar_relacion(self, estructura, datos_relacion):
        """Elimina una relación."""
        if 'relaciones' not in estructura:
            return
            
        relacion_id = datos_relacion.get('id')
        estructura['relaciones'] = [
            rel for rel in estructura['relaciones'] 
            if rel.get('id') != relacion_id
        ]

    @database_sync_to_async
    def obtener_estado_diagrama(self, diagrama_id):
        """
        Obtiene el estado actual del diagrama.
        
        Args:
            diagrama_id (int): ID del diagrama
            
        Returns:
            dict: Estructura del diagrama o None si no existe
        """
        try:
            diagrama = DiagramaClase.objects.get(id=diagrama_id)
            return diagrama.estructura or {'nodos': [], 'relaciones': []}
        except DiagramaClase.DoesNotExist:
            return None