# Generated by Django 4.2.2 on 2023-07-17 17:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('overview', '0017_alter_business_options_business_sourced_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='approved',
            field=models.BooleanField(default=False),
        ),
    ]