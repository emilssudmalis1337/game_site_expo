# game_site/api_views.py
from rest_framework import viewsets, permissions
from .models import Game
from .serializers import GameSerializer

class GameViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides:
      - GET /api/games/          → list all games
      - GET /api/games/<pk>/     → retrieve a single game (JSON)
    """
    queryset = Game.objects.select_related(
        'genre', 'platform', 'store', 'review', 'online_status',
        'language', 'award', 'sales_history'
    )
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny] 

def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx    # adjust later if you need auth