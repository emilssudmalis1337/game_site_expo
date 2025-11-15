# <-- top of the file (after imports) ---------------------------------
from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import views as auth_views
from . import views
from accounts.views import api_login
# ---------------------------------------------------------------------

urlpatterns = [
    # -----------------------------------------------------------------
    # 1️⃣  CSRF‑exempt login view – must be BEFORE the generic include
    # -----------------------------------------------------------------
    path("accounts/", include("accounts.urls")),               # <-- this brings in our api_login

    # -----------------------------------------------------------------
    # 2️⃣  Your other app URLs (games, api, etc.)
    # -----------------------------------------------------------------
    path('admin/', admin.site.urls),
    path('games/', views.games_view, name="games"),
    path('update_game/', views.update_game, name="update_game"),
    path('delete_game/', views.delete_game, name="delete_game"),
    path('', views.games_view_main, name="home"),
    path('game/<int:game_id>/json/', views.game_detail_json, name='game_detail_json'),
    path("whitelist/<int:game_id>/", views.toggle_whitelist, name="toggle_whitelist"),
    path('api/', include('game_site.api_urls')),

    # -----------------------------------------------------------------
    # 3️⃣  Include the rest of the auth URLs (logout, password reset, …)
    # -----------------------------------------------------------------
    path("accounts/", include("accounts.urls")),               # your signup view, etc.
    path("accounts/", include("django.contrib.auth.urls")),    # ← unchanged
]