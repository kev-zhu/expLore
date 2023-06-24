from django.contrib import admin
from .models import Business, Area, Spot, Visit

# Register your models here.

admin.site.register(Business)
admin.site.register(Area)
admin.site.register(Spot)
admin.site.register(Visit)