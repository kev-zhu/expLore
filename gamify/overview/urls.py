from . import views
from django.urls import path
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('', views.index, name='overview'),
    path('get-poi', views.get_poi, name='get-poi'),
    path('save-area', csrf_exempt(views.save_area), name='save-area'),
    path('get-savedArea/<str:area>/<str:zip>', views.get_savedArea, name='get-area'),
    path('del-area', csrf_exempt(views.del_area), name='del-area'),
    path('get-all-saved', csrf_exempt(views.get_all_saved), name='get-all-saved'),

]
