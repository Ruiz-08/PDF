from django.urls import path
from . import views

app_name = 'panel_deuda'

urlpatterns = [
    path('', views.index, name='index'),
]
