from django.shortcuts import render
from .models import Egreso

def egresos_view(request):
    return render(request, 'panel_egresos/egresos.html')
