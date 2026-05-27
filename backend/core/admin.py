from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'level', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('level', 'original_uuid', 'engagement_score', 'diagnostic_completed', 'has_taken_quiz', 'learning_velocity', 'mastery_vector', 'profileImageUrl')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('level',)}),
    )
    search_fields = ('username', 'email')
    ordering = ('username',)
