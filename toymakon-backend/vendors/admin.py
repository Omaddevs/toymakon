from django.contrib import admin

from .models import Category, ContactRequest, Favorite, Review, Vendor, VendorImage, VendorSpec


class VendorImageInline(admin.TabularInline):
    model = VendorImage
    extra = 0


class VendorSpecInline(admin.TabularInline):
    model = VendorSpec
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'slug', 'title', 'short_label', 'is_primary')
    search_fields = ('title', 'slug', 'id')


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'district', 'rating', 'review_count')
    list_filter = ('category', 'district')
    search_fields = ('name', 'id', 'slug', 'district')
    inlines = [VendorSpecInline, VendorImageInline]
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor', 'author_name', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('text', 'author_name', 'vendor__name')


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'vendor', 'created_at')
    list_filter = ('created_at',)


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor', 'name', 'phone', 'created_at')
    search_fields = ('message', 'name', 'phone')
