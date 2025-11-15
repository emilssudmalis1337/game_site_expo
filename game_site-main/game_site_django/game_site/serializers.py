# game_site/serializers.py
from rest_framework import serializers
from .models import Game, Genre, Platform, Store, Review, OnlineStatus, Language, Award, SalesHistory

class GameSerializer(serializers.ModelSerializer):
    genre = serializers.StringRelatedField()
    platform = serializers.StringRelatedField()
    store = serializers.StringRelatedField()
    review = serializers.SerializerMethodField()
    online_status = serializers.SerializerMethodField()
    language = serializers.StringRelatedField()
    award = serializers.StringRelatedField()
    sales = serializers.SerializerMethodField()
    is_whitelisted = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            'id', 'game_name', 'genre', 'platform', 'store',
            'developer', 'publisher', 'dlc', 'game_mode', 'license',
            'system_requirements', 'review', 'multimedia', 'status',
            'sales', 'online_status', 'award', 'language', "is_whitelisted",
        ]

    # Helper methods to pull nested values safely
    def get_is_whitelisted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj in request.user.whitelisted_games.all()
    def get_review(self, obj):
        return obj.review.rating if obj.review else None

    def get_online_status(self, obj):
        return obj.online_status.active_players if obj.online_status else None

    def get_sales(self, obj):
        return obj.sales_history.units_sold if obj.sales_history else None