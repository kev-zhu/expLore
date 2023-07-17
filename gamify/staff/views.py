from django.shortcuts import render
from request.models import AddedBusiness, ReportedBusiness
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse

import json
# Create your views here.


@staff_member_required(login_url='/')
def staff_panel(request):
    return render(request, 'staff/staff_panel.html')

@staff_member_required
def request_log(request):
    businessRequests = AddedBusiness.objects.all()
    reportRequests = ReportedBusiness.objects.all()

    context = {
        "requests": businessRequests,
        "reports": reportRequests
    }
    return render(request, 'staff/requests.html', context)

@staff_member_required
def approve_request(request):
    if request.method == "POST":
        data = json.loads(request.body)

        #change the status of the business to approve/reject
        try:
            businessRequest = AddedBusiness.objects.get(pk=data['id'])
        except:
            return JsonResponse({'error': 'Request not in DB.'})

        business = businessRequest.business
        business.approved = True
        business.save()

        #remove the business from the addBusiness model
        businessRequest.delete()

        return JsonResponse({'success': 'Request has been approved. This business has been added to the DB.'})
    return JsonResponse({'error': 'Must be a post request.'})

@staff_member_required
def reject_request(request):
    if request.method == "POST":
        data = json.loads(request.body)

        try:
            businessRequest = AddedBusiness.objects.get(pk=data['id'])
        except:
            return JsonResponse({'error': 'Request not in DB.'})

        #remove the business from business model
        #remove business from addBusiness model -- might not need to do this becase onCascade delete -- removal of business will auto delete the addBusiness model
        businessRequest.business.delete()

        return JsonResponse({'success': 'Request has been rejected. This business has not been added to the DB.'})
    return JsonResponse({'error': 'Must be a post request.'})


@staff_member_required
def approve_report(request):
    if request.method == "POST":
        data = json.loads(request.body)

        try:
            businessReport = ReportedBusiness.objects.get(pk=data['id'])
        except:
            return JsonResponse({'error': 'Report not in DB.'})
        
        #deletes business + businessReport (onCascade)
        businessReport.business.delete()
        return JsonResponse({'success': 'Report has been approved. This business has been removed from the DB.'})
    return JsonResponse({'error': 'Must be a post request.'})

@staff_member_required
def reject_report(request):
    if request.method == "POST":
        data = json.loads(request.body)

        try:
            businessReport = ReportedBusiness.objects.get(pk=data['id'])
        except:
            return JsonResponse({'error': 'Report not in DB.'})
        
        #if report rejected -- only delete the report obj
        businessReport.delete()
        return JsonResponse({'success': 'Report has been rejected. The business remains in the DB.'})
    return JsonResponse({'error': 'Must be a post request.'})