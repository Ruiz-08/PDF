"""
URL configuration for project_deuda project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('deuda/', include('panel_deuda.urls')),
    path('reportes/', include('reporte.urls')),
    path('egresos/', include('panel_egresos.urls')),
    path('ingresos/', include('panel_ingresos.urls')),
    path('ahorros/', include('panel_ahorros.urls')),
]
