from django.contrib import admin
from .models import AddBusiness, DeleteBusiness

# Register your models here.

admin.site.register(AddBusiness)
admin.site.register(DeleteBusiness)