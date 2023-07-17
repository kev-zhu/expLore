from django.contrib import admin
from .models import AddedBusiness, ReportedBusiness

# Register your models here.

admin.site.register(AddedBusiness)
admin.site.register(ReportedBusiness)