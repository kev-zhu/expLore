from django.db import models

# Create your models here.

#request add Business
class AddBusiness(models.Model):
    requestType = models.CharField()
    
    type = models.CharField()
    area = models.CharField()
    zipSearch = models.CharField(default=None, null=False, blank=False)

    #important info of business
    sourced_by= models.CharField(default=None, null=False, blank=False)
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
        return f'{self.requestType.capitalize()} -- {self.zipSearch}: {self.type}: {self.area} - {self.name}'


#request delete business