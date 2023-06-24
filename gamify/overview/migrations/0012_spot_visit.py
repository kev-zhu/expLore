# Generated by Django 4.2.2 on 2023-06-23 19:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('overview', '0011_rename_zipseach_business_zipsearch'),
    ]

    operations = [
        migrations.CreateModel(
            name='Spot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('displayName', models.CharField()),
                ('lat', models.FloatField(default=None)),
                ('lng', models.FloatField(default=None)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Visit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('visted', models.BooleanField(default=False)),
                ('spot', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='overview.spot')),
            ],
        ),
    ]
