# Generated by Django 4.2.2 on 2023-06-06 21:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('overview', '0002_remove_business_distance'),
    ]

    operations = [
        migrations.RenameField(
            model_name='business',
            old_name='lon',
            new_name='lng',
        ),
    ]