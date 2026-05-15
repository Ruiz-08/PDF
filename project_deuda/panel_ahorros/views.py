from django.shortcuts import render
from .models import Meta, Aporte

def ahorros_view(request):
    return render(request, 'panel_ahorros/ahorros.html')

def aportes_view(request):
    return render(request, 'panel_ahorros/aporte.html')
