from django.shortcuts import render
from .models import Ingreso

def ingresos_view(request):
    return render(request, 'panel_ingresos/ingresos.html')
