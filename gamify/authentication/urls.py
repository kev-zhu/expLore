from . import views
from django.urls import path
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('register', views.register, name='register'),
    path('validate-username', csrf_exempt(views.usernameValidation), name='validate-username'),
    path('validate-email', csrf_exempt(views.emailValidation), name='validate-email'),
    path('validate-password', csrf_exempt(views.passwordValidation), name='validate-password'),
    path('validate-confirm', csrf_exempt(views.confirmValidation), name='validate-confirm'),
    path('activate/<uidb64>/<token>', views.activateAccount, name='activate'),
    path('reset-password', views.requestPasswordResetEmail, name='reset-password'),
    path('reset-user-password/<uidb64>/<token>', views.resetUserPassword, name='reset-user-password')
]
