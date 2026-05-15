from django.urls import path
from . import views

app_name = 'reporte'

urlpatterns = [
    path('deudas/pdf/', views.descargar_deudas_pdf, name='descargar_deudas_pdf'),
    path('egresos/pdf/', views.descargar_egresos_pdf, name='descargar_egresos_pdf'),
    path('ingresos/pdf/', views.descargar_ingresos_pdf, name='descargar_ingresos_pdf'),
    path('ahorros/pdf/', views.descargar_ahorros_pdf, name='descargar_ahorros_pdf'),
]
