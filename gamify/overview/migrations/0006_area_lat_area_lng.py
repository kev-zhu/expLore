# Generated by Django 4.2.2 on 2023-06-10 18:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('overview', '0005_rename_savedby_area_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='area',
            name='lat',
            field=models.FloatField(default=None),
        ),
        migrations.AddField(
            model_name='area',
            name='lng',
            field=models.FloatField(default=None),
        ),
    ]
