# Generated by Django 4.2.2 on 2023-07-17 22:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('request', '0006_reportedbusiness_report_message_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportedbusiness',
            name='report_message',
            field=models.TextField(blank=True, default=''),
        ),
    ]
