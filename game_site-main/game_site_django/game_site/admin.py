from django.contrib import admin
from .models import (
    Platform,
    Store,
    Size,
    Developer,
    Publisher,
    DLC,
    GameMode,
    License,
    SystemRequirement,
    Review,
    Multimedia,
    Status,
    SalesHistory,
    GameLog,
    Rating,
    OnlineStatus,
    Award,
    Language,
    Genre,
    Game
)
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

admin.site.register(Platform)
admin.site.register(Store)
admin.site.register(Size)
admin.site.register(Developer)
admin.site.register(Publisher)
admin.site.register(DLC)
admin.site.register(GameMode)
admin.site.register(License)
admin.site.register(SystemRequirement)
admin.site.register(Review)
admin.site.register(Multimedia)
admin.site.register(Status)
admin.site.register(SalesHistory)
admin.site.register(GameLog)
admin.site.register(Rating)
admin.site.register(OnlineStatus)
admin.site.register(Award)
admin.site.register(Language)
admin.site.register(Genre)
admin.site.register(Game)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Use Django’s built‑in UserAdmin but point it at our CustomUser model.
    This gives us the familiar “Users” list with all the usual fields
    (username, password, is_staff, is_active, groups, etc.).
    """
    # The fields that appear on the list view
    list_display = ("username", "email", "first_name", "last_name", "user_type", "is_staff")
    # Fields you can filter by in the sidebar
    list_filter = ("is_staff", "is_superuser", "user_type", "is_active", "groups")
    # Fields shown on the detail/edit page – we keep the default layout
    fieldsets = UserAdmin.fieldsets
    add_fieldsets = UserAdmin.add_fieldsets
    # Allow searching by username or email
    search_fields = ("username", "email")
    ordering = ("username",)
