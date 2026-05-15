from django.urls import path
from . import views

app_name = 'panel_egresos'

urlpatterns = [
    path('', views.egresos_view, name='index'),
]
