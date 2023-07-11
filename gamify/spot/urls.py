from django.urls import path
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('request-spot', views.request_spot, name='request-spot'),
    path('yelp-fill/<str:lng>/<str:lat>', views.yelpFill, name='yelp-fill'),
    path('send-request', csrf_exempt(views.send_request), name='send-request'),
]
