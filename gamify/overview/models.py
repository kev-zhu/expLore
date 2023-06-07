from django.db import models

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

    def serialize(self):
        return 