# manage_channels.py
import os
import sys

# Forzar configuración de Channels
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

# Importar después de configurar el entorno
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    # Forzar uso de ASGI/Channels
    if 'runserver' in sys.argv:
        # Agregar flag para forzar ASGI
        sys.argv.append('--asgi')
    
    execute_from_command_line(sys.argv)