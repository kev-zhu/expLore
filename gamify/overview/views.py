from django.shortcuts import render
from django.contrib.auth.decorators import login_required

import os
import requests
from .models import Business
from django.forms.models import model_to_dict
from django.http import JsonResponse

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
        lat = request.GET['lat']
        lng = request.GET['lng']
        area = request.GET['area']
        types=request.GET['type'].split(' ')

        businesses = []

        for bType in types:
            if Business.objects.filter(area=area, type=bType).count() < 10:
                get_yelp_top_10(lat, lng, bType, area)
            for business in Business.objects.filter(area=area, type=bType):
                businesses.append(model_to_dict(business))

    return JsonResponse({'businesses': businesses})


def get_yelp_top_10(lat, lng, type, area):
    #may need a new api or something? note - does not work on international area?
    #this would return an error or an empty json file
    #look into google's api?
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