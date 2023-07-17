from django.urls import path
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('', views.staff_panel, name='staff-panel'),
    path('request-log', views.request_log, name='request-log'),
    path('approve-request', csrf_exempt(views.approve_request), name='approve-request'),
    path('reject-request', csrf_exempt(views.reject_request), name='reject-request'),
    path('approve-report', csrf_exempt(views.approve_report), name='approve-report'),
    path('reject-report', csrf_exempt(views.reject_report), name='reject-report'),
]
