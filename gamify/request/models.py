from django.db import models
from overview.models import Business
# Create your models here.

#request add Business
class AddedBusiness(models.Model):
    requestType = models.CharField()
    yelpID = models.CharField(default=None, null=False, blank=False)
    
    business = models.ForeignKey(to=Business, on_delete=models.CASCADE, default=None, blank=False, null=False)

    def __str__(self):
        return f'{self.requestType.capitalize()} -- {self.business.zipSearch}: {self.business.type}: {self.business.area} - {self.business.name}'

    class Meta:
        verbose_name_plural = "Added Businesses"

#request delete business
class ReportedBusiness(models.Model):
    requestType = models.CharField(default=None, null=False, blank=False)
    reported_by = models.CharField(default=None, null=False, blank=False)
    report_message = models.TextField(default=None, null=False, blank=False)

    business = models.ForeignKey(to=Business, on_delete=models.CASCADE, default=None, blank=False, null=False)

    def __str__(self):
        return f'{self.requestType.capitalize()} -- {self.business.zipSearch}: {self.business.type}: {self.business.area} - {self.business.name}'

    class Meta:
        verbose_name_plural = "Reported Businesses"