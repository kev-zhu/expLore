# Generated by Django 4.2.2 on 2023-06-23 21:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('overview', '0014_remove_visit_spot_remove_visit_visted_visit_business_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='spot',
            name='areaOrigin',
            field=models.CharField(default=None),
        ),
    ]
