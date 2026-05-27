from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from .models import User

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    firstName = serializers.CharField(source='first_name', required=False, allow_blank=True)
    lastName = serializers.CharField(source='last_name', required=False, allow_blank=True)
    masteryVector = serializers.JSONField(source='mastery_vector', required=False)
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'firstName', 'lastName', 'level', 'masteryVector', 'engagement_score', 'diagnostic_completed', 'has_taken_quiz', 'learning_velocity', 'createdAt', 'is_staff', 'is_superuser')
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False}
        }

    def create(self, validated_data):
        username = validated_data.get('username')
        email = validated_data.get('email')
        
        if not username or (isinstance(username, str) and not username.strip()):
            username = email or f"user_{int(timezone.now().timestamp())}"
            
        user = User(
            username=username,
            email=email or "",
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            level="Beginner",
            diagnostic_completed=False,
            has_taken_quiz=False,
            mastery_vector={}
        )
        try:
            validate_password(validated_data['password'], user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        user.set_password(validated_data['password'])
        user.save()
        return user

    def validate_email(self, value):
        instance = getattr(self, 'instance', None)
        if instance and instance.email == value:
            return value
        qs = User.objects.filter(email=value)
        if instance:
            qs = qs.exclude(id=instance.id)
        if qs.exists():
            raise serializers.ValidationError("This email address is already in use.")
        return value
