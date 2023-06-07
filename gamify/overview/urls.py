from . import views
from django.urls import path

urlpatterns = [
    path('', views.index, name='overview'),
    path('get-poi', views.get_poi, name='get-poi')
]
