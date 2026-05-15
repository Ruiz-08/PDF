import os
from django.conf import settings
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML, CSS

def generar_pdf(solicitud, ruta_plantilla, diccionario_contexto, nombre_archivo="documento.pdf"):
    """
    Genera un PDF a partir de una plantilla HTML usando el objeto request para resolver rutas.
    """
    # Renderizar el HTML con el contexto
    cadena_html = render_to_string(ruta_plantilla, diccionario_contexto, request=solicitud)
    
    # Crear el objeto HTML de WeasyPrint usando la URI absoluta de la solicitud como base_url
    # Esto permite que {% static %} se resuelva a URLs completas que WeasyPrint puede descargar
    html = HTML(string=cadena_html, base_url=solicitud.build_absolute_uri())
    
    # Generar el PDF
    resultado = html.write_pdf()
    
    # Crear la respuesta HTTP
    respuesta = HttpResponse(resultado, content_type='application/pdf')
    respuesta['Content-Disposition'] = f'attachment; filename="{nombre_archivo}"'
    
    return respuesta
