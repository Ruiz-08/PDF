from django.urls import path
from . import views

app_name = 'panel_ahorros'

urlpatterns = [
    path('', views.ahorros_view, name='index'),
    path('aportes/', views.aportes_view, name='aportes'),
]
