from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UserProfileView, ClientViewSet, TemplateViewSet, QuotationViewSet, CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'quotations', QuotationViewSet, basename='quotation')

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    
    # API endpoints
    path('', include(router.urls)),
]
