from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ContactRequestViewSet, FavoriteViewSet, VendorViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('vendors', VendorViewSet)
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('contact-requests', ContactRequestViewSet, basename='contactrequest')

urlpatterns = router.urls
