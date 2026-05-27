from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, LogoutView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user/', UserProfileView.as_view(), name='user_profile'),
    path('auth/user/update/', UserProfileView.as_view(), name='user_profile_update'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
