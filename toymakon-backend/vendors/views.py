from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .jwt_serializers import ToymakonTokenObtainPairSerializer
from .models import Category, ContactRequest, Favorite, Review, Vendor
from .serializers import (
    CategorySerializer,
    ContactRequestSerializer,
    FavoriteSerializer,
    RegisterSerializer,
    ReviewCreateSerializer,
    ReviewSerializer,
    VendorDetailSerializer,
    VendorListSerializer,
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response(
            {'id': user.id, 'username': user.username},
            status=status.HTTP_201_CREATED,
        )


class ToymakonTokenView(TokenObtainPairView):
    serializer_class = ToymakonTokenObtainPairSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vendor.objects.select_related('category').prefetch_related(
        'gallery_images', 'specs', 'reviews'
    )
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category_id', 'district']
    search_fields = ['name', 'district', 'location', 'description']
    ordering_fields = ['name', 'rating', 'review_count', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VendorDetailSerializer
        return VendorListSerializer

    @action(detail=True, methods=['get', 'post'], url_path='reviews')
    def reviews(self, request, pk=None):
        vendor = self.get_object()
        if request.method == 'GET':
            qs = vendor.reviews.all()[:100]
            return Response(ReviewSerializer(qs, many=True).data)
        ser = ReviewCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        author = ser.validated_data.get('author_name') or 'Mehmon'
        if request.user.is_authenticated:
            author = ser.validated_data.get('author_name') or request.user.username
        rev = Review.objects.create(
            vendor=vendor,
            user=request.user if request.user.is_authenticated else None,
            author_name=author[:100],
            rating=ser.validated_data['rating'],
            text=ser.validated_data['text'],
        )
        return Response(ReviewSerializer(rev).data, status=status.HTTP_201_CREATED)


class FavoriteViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('vendor', 'vendor__category')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ContactRequestViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = ContactRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContactRequest.objects.filter(user=self.request.user).select_related('vendor')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
