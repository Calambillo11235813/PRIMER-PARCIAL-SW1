# colaboracion_tiempo_real/middleware.py
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
import jwt
from usuario.models import UsuarioPersonalizado

class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware para autenticar WebSockets con JWT.
    """
    
    async def __call__(self, scope, receive, send):
        # Extraer token JWT de los headers
        headers = dict(scope.get('headers', []))
        
        # Buscar token en Authorization header
        auth_header = None
        for key, value in headers.items():
            if key == b'authorization' or key == b'Authorization':
                auth_header = value.decode('utf-8')
                break
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]  # Remover 'Bearer '
            scope['user'] = await self.get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        """
        Obtiene el usuario desde el token JWT.
        """
        try:
            # Decodificar token JWT
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            user_id = payload.get('user_id')
            if user_id:
                return UsuarioPersonalizado.objects.get(id=user_id)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, UsuarioPersonalizado.DoesNotExist):
            pass
        return AnonymousUser()