from django.urls import path
from . import views

app_name = 'panel_ingresos'

urlpatterns = [
    path('', views.ingresos_view, name='index'),
]
