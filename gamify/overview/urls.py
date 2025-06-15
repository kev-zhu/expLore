from . import views
from django.urls import path
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('', views.index, name='overview'),
    path('get-poi', views.get_poi, name='get-poi'),
    path('save-area', csrf_exempt(views.save_area), name='save-area'),
    path('get-savedArea/<str:area>/<str:zip>', views.get_savedArea, name='get-area'),
    path('del-area', csrf_exempt(views.del_area), name='del-area'),
    path('save-spot', csrf_exempt(views.save_spot), name='save-spot'),
    path('get-savedSpot/<int:id>', views.get_savedSpot, name='get-spot'),
    path('del-spot', csrf_exempt(views.del_spot), name='del-spot'),
    path('get-all-saved', views.get_all_saved, name='get-all-saved'),
    path('get-business-visit/<int:id>', views.get_business_visit, name='get-business-visit'),
    path('save-visit', csrf_exempt(views.save_visit), name='save-visit'),
    path('del-visit', csrf_exempt(views.del_visit), name='del-visit'),
    path('get-all-visit', csrf_exempt(views.get_all_visit), name='get-all-visit'),
    path('get-all-city-spots', csrf_exempt(views.get_all_spots), name='get-all-spots')
]
