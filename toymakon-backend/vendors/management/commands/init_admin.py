from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = 'Admin panel: toymakon / toymakon8 superuser (agar yo‘q bo‘lsa yaratadi).'

    def handle(self, *args, **options):
        if User.objects.filter(username='toymakon').exists():
            self.stdout.write(self.style.WARNING('Superuser "toymakon" allaqachon mavjud.'))
            return
        User.objects.create_superuser('toymakon', 'admin@toymakon.local', 'toymakon8')
        self.stdout.write(self.style.SUCCESS('Superuser yaratildi: login=toymakon, parol=toymakon8'))
