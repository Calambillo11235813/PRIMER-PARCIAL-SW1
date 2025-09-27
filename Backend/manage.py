#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
    
    # FORZAR CHANNELS - NUEVO CÓDIGO AGREGADO
    try:
        # Configurar Django primero
        import django
        from django.conf import settings
        
        django.setup()
        
        # Si es el comando runserver, forzar ASGI
        if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
            print("🚀 Iniciando servidor con Channels/ASGI...")
            
            # Verificar que Channels esté configurado
            if not hasattr(settings, 'ASGI_APPLICATION'):
                print("❌ ASGI_APPLICATION no está configurado en settings.py")
            else:
                print(f"✅ ASGI_APPLICATION: {settings.ASGI_APPLICATION}")
                
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    except Exception as e:
        print(f"⚠️  Error configurando Channels: {e}")
    
    from django.core.management import execute_from_command_line
    
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()