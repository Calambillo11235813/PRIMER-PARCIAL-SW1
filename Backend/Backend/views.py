from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

@login_required
def user_info(request):
    user = request.user
    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })