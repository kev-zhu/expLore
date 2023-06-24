from django.shortcuts import render
from django.contrib.auth.decorators import login_required

import os
import requests
from .models import Business, Area, Spot, Visit
from django.forms.models import model_to_dict
from django.http import JsonResponse
import json

# Create your views here.

@login_required(login_url='/authentication/login')
def index(request):
    return render(request, 'overview/index.html')

#something to ensure get requests

# something to prevent multiple calls from POSTMan? maybe? -- 
# could lead to overflow of server with many yelp calls on 'similar' term calls via postman or something else
@login_required(login_url='/authentication/login')
def get_poi(request):
    if request.method == 'GET':
        businesses = []
        if request.GET['type'] == '':
            return JsonResponse({'businesses': businesses})

        lat = request.GET['lat']
        lng = request.GET['lng']
        area = request.GET['area']
        zip = request.GET['zip']
        types=request.GET['type'].split(' ')


        for businessType in types:
            if Business.objects.filter(area=area, zipSearch=zip, type=businessType).count() == 0:
                get_yelp_top_10(lat, lng, businessType, area, zip)
            for business in Business.objects.filter(area=area, zipSearch=zip, type=businessType):
                businesses.append(model_to_dict(business))

    return JsonResponse({'businesses': businesses})


def get_yelp_top_10(lat, lng, type, area, zip):
    #may need a new api or something? note - does not work on international area?
    #this would return an error or an empty json file
    #look into google's api? more locations + international spots -- yelp limited 
    yelp_api = os.environ.get('YELP_API_KEY')
    url = f'https://api.yelp.com/v3/businesses/search?location={zip}&latitude={lat}&longitude={lng}&term={type}&radius=5000&categories=&sort_by=best_match&limit=10'
    headers = {
        'Authorization': f'Bearer {yelp_api}'
    }

    r = requests.get(url, headers=headers)
    businesses = r.json()['businesses']

    for business in businesses:
        Business.objects.create(
            type = type,
            area = area,
            zipSearch = zip,

            lat = business['coordinates']['latitude'],
            lng = business['coordinates']['longitude'],
            phone = business['display_phone'],
            img_url = business['image_url'],
            address = f"{', '.join(business['location']['display_address'])}",
            name = business['name'],
            rating = business['rating'],
            reviewCount = business['review_count'],
            yelpLink = business['url']
        )


@login_required
def save_area(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if (Area.objects.filter(user=request.user, referredName=data['refName'], areaCode=data['zipCode']).count() == 0):
            Area.objects.create(user=request.user, displayName=data['display'] or data['refName'], referredName=data['refName'], lat=data['lat'], lng=data['lng'], areaCode=data['zipCode'])
        return JsonResponse({'success': 'Area has been added to DB'})
    return JsonResponse({'error': 'Request must be post'})


@login_required
def get_savedArea(request, area, zip):
    try: 
        savedArea = Area.objects.get(user=request.user, referredName=area, areaCode=zip)
        return JsonResponse({'displayName': savedArea.displayName})
    except:
        return JsonResponse({'displayName': ''})


@login_required
def del_area(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            Area.objects.get(user=request.user, referredName=data['refName'], areaCode=data['zipCode']).delete()
            return JsonResponse({'success': 'Area has been deleted from DB'})
        except:
            return JsonResponse({'error': 'Area not in DB'})
    return JsonResponse({'error': 'Request must be post'})



@login_required
def save_spot(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if (Spot.objects.filter(user=request.user, displayName=data['display']).count() == 0):
            businessTarget = Business.objects.get(address=data['address'])
            Spot.objects.create(user=request.user, displayName=data['display'], lat=data['lat'], lng=data['lng'], address=data['address'], areaOrigin=data['areaOrigin'], business=businessTarget)
        return JsonResponse({'success': 'Spot has been added to DB'})
    return JsonResponse({'error': 'Request must be post'})


@login_required
def get_savedSpot(request, address):
    try:
        savedSpot = Spot.objects.get(user=request.user, address=address)
        return JsonResponse({'saved': True})
    except:
        return JsonResponse({'saved': False})


@login_required
def del_spot(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            Spot.objects.get(user=request.user, address=data['address']).delete()
            return JsonResponse({'success': 'Spot has been removed from DB'})
        except:
            return JsonResponse({'error': 'Spot not in DB'})
    return JsonResponse({'error': 'Request must be post'})


#include spots later on
@login_required
def get_all_saved(request):
    all_area = Area.objects.filter(user=request.user)
    areas = sorted(list(map(model_to_dict, all_area)), key=lambda x: x['displayName'])

    all_spots = Spot.objects.filter(user=request.user)
    list_spots = (list(map(model_to_dict, all_spots)))

    for s in range(len(list_spots)):
        targetBusiness = Business.objects.get(pk=list_spots[s]['business'])
        list_spots[s]['business'] = model_to_dict(targetBusiness)

    spots = sorted(list_spots, key=lambda x: x['displayName'])
    
    return JsonResponse({'areas': areas, 'spots': spots})