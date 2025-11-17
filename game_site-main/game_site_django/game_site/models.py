import datetime
import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """Extended user with a role selector and a whitelist relationship."""
    USER_TYPE_CHOICES = (
        ("gamer", "Gamer"),
        ("dev", "Developer"),
    )
    user_type = models.CharField(
        max_length=5,
        choices=USER_TYPE_CHOICES,
        default="dev",
    )

    # --------------------------------------------------------------
    # Whitelist – simple ManyToMany (replace with `through=` if you need extra columns)
    # --------------------------------------------------------------
    whitelisted_games = models.ManyToManyField(
        "Game",
        related_name="whitelisted_by",
        blank=True,
        help_text="Games this user has marked as ‘whitelisted’ (favorite).",
    )
    

class Genre(models.Model):
    genre_ID=models.IntegerField()
    Genre_Name=models.CharField(max_length=30)
    Genre_Popularity=models.CharField(max_length=20)
    
    def __str__(self):
        return self.Genre_Name
        
class Platform(models.Model):
    platform_ID=models.IntegerField()
    Platform_Name=models.CharField(max_length=30)
    
    def __str__(self):
        return self.Platform_Name
        
class Store(models.Model):
    store_ID=models.IntegerField()
    Store_Name=models.CharField(max_length=30)
    
    def __str__(self):
        return self.Store_Name
       
class Size(models.Model):
    size_ID = models.IntegerField()
    size_type = models.CharField(max_length=30)

    def __str__(self):
        return self.size_type


class Developer(models.Model):
    developer_ID = models.IntegerField()
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    gender = models.CharField(max_length=10)
    country = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Publisher(models.Model):
    publisher_ID = models.IntegerField()
    publisher_name = models.CharField(max_length=50)
    country = models.CharField(max_length=30)

    def __str__(self):
        return self.publisher_name


class DLC(models.Model):
    dlc_ID = models.IntegerField()
    dlc_name = models.CharField(max_length=50)
    dlc_price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return self.dlc_name


class GameMode(models.Model):
    mode_ID = models.IntegerField()
    mode_name = models.CharField(max_length=30)

    def __str__(self):
        return self.mode_name


class License(models.Model):
    license_ID = models.IntegerField()
    license_name = models.CharField(max_length=50)

    def __str__(self):
        return self.license_name


class SystemRequirement(models.Model):
    requirement_ID = models.IntegerField()
    operating_system = models.CharField(max_length=50)
    processor = models.CharField(max_length=50)
    ram = models.CharField(max_length=20)
    gpu = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.operating_system}, {self.processor}"


class Review(models.Model):
    review_ID = models.IntegerField()
    rating = models.IntegerField()
    text = models.TextField()

    def __str__(self):
        return f"Rating: {self.rating}"


class Multimedia(models.Model):
    website = models.URLField()
    store_link = models.URLField()

    def __str__(self):
        return self.website


class Status(models.Model):
    status_ID = models.IntegerField()
    status_name = models.CharField(max_length=30)

    def __str__(self):
        return self.status_name


class SalesHistory(models.Model):
    units_sold = models.IntegerField()

    def __str__(self):
        return f"Sold: {self.units_sold}"


class GameLog(models.Model):
    log_ID = models.IntegerField()
    log_description = models.TextField()

    def __str__(self):
        return f"Log {self.log_ID}"


class Rating(models.Model):
    rating_ID = models.IntegerField()
    rating_name = models.CharField(max_length=30)

    def __str__(self):
        return self.rating_name


class OnlineStatus(models.Model):
    active_players = models.IntegerField()
    registered_players = models.IntegerField()

    def __str__(self):
        return f"Active: {self.active_players}, Registered: {self.registered_players}"


class Award(models.Model):
    award_ID = models.IntegerField()
    award_name = models.CharField(max_length=50)

    def __str__(self):
        return self.award_name


class Language(models.Model):
    language_ID = models.IntegerField()
    language_name = models.CharField(max_length=30)

    def __str__(self):
        return self.language_name
        
class Game(models.Model):
    game_name = models.CharField(max_length=30)

    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    size = models.ForeignKey(Size, on_delete=models.SET_NULL, null=True)
    developer = models.ForeignKey(Developer, on_delete=models.SET_NULL, null=True)
    publisher = models.ForeignKey(Publisher, on_delete=models.SET_NULL, null=True)
    dlc = models.ForeignKey(DLC, on_delete=models.SET_NULL, null=True, blank=True)
    game_mode = models.ForeignKey(GameMode, on_delete=models.SET_NULL, null=True)
    license = models.ForeignKey(License, on_delete=models.SET_NULL, null=True)
    system_requirements = models.ForeignKey(SystemRequirement, on_delete=models.SET_NULL, null=True)
    review = models.ForeignKey(Review, on_delete=models.SET_NULL, null=True, blank=True)
    multimedia = models.ForeignKey(Multimedia, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True)
    sales_history = models.ForeignKey(SalesHistory, on_delete=models.SET_NULL, null=True, blank=True)
    game_log = models.ForeignKey(GameLog, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.ForeignKey(Rating, on_delete=models.SET_NULL, null=True)
    online_status = models.ForeignKey(OnlineStatus, on_delete=models.SET_NULL, null=True, blank=True)
    award = models.ForeignKey(Award, on_delete=models.SET_NULL, null=True, blank=True)
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.game_name



