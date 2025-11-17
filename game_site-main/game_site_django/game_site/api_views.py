# -----------------------------------------
# game_site/api_views.py
# -----------------------------------------------
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets, permissions
from rest_framework.authentication import SessionAuthentication

# ---------------------------------------------------------------
#  Import models and the (new) serializers
# -----------------------------------------------------------
from .models import Game, Genre, Platform, Store
from .serializers import GameSerializer, SimpleNameSerializer


# ----------------------------------------
#  CSRF‑exempt session authentication (keeps your existing login flow)
# ----------------------------------------------------------
class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Overwrite the parent method – do nothing → no CSRF check.
        return


# -----------------------------------------------------------------
#  Game view‑set – unchanged except for import paths
# -----------------------------------------------------------------
@method_decorator(csrf_exempt, name="dispatch")
class GameViewSet(viewsets.ModelViewSet):
    """
    API endpoints (all under /api/games/):
        GET    /api/games/            → list all games
        GET    /api/games/<pk>/       → retrieve a single game
        POST   /api/games/            → create a new game
        DELETE /api/games/<pk>/       → delete a game
        (PUT / PATCH are also available if you need them)
    """
    queryset = Game.objects.select_related(
        "genre",
        "platform",
        "store",
        "review",
        "online_status",
        "language",
        "award",
        "sales_history",
    )
    serializer_class = GameSerializer

    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


# -----------------------------------------------------------------
#  Generic read‑only view‑set for the three lookup tables
# -----------------------------------------------------------------
class SimpleReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides only `list` and `retrieve` actions.
    Sub‑classes only need to set `queryset` and `serializer_class`.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]   # public read‑only


# ----------------------------------------------------------------
#  Genre lookup
# -----------------------------------------------------------------
class GenreViewSet(SimpleReadOnlyViewSet):
    queryset = Genre.objects.all()
    serializer_class = SimpleNameSerializer
    # Tell the generic serializer which concrete model it is handling
    serializer_class.Meta.model = Genre


# -----------------------------------------------------------------
#  Platform lookup
# -----------------------------------------------------------------
class PlatformViewSet(SimpleReadOnlyViewSet):
    queryset = Platform.objects.all()
    serializer_class = SimpleNameSerializer
    serializer_class.Meta.model = Platform


# -----------------------------------------------------------------
#  Store lookup
# -----------------------------------------------------------------
class StoreViewSet(SimpleReadOnlyViewSet):
    queryset = Store.objects.all()
    serializer_class = SimpleNameSerializer
    serializer_class.Meta.model = Store