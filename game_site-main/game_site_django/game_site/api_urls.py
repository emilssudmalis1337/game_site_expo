# game_site/api_urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .api_views import GameViewSet, GenreViewSet, PlatformViewSet, StoreViewSet

router = DefaultRouter()
router.register(r"games", GameViewSet, basename="game")
router.register(r"genres", GenreViewSet, basename="genre")
router.register(r"platforms", PlatformViewSet, basename="platform")
router.register(r"stores", StoreViewSet, basename="store")

urlpatterns = [
    path("", include(router.urls)),
    # No extra endpoints – the router already provides:
    #   POST   /api/games/
    #   DELETE /api/games/<pk>/
]