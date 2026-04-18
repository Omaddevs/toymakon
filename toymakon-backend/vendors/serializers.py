import re
from urllib.parse import quote

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Category, ContactRequest, Favorite, Review, Vendor, VendorImage, VendorSpec


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            'id',
            'slug',
            'title',
            'short_label',
            'subtitle',
            'icon',
            'search_hint',
            'is_primary',
        )


class VendorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorImage
        fields = ('id', 'url', 'sort_order')


class VendorSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorSpec
        fields = ('id', 'label', 'value', 'sort_order')


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('id', 'author_name', 'rating', 'text', 'created_at')
        read_only_fields = ('id', 'created_at')


class VendorListSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Vendor
        fields = (
            'id',
            'slug',
            'name',
            'district',
            'category_id',
            'category_slug',
            'price_label',
            'price_note',
            'badge',
            'footer_line',
            'footer_icon',
            'main_image',
            'rating',
            'review_count',
        )


class VendorDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    specs = VendorSpecSerializer(many=True, read_only=True)
    gallery_images = VendorImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    maps_url = serializers.SerializerMethodField()
    all_images = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = (
            'id',
            'slug',
            'category',
            'name',
            'district',
            'location',
            'description',
            'tagline',
            'price_label',
            'price_note',
            'badge',
            'footer_line',
            'footer_icon',
            'phone',
            'telegram',
            'rating',
            'review_count',
            'main_image',
            'gallery_images',
            'specs',
            'reviews',
            'maps_url',
            'all_images',
            'created_at',
            'updated_at',
        )

    def get_maps_url(self, obj):
        loc = obj.location or obj.district
        q = quote(f'{obj.name}, {loc}, Toshkent')
        return f'https://www.google.com/maps/search/?api=1&query={q}'

    def get_all_images(self, obj):
        urls = [obj.main_image]
        for g in obj.gallery_images.all():
            if g.url not in urls:
                urls.append(g.url)
        return urls


class ReviewCreateSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(max_length=100, required=False, default='Mehmon')

    class Meta:
        model = Review
        fields = ('author_name', 'rating', 'text')

    def validate_rating(self, v):
        if v < 1 or v > 5:
            raise serializers.ValidationError('Reyting 1–5 orasida bo‘lishi kerak.')
        return v


class FavoriteSerializer(serializers.ModelSerializer):
    vendor = VendorListSerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(), source='vendor', write_only=True
    )

    class Meta:
        model = Favorite
        fields = ('id', 'vendor', 'vendor_id', 'created_at')
        read_only_fields = ('id', 'vendor', 'created_at')


class ContactRequestSerializer(serializers.ModelSerializer):
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(), source='vendor', write_only=True
    )

    class Meta:
        model = ContactRequest
        fields = ('id', 'vendor_id', 'name', 'phone', 'message', 'created_at')
        read_only_fields = ('id', 'created_at')


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=24)
    password = serializers.CharField(write_only=True, min_length=6, max_length=128)
    password_confirm = serializers.CharField(write_only=True, min_length=6, max_length=128)

    def validate_username(self, value):
        u = value.strip().lower()
        if not re.match(r'^[a-z0-9._-]{3,24}$', u):
            raise serializers.ValidationError('3–24 belgi: lotin harflari, raqam, . _ -')
        if User.objects.filter(username__iexact=u).exists():
            raise serializers.ValidationError('Bu foydalanuvchi nomi band.')
        return u

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Parollar mos kelmayapti.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )
