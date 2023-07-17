# Generated by Django 4.2.2 on 2023-07-17 17:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('overview', '0018_business_approved'),
        ('request', '0004_addedbusiness_yelpid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='addedbusiness',
            name='address',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='area',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='img_url',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='lat',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='lng',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='name',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='phone',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='rating',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='reviewCount',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='sourced_by',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='type',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='yelpLink',
        ),
        migrations.RemoveField(
            model_name='addedbusiness',
            name='zipSearch',
        ),
        migrations.AddField(
            model_name='addedbusiness',
            name='business',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='overview.business'),
        ),
        migrations.AlterField(
            model_name='reportedbusiness',
            name='business',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='overview.business'),
        ),
    ]
