from django.conf import settings
from django.db import models
from django.db.models import Avg, Count
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver


class Category(models.Model):
    id = models.CharField(max_length=32, primary_key=True)
    slug = models.SlugField(max_length=64, unique=True)
    title = models.CharField(max_length=200)
    short_label = models.CharField(max_length=64)
    subtitle = models.TextField(blank=True)
    icon = models.CharField(max_length=64, blank=True)
    search_hint = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=True)

    class Meta:
        ordering = ['slug']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.title


class Vendor(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='vendors')
    slug = models.SlugField(max_length=128, unique=True)
    name = models.CharField(max_length=200)
    district = models.CharField(max_length=100)
    location = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    tagline = models.CharField(max_length=300, blank=True)
    price_label = models.CharField(max_length=64)
    price_note = models.CharField(max_length=64, blank=True)
    badge = models.CharField(max_length=64, blank=True, null=True)
    footer_line = models.CharField(max_length=100, blank=True)
    footer_icon = models.CharField(max_length=64, blank=True)
    phone = models.CharField(max_length=32)
    telegram = models.CharField(max_length=64, blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    review_count = models.PositiveIntegerField(default=0)
    main_image = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class VendorImage(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='gallery_images')
    url = models.URLField(max_length=500)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']


class VendorSpec(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='specs')
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=300)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']


class Review(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    author_name = models.CharField(max_length=100, default='Mehmon')
    rating = models.PositiveSmallIntegerField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.vendor_id} · {self.rating}'


def _refresh_vendor_rating(vendor_id):
    try:
        vendor = Vendor.objects.get(pk=vendor_id)
    except Vendor.DoesNotExist:
        return
    agg = Review.objects.filter(vendor_id=vendor_id).aggregate(avg=Avg('rating'), c=Count('id'))
    avg = agg['avg']
    c = agg['c'] or 0
    if avg is None:
        vendor.rating = 4.5
    else:
        vendor.rating = round(float(avg), 1)
    vendor.review_count = c
    vendor.save()


@receiver(post_save, sender=Review)
def review_saved(sender, instance, **kwargs):
    _refresh_vendor_rating(instance.vendor_id)


@receiver(post_delete, sender=Review)
def review_deleted(sender, instance, **kwargs):
    _refresh_vendor_rating(instance.vendor_id)


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'vendor'], name='uniq_user_vendor_favorite'),
        ]
        ordering = ['-created_at']


class ContactRequest(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='contact_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
