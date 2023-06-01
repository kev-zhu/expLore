from django.shortcuts import render, redirect
from django.contrib import messages, auth
from django.contrib.auth.models import User
import json
from django.http import JsonResponse
from validate_email import validate_email

from django.core.mail import EmailMessage
from django.urls import reverse
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.sites.shortcuts import get_current_site
from .utils import token_generator
from django.contrib.auth.tokens import PasswordResetTokenGenerator
import threading

# Create your views here.

class EmailThread(threading.Thread):
    def __init__(self, email):
        self.email = email
        threading.Thread.__init__(self)

    def run(self):
        self.email.send(fail_silently=False)


def login(request):
    if request.method == 'GET':
        return render(request, 'authentication/login.html')

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
 
        if username and password:
            user = auth.authenticate(username=username, password=password)

            if user:
                if user.is_active:
                    #login success
                    auth.login(request, user)
                    messages.success(request, f'Welcome {user.username}!')
                    #redirect to main page
                else:
                    #account not activated -- this never runs bc auth.athenticate returns None if account is not active -- resulting in never checking if/else statement if is_active
                    messages.error(request, 'Account is not active, please verify your account first.')
            else:
                #invalid account information 
                messages.error(request, 'Invalid credentials. Please make sure your inputs are correct.')
        else:
            #blank username or password
            messages.error(request, 'Please fill your fields.')

        return redirect('login')


def logout(request):
    #if it is a get request, then redirect back to main page
    #main page requires login so if not logged in then redirect to login page
    if request.method == 'POST':
        auth.logout(request)
        messages.success(request, 'You have logged out.')
        return redirect('login')


def register(request):
    if request.method == 'GET':
        return render(request, 'authentication/register.html')
    
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        confirm = request.POST['confirm']

        context = {
            'fieldValues': request.POST
        }

        #addition of second layer of checks incase user manipuates html via inspect elements
        if not User.objects.filter(username=username).exists():
            if not User.objects.filter(email=email).exists():
                if len(password) < 6:
                    messages.error(request, 'Password is too short!')
                    return render(request, 'authentication/register.html', context)
                if password != confirm:
                    messages.error(request, 'Passwords do not match!')
                    return render(request, 'authentication/register.html', context)

                user=User.objects.create_user(username=username, email=email)
                user.set_password(password)
                user.is_active = False
                user.save()

                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                domain = get_current_site(request).domain
                link = reverse('activate', kwargs={'uidb64': uidb64, 'token': token_generator.make_token(user)})
                activate_url = f'http://{domain}{link}'

                email_subject = 'Activate your account'
                email_body = f'Hi {user.username}! \nPlease verify your account with this link:\n{activate_url}' 
                email = EmailMessage(
                    email_subject,
                    email_body,
                    'noreply@semycolon.com',
                    [email],
                )
                EmailThread(email).start()

                messages.success(request, 'Your account has been created. Please check your email within 5-10 minutes to activate your account before logging in.')
                return redirect('login')
            else:
                messages.error(request, 'Email in use! Please use another email.')
                return render(request, 'authentication/register.html', context)
        else:
            messages.error(request, 'Username in use! Please choose another username.')
            return render(request, 'authentication/register.html', context)


def activateAccount(request, uidb64, token):
    if request.method == "GET":
        try:
            id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=id)

            if not token_generator.check_token(user, token):
                return redirect('login'+'message='+'User already activated')
            if user.is_active:
                return redirect('login')

            user.is_active = True
            user.save()
            messages.success(request, 'Account activated successfully')
            return redirect('login')
        except Exception as ex:
            messages.error(request, ex)
        return redirect('login')


def usernameValidation(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data['username']

        if not str(username).isalnum():
            return JsonResponse({'username_error': 'Username should only contain alphabets or numbers'})

        if User.objects.filter(username=username).exists():
            return JsonResponse({'username_error': 'Username already in use'})

        return JsonResponse({'username_valid': True})


def emailValidation(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data['email']

        if not validate_email(email):
            return JsonResponse({'email_error': 'Email is invalid'})
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'email_error': 'Email already in use'})

        return JsonResponse({'email_valid': True})


def passwordValidation(request):
    if request.method == "POST":
        data = json.loads(request.body)
        password = data['password']

        if len(password) < 6:
            return JsonResponse({'password_error': 'Password too short. Need to be 6+ characters.'})

        return JsonResponse({'password_valid': True})


def confirmValidation(request):
    if request.method == "POST":
        data = json.loads(request.body)
        password = data['password']
        confirm = data['confirm']

        if str(password) != str(confirm):
            return JsonResponse({'confirm_error': 'Passwords do not match. Please ensure that they are the same.'})

        return JsonResponse({'confirm_valid': True})


def requestPasswordResetEmail(request):
    if request.method == "GET":
        return render(request, 'authentication/reset-password.html')

    if request.method == "POST":
        email = request.POST['email']

        if not validate_email(email):
            messages.error(request, 'Invalid email. Please enter a valid email.')
            return redirect('reset-password')

        if not User.objects.filter(email=email):
            messages.error(request, 'This email is not registered with our system.')
            return redirect('reset-password')

        try:
            user = User.objects.get(email=email)
        except:
            messages.warning(request, 'Problem retrieving user. Please try again later.')
            return redirect('login')

        if user:
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            domain = get_current_site(request).domain
            link = reverse('reset-user-password', kwargs={'uidb64': uidb64, 'token': PasswordResetTokenGenerator().make_token(user)})
            reset_url = f'http://{domain}{link}'

            email_subject = 'Reset your password'
            email_body = f'Hi {user.username}! \nPlease click on the link to reset your password:\n{reset_url}' 
            email = EmailMessage(
                email_subject,
                email_body,
                'noreply@semycolon.com',
                [email],
            )
            EmailThread(email).start()       

            messages.success(request, 'Password reset link and instructions has been set to your email.')
            return redirect('login')


def resetUserPassword(request, uidb64, token):
    if request.method == 'GET':
        context = {
            'uidb64': uidb64,
            'token': token
        }
        
        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                messages.info(request, 'Link invalid, please request a new password reset link.')
                return render(request, 'authentication/reset-password.html')
        except:
            pass

        return render(request, 'authentication/set-new-password.html', context)
    
    if request.method == 'POST':
        context = {
            'uidb64': uidb64,
            'token': token
        }

        password = request.POST['password']
        confirmation = request.POST['confirm']
        if password != confirmation:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'authentication/set-new-password.html', context)

        if len(password) < 6:
            messages.error(request, 'Passwords is too short.')
            return render(request, 'authentication/set-new-password.html', context)

        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)
            user.set_password(password)
            user.save()

            messages.success(request, 'Password reset successful')
            return redirect('login')
        except:
            messages.info(request, 'Something went wrong, please try again later.')
            return render(request, 'authentication/set-new-password.html', context)