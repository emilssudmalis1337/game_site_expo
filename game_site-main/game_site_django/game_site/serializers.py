# --------------------------------------------------------------
# game_site/serializers.py
# --------------------------------------------------------------
from rest_framework import serializers
from .models import Game, Genre, Platform, Store


# ------------------------------------------------------
#  Game serializer – write with PKs, read with friendly names
# ------------------------------------------
# ── game_site/serializers.py ───────────────────────────
class GameSerializer(serializers.ModelSerializer):
    # existing fields …
    genre_name = serializers.SerializerMethodField()
    platform_name = serializers.SerializerMethodField()
    store_name = serializers.SerializerMethodField()
    is_whitelisted = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = (
          "id",
            "game_name",
            "genre",
          "platform",
            "store",
            "genre_name",
            "platform_name",
            "store_name",
         "is_whitelisted",
          # … any other fields you already expose …
        )
        read_only_fields = (
            "id",
            "genre_name",
          "platform_name",
            "store_name",
          "is_whitelisted",
        )

    # ---------------------------------------------------------------
   # Human‑readable helpers
    # -----------------------------------------------------------------
    def get_genre_name(self, obj):
        return getattr(obj.genre, "Genre_Name", "")

    def get_platform_name(self, obj):
        return getattr(obj.platform, "Platform_Name", "")

    def get_store_name(self, obj):
        return getattr(obj.store, "Store_Name", "")

    # -----------------------------------------------------------------
    # Whitelist flag – you already have this logic
    # -----------------------------------------------------------------
    def get_is_whitelisted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj in request.user.whitelisted_games.all()

# -----------------------------------------------------------------
class SimpleNameSerializer(serializers.ModelSerializer):
    """
    Returns:
        {
            "id": <int>,
            "name": <human‑readable string>,
            "legacy_name": <same as name>
        }
    """
    name = serializers.SerializerMethodField()
    legacy_name = serializers.ReadOnlyField(source="legacy_source")

    class Meta:
        model = None               # will be set by each view‑set
        fields = ("id", "name", "legacy_name")
        read_only_fields = fields

    def get_name(self, obj):
        if isinstance(obj, Genre):
            return obj.Genre_Name
        if isinstance(obj, Platform):
            return obj.Platform_Name
        if isinstance(obj, Store):
            return obj.Store_Name
        return str(obj)

    @property
    def legacy_source(self):
        # Re‑use the same logic as `get_name` for the legacy field
        return self.get_name(self.instance)