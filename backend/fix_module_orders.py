import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'python_edition_django.settings')
os.environ['DATABASE_URL'] = 'postgresql://postgres.inkhqgrbjwkwuwetnpjr:Python_Edition28@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'

django.setup()

from core.models import Module

modules = list(Module.objects.all().order_by('order'))
for i, m in enumerate(modules):
    m.order = i
    m.save()
    print(f'Updated {m.id} to order {i}')
print('Done')
