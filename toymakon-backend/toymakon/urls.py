from django.contrib import admin
from django.urls import include, path

admin.site.site_header = 'Toymakon boshqaruvi'
admin.site.site_title = 'Toymakon'
from rest_framework_simplejwt.views import TokenRefreshView

from vendors.views import RegisterView, ToymakonTokenView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/auth/token/', ToymakonTokenView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('vendors.urls')),
]
