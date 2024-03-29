from django.shortcuts import render, redirect
from .models import AddedBusiness, ReportedBusiness
from overview.models import Business
from django.contrib.auth.models import User
from django.http import JsonResponse

import os
import requests
import json

yelp_api = os.environ.get('YELP_API_KEY')

def request_spot(request):
    def isNumeric(s):
        try:
            float(s)
            return True
        except:
            return False

    if request.method == 'GET':
        #ensure that lng and lat are in URL query
        if 'lng' not in request.GET or 'lat' not in request.GET:
            return redirect('overview')

        lng = request.GET['lng']
        lat = request.GET['lat']

        #ensure lng/lat are numbers
        if not isNumeric(lng) or not isNumeric(lat):
            return redirect('overview')
        else:
            lng = float(lng)
            lat = float(lat)

        #validate lng/lat
        if not -180 < lng < 180 or not -90 < lat < 90:
            return redirect('overview')
        
        return render(request, 'request/add-spot.html')


    if (request.method == 'POST'):
        return redirect('overview')


def yelpFill(request, lng, lat):
    url = f'https://api.yelp.com/v3/businesses/search?latitude={lat}&longitude={lng}&sort_by=best_match&limit=1'
    headers = {
        'Authorization': f'Bearer {yelp_api}'
    }

    r = requests.get(url, headers=headers)
    try:
        queryBusiness = r.json()['businesses'][0]
    except:
        return JsonResponse({'error': 'Business cannot be found on YELP Fusion API'})
    return JsonResponse({'businessData': queryBusiness})


def send_request(request):
    def phoneNum(unformatPhone):
        phoneNumber = ''
        for n in unformatPhone:
            if n.isnumeric():
                phoneNumber += n
        return phoneNumber

    if request.method == 'POST':
        data = json.loads(request.body)

        headers = {
            'Authorization': f'Bearer {yelp_api}'
        }

        url = f"https://api.yelp.com/v3/businesses/matches?name={data['name']}&address1={data['address']}&city={data['city']}&state={data['state']}&country={data['country']}&postal_code={data['zip']}&latitude={data['lat']}&longitude={data['lng']}&phone={phoneNum(data['phone'])}&limit=1&match_threshold=default"
        #yelp match does not give all info for the business in search -- work around get the ID and call business detail API after
        r = requests.get(url, headers=headers)
        #should return one business (or none) 
        try:
            businessID = r.json()['businesses'][0]['id'] or None
        except:
            return JsonResponse({'error': 'Business cannot be found in the YELP Fusion DB.'})

        #business detail API after business ID found
        if businessID:
            url = f"https://api.yelp.com/v3/businesses/{businessID}"
            r = requests.get(url, headers=headers)
            business = r.json()
        else:
            return JsonResponse({'error': 'Cannot find business in the YELP Fusion DB'})

        sourcedBy = User.objects.get(pk=data['userId']).username

        #if business already exists -- by yelpID
        if Business.objects.filter(yelpID=businessID).count() != 0:
            return JsonResponse({'error': 'Business already exists.'})

        #prevent duplicate requests
        if AddedBusiness.objects.filter(yelpID=businessID).count() == 0:
            businessRequest = Business.objects.create(
                type=data['category'], 
                area=data['area'], 
                zipSearch=business['location']['zip_code'], 
                approved=False,

                sourced_by=sourcedBy, 
                lat=business['coordinates']['latitude'], 
                lng=business['coordinates']['longitude'], 
                phone=business['display_phone'],
                img_url = business['image_url'],
                address = f"{', '.join(business['location']['display_address'])}",
                name = business['name'],
                rating = business['rating'],
                reviewCount = business['review_count'],
                yelpID = businessID,
                yelpLink = business['url'])

            AddedBusiness.objects.create(
                requestType='add', 
                yelpID = businessID,
                business = businessRequest)


        return JsonResponse({'success': 'Request has been sent to admin for approval'}, status=200)


def report_request(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        #error when business ID cannot be found in DB
        try:
            reportBusiness = Business.objects.get(pk=data['businessID'])
        except:
            return JsonResponse({'error': 'Business cannot be found in DB and therefore cannot be reported.'})

        ReportedBusiness.objects.create(requestType='report', business=reportBusiness, reported_by=request.user.username, report_message=data['reason'])
        return JsonResponse({'success': 'Business has been reported. Please wait for staff to investigate the report.'})

    return JsonResponse({'error': 'Reports have to be made as a POST request.'})