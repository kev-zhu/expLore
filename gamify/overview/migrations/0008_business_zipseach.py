# Generated by Django 4.2.2 on 2023-06-11 02:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('overview', '0007_area_areacode'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='zipSeach',
            field=models.CharField(default=None),
        ),
    ]
