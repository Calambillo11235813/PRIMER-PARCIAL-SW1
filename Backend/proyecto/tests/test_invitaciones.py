from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from proyecto.models import Proyecto, Invitation

User = get_user_model()

class InvitacionesAPITest(APITestCase):
    def setUp(self):
        # usuarios - usar el campo correcto 'correo_electronico' para el user personalizado
        self.creador = User.objects.create_user(username='creador', correo_electronico='creador@example.com', password='pass1234')
        self.existing = User.objects.create_user(username='exist', correo_electronico='exist@example.com', password='pass1234')
        self.otro = User.objects.create_user(username='otro', correo_electronico='otro@example.com', password='pass1234')

        # proyecto creado por creador
        self.proyecto = Proyecto.objects.create(nombre='Prueba', descripcion='Proj', creador=self.creador)

        self.client = APIClient()

    def test_invitar_usuario_existente_agrega_colaborador_y_invitacion_aceptada(self):
        self.client.force_authenticate(user=self.creador)
        url = reverse('proyecto-invitaciones', kwargs={'pk': self.proyecto.id})
        resp = self.client.post(url, {'correo_electronico': self.existing.correo_electronico, 'rol': 'colaborador'}, format='json')
        self.assertEqual(resp.status_code, 201)
        invitacion = Invitation.objects.filter(proyecto=self.proyecto, correo_electronico__iexact=self.existing.correo_electronico).first()
        self.assertIsNotNone(invitacion)
        self.assertEqual(invitacion.estado, Invitation.ESTADO_ACEPTADA)
        self.assertTrue(self.proyecto.colaboradores.filter(pk=self.existing.pk).exists())

    def test_invitar_email_no_existente_crea_invitacion_pendiente(self):
        self.client.force_authenticate(user=self.creador)
        url = reverse('proyecto-invitaciones', kwargs={'pk': self.proyecto.id})
        correo = 'nuevo@example.com'
        resp = self.client.post(url, {'correo_electronico': correo, 'rol': 'colaborador'}, format='json')
        self.assertEqual(resp.status_code, 201)
        invitacion = Invitation.objects.filter(proyecto=self.proyecto, correo_electronico__iexact=correo).first()
        self.assertIsNotNone(invitacion)
        self.assertEqual(invitacion.estado, Invitation.ESTADO_PENDIENTE)
        self.assertTrue(invitacion.token)  # token generado

    def test_invitar_duplicado_devuelve_error_validacion(self):
        self.client.force_authenticate(user=self.creador)
        url = reverse('proyecto-invitaciones', kwargs={'pk': self.proyecto.id})
        correo = 'dup@example.com'
        # primera creación
        resp1 = self.client.post(url, {'correo_electronico': correo}, format='json')
        self.assertEqual(resp1.status_code, 201)
        # intento duplicado -> serializer.validate debería devolver 400 o la vista 409
        resp2 = self.client.post(url, {'correo_electronico': correo}, format='json')
        self.assertIn(resp2.status_code, (400, 409))
        self.assertTrue('detail' in (resp2.data or {}) or resp2.status_code == 400)

    def test_aceptar_invitacion_usuario_correcto(self):
        # crear invitación pendiente para existing.correo_electronico
        invitacion = Invitation.objects.create(proyecto=self.proyecto, correo_electronico=self.existing.correo_electronico)
        token = invitacion.token
        self.client.force_authenticate(user=self.existing)
        url = reverse('invitar-acept')
        resp = self.client.post(url, {'token': token}, format='json')
        self.assertEqual(resp.status_code, 200)
        invitacion.refresh_from_db()
        self.assertEqual(invitacion.estado, Invitation.ESTADO_ACEPTADA)
        self.assertTrue(self.proyecto.colaboradores.filter(pk=self.existing.pk).exists())

    def test_aceptar_invitacion_usuario_incorrecto_devuelve_403(self):
        invitacion = Invitation.objects.create(proyecto=self.proyecto, correo_electronico='destino@example.com')
        token = invitacion.token
        # autenticar como otro usuario cuyo correo no coincide
        self.client.force_authenticate(user=self.otro)
        url = reverse('invitar-acept')
        resp = self.client.post(url, {'token': token}, format='json')
        self.assertEqual(resp.status_code, 403)