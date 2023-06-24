from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Business(models.Model):
    #filter by
    type = models.CharField()
    area = models.CharField()
    zipSearch = models.CharField(default=None, null=False, blank=False)

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
        return f'{self.zipSearch}: {self.type}: {self.area} - {self.name}'

    class Meta:
        ordering = ["zipSearch"]

        

class Area(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, null=False)
    displayName = models.CharField()
    referredName = models.CharField()
    areaCode = models.CharField(default=None, null=False, blank=False)
    lat = models.FloatField(default=None, null=False, blank=False)
    lng = models.FloatField(default=None, null=False, blank=False)
    
    def __str__(self):
        return f'{self.user.username}: {self.displayName}'



class Spot(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, null=False)
    business = models.ForeignKey(to=Business, on_delete=models.CASCADE, default=None, null=False, blank=False)
    displayName = models.CharField()
    areaOrigin = models.CharField(default=None, null=False, blank=False)
    lat = models.FloatField(default=None, null=False, blank=False)
    lng = models.FloatField(default=None, null=False, blank=False)
    address = models.CharField(default=None, null=False, blank=False)

    def __str__(self):
        return f'{self.user.username}: {self.displayName}'


class Visit(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, default=None, null=False, blank=False)
    business = models.ForeignKey(to=Business, on_delete=models.CASCADE, default=None, null=False, blank=False)

    def __str__(self):
        return f'{self.user.username}: {self.business.displayName}'