import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    level = models.CharField(max_length=50, default="Beginner")
    original_uuid = models.CharField(max_length=36, blank=True, null=True, unique=True)
    engagement_score = models.FloatField(default=0.5)
    diagnostic_completed = models.BooleanField(default=False)
    has_taken_quiz = models.BooleanField(default=False)
    learning_velocity = models.FloatField(default=0.0)
    mastery_vector = models.JSONField(default=dict, blank=True)
    profileImageUrl = models.FileField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return self.username
