from django.shortcuts import render
from django.contrib.auth.decorators import login_required

import os
import requests
from .models import Business, Area
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
        types=request.GET['type'].split(' ')


        for businessType in types:
            if Business.objects.filter(area=area, type=businessType).count() == 0:
                get_yelp_top_10(lat, lng, businessType, area)
            for business in Business.objects.filter(area=area, type=businessType):
                businesses.append(model_to_dict(business))

    return JsonResponse({'businesses': businesses})


def get_yelp_top_10(lat, lng, type, area):
    #may need a new api or something? note - does not work on international area?
    #this would return an error or an empty json file
    #look into google's api? more locations + international spots -- yelp limited 
    yelp_api = os.environ.get('YELP_API_KEY')
    url = f'https://api.yelp.com/v3/businesses/search?latitude={lat}&longitude={lng}&term={type}&radius=5000&categories=&sort_by=best_match&limit=10'
    headers = {
        'Authorization': f'Bearer {yelp_api}'
    }

    r = requests.get(url, headers=headers)
    businesses = r.json()['businesses']

    for business in businesses:
        Business.objects.create(
            type = type,
            area = area,

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
        if (Area.objects.filter(user=request.user, referredName=data['refName']).count() == 0):
            Area.objects.create(user=request.user, displayName=data['display'] or data['refName'], referredName=data['refName'], lat=data['lat'], lng=data['lng'])
        return JsonResponse({'success': 'Area has been added to DB'})
    return JsonResponse({'error': 'Request must be post'})


@login_required
def get_savedArea(request, area):
    try: 
        savedArea = Area.objects.get(user=request.user, referredName=area)
        return JsonResponse({'displayName': savedArea.displayName})
    except:
        return JsonResponse({'displayName': ''})


@login_required
def del_area(request):
    data = json.loads(request.body)
    try:
        Area.objects.get(user=request.user, referredName=data['refName']).delete()
        return JsonResponse({'success': 'Area has been deleted from DB'})
    except:
        return JsonResponse({'error': 'Area not in DB'})


#include spots later on
@login_required
def get_all_saved(request):
    all_area = Area.objects.filter(user=request.user)
    areas = list(map(model_to_dict, all_area))
    spots = ''
    return JsonResponse({'areas': areas, 'spots': ''})