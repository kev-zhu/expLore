from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Business(models.Model):
    #filter by
    type = models.CharField()
    area = models.CharField()

    #important info of business
    lat = models.FloatField()
    lng = models.FloatField()
    phone = models.CharField()
    img_url = models.CharField()
    address = models.CharField()
    name = models.CharField()
    rating = models.FloatField()
    reviewCount = models.IntegerField()
    yelpLink = models.CharField()

    def __str__(self):
        return f'{self.type}: {self.area} - {self.name}'
        

class Area(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, null=False)
    displayName = models.CharField()
    referredName = models.CharField()
    lat = models.FloatField(default=None, null=False, blank=False)
    lng = models.FloatField(default=None, null=False, blank=False)
    
    def __str__(self):
        return f'{self.user.username}: {self.displayName}'