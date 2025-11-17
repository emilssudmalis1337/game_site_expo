from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from .views import SignUpView, api_login, api_logout, me


urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("login/", api_login, name="login"),
    path("logout/", api_logout, name="logout"),
     path("me/", me, name="me"),
    
]