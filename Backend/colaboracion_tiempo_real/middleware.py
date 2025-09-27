# colaboracion_tiempo_real/middleware.py
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.conf import settings
from urllib.parse import parse_qs
import logging

from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.backends import TokenBackend

logger = logging.getLogger(__name__)
User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware para autenticar WebSockets con JWT.
    Soporta token en:
      - header Authorization: Bearer <token>
      - query string ?token=<token>
    Inserta el objeto user en scope['user'] o AnonymousUser si no hay token válido.
    """

    async def __call__(self, scope, receive, send):
        headers = dict(scope.get('headers', []))
        token = None

        # 1) Intentar Authorization header
        auth = headers.get(b'authorization')
        if auth:
            try:
                parts = auth.decode().split()
                if len(parts) == 2 and parts[0].lower() == 'bearer':
                    token = parts[1]
            except Exception:
                token = None

        # 2) Fallback: token en query string (navegador-friendly)
        if not token:
            qs = scope.get('query_string', b'').decode()
            params = parse_qs(qs)
            token_list = params.get('token') or params.get('access') or params.get('authorization') or []
            if token_list:
                token = token_list[0]

        # 3) Validar token y cargar user en scope
        try:
            if token:
                # Validación inicial
                UntypedToken(token)

                # Decodificar payload para obtener user_id
                signing_key = getattr(settings, 'SIMPLE_JWT', {}).get('SIGNING_KEY', settings.SECRET_KEY)
                algorithm = getattr(settings, 'SIMPLE_JWT', {}).get('ALGORITHM', 'HS256')
                backend = TokenBackend(algorithm=algorithm, signing_key=signing_key)
                payload = backend.decode(token, verify=False)

                user_id = payload.get('user_id') or payload.get('user') or payload.get('sub')
                if user_id:
                    try:
                        user = await database_sync_to_async(User.objects.get)(id=user_id)
                        scope['user'] = user
                    except Exception:
                        logger.debug("JWTAuthMiddleware: usuario no encontrado para id=%s", user_id)
                        scope['user'] = AnonymousUser()
                else:
                    scope['user'] = AnonymousUser()
            else:
                scope['user'] = AnonymousUser()
        except Exception as e:
            logger.debug("JWTAuthMiddleware: token inválido o error procesando token: %s", e)
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)