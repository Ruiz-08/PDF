from django.shortcuts import render
from django.utils import timezone
from .utils.pdf_generator import generar_pdf
from panel_deuda.models import Deuda, Pago
from panel_egresos.models import Egreso
from panel_ingresos.models import Ingreso
from panel_ahorros.models import Meta, Aporte

def descargar_deudas_pdf(request):
    # Obtener deudas y pagos
    lista_deudas = Deuda.objects.all().order_by('vencimiento')
    lista_pagos = Pago.objects.all().order_by('-fecha_pago')
    
    # Calcular sumas totales
    suma_total = sum(deuda.saldo_actual for deuda in lista_deudas)
    suma_inicial = sum(deuda.saldo_inicial for deuda in lista_deudas)
    total_abonado = sum(pago.monto_pago for pago in lista_pagos)
    
    # Datos para gráficas: Pagos por mes (últimos 6 meses)
    ahora = timezone.now()
    pagos_mensuales = []
    for i in range(5, -1, -1):
        # Calcular mes y año
        mes_offset = ahora.month - i
        ano_offset = ahora.year
        if mes_offset <= 0:
            mes_offset += 12
            ano_offset -= 1
            
        monto_mes = sum(p.monto_pago for p in lista_pagos if p.fecha_pago.month == mes_offset and p.fecha_pago.year == ano_offset)
        
        # Nombre corto del mes
        meses_nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        pagos_mensuales.append({
            'mes': meses_nombres[mes_offset - 1],
            'monto': monto_mes
        })
    
    # Calcular máximo para escala de gráficas
    max_pago_mes = max([p['monto'] for p in pagos_mensuales]) if pagos_mensuales else 0
    if max_pago_mes == 0: max_pago_mes = 1 # Evitar división por cero
    
    # Datos de la empresa
    datos_empresa = {
        'nombre': 'PesatusPesos',
        'email': 'jmjcompanysa3@gmail.com',
        'telefono': '+57 310 520 4819',
        'ubicacion': 'Medellín, Colombia',
        'sitio_web': 'pesatuspesos.com'
    }
    
    contexto = {
        'lista_deudas': lista_deudas,
        'lista_pagos': lista_pagos[:15], # Últimos 15 pagos para no saturar
        'suma_total': suma_total,
        'suma_inicial': suma_inicial,
        'total_abonado': total_abonado,
        'pagos_mensuales': pagos_mensuales,
        'max_pago_mes': max_pago_mes,
        'fecha_actual': ahora,
        'nombre_reporte': 'Reporte Integral de Deuda y Pagos',
        'empresa': datos_empresa,
    }
    
    return generar_pdf(request, 'reportes/deudas_pdf.html', contexto, nombre_archivo="Reporte_Deudas_Oficial.pdf")

def descargar_egresos_pdf(request):
    ahora = timezone.now()
    lista_egresos = Egreso.objects.all().order_by('-fecha')
    
    # Calcular totales
    total_egresos = sum(e.monto for e in lista_egresos)
    egresos_mes_actual = sum(e.monto for e in lista_egresos if e.fecha.month == ahora.month and e.fecha.year == ahora.year)
    
    # Calcular egreso mes anterior
    mes_anterior = ahora.month - 1 if ahora.month > 1 else 12
    ano_anterior = ahora.year if ahora.month > 1 else ahora.year - 1
    egresos_mes_anterior = sum(e.monto for e in lista_egresos if e.fecha.month == mes_anterior and e.fecha.year == ano_anterior)
    
    conteo_egresos = lista_egresos.count()
    
    # Datos para gráficas: Egresos por mes (últimos 6 meses)
    egresos_mensuales = []
    for i in range(5, -1, -1):
        mes_offset = ahora.month - i
        ano_offset = ahora.year
        if mes_offset <= 0:
            mes_offset += 12
            ano_offset -= 1
        monto_mes = sum(e.monto for e in lista_egresos if e.fecha.month == mes_offset and e.fecha.year == ano_offset)
        meses_nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        egresos_mensuales.append({
            'mes': meses_nombres[mes_offset - 1],
            'monto': monto_mes
        })
    
    # Datos específicos para imitar el Dashboard (Mes Pasado vs Actual)
    egresos_mensuales_ultimos_2 = [
        {'label': 'Mes Pasado', 'monto': egresos_mensuales[-2]['monto'] if len(egresos_mensuales) >= 2 else 0},
        {'label': 'Mes Actual', 'monto': egresos_mensuales[-1]['monto']}
    ]
    max_egreso_mes_2 = max([e['monto'] for e in egresos_mensuales_ultimos_2]) if egresos_mensuales_ultimos_2 else 1
    if max_egreso_mes_2 == 0: max_egreso_mes_2 = 1

    # Calcular máximo para escala de gráficas general
    max_egreso_mes = max([e['monto'] for e in egresos_mensuales]) if egresos_mensuales else 0
    if max_egreso_mes == 0: max_egreso_mes = 1
    
    # Datos por categoría (para tabla de distribución)
    categorias = {}
    for e in lista_egresos:
        categorias[e.concepto] = categorias.get(e.concepto, 0) + e.monto
    
    lista_categorias = [{'nombre': k, 'monto': v} for k, v in categorias.items()]
    lista_categorias = sorted(lista_categorias, key=lambda x: x['monto'], reverse=True)

    datos_empresa = {
        'nombre': 'PesatusPesos',
        'email': 'jmjcompanysa3@gmail.com',
        'telefono': '+57 310 520 4819',
        'ubicacion': 'Medellín, Colombia',
        'sitio_web': 'pesatuspesos.com'
    }
    
    contexto = {
        'lista_egresos': lista_egresos[:20], # Top 20 para el dashboard PDF
        'total_egresos': total_egresos,
        'egresos_mes_actual': egresos_mes_actual,
        'conteo_egresos': conteo_egresos,
        'egresos_mensuales': egresos_mensuales,
        'egresos_mensuales_ultimos_2': egresos_mensuales_ultimos_2,
        'max_egreso_mes_2': max_egreso_mes_2,
        'max_egreso_mes': max_egreso_mes,
        'lista_categorias': lista_categorias,
        'fecha_actual': ahora,
        'nombre_reporte': 'Reporte de Egresos y Gastos Detallados',
        'empresa': datos_empresa,
    }
    
    return generar_pdf(request, 'reportes/egresos_pdf.html', contexto, nombre_archivo="Reporte_Egresos_Oficial.pdf")

def descargar_ingresos_pdf(request):
    ahora = timezone.now()
    lista_ingresos = Ingreso.objects.all().order_by('-fecha')
    
    total_ingresos = sum(i.monto for i in lista_ingresos)
    ingresos_mes_actual = sum(i.monto for i in lista_ingresos if i.fecha.month == ahora.month and i.fecha.year == ahora.year)
    
    conteo_ingresos = lista_ingresos.count()
    
    # Datos para gráficas: Ingresos por mes (últimos 6 meses)
    ingresos_mensuales = []
    for i in range(5, -1, -1):
        mes_offset = ahora.month - i
        ano_offset = ahora.year
        if mes_offset <= 0:
            mes_offset += 12
            ano_offset -= 1
        monto_mes = sum(i.monto for i in lista_ingresos if i.fecha.month == mes_offset and i.fecha.year == ano_offset)
        meses_nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        ingresos_mensuales.append({
            'mes': meses_nombres[mes_offset - 1],
            'monto': monto_mes
        })
    
    # Datos específicos para imitar el Dashboard (Mes Pasado vs Actual)
    ingresos_mensuales_ultimos_2 = [
        {'label': 'Mes Pasado', 'monto': ingresos_mensuales[-2]['monto'] if len(ingresos_mensuales) >= 2 else 0},
        {'label': 'Mes Actual', 'monto': ingresos_mensuales[-1]['monto']}
    ]
    max_ingreso_mes_2 = max([i['monto'] for i in ingresos_mensuales_ultimos_2]) if ingresos_mensuales_ultimos_2 else 1
    if max_ingreso_mes_2 == 0: max_ingreso_mes_2 = 1

    # Datos por categoría
    categorias = {}
    for i in lista_ingresos:
        categorias[i.concepto] = categorias.get(i.concepto, 0) + i.monto
    
    lista_categorias = [{'nombre': k, 'monto': v} for k, v in categorias.items()]
    lista_categorias = sorted(lista_categorias, key=lambda x: x['monto'], reverse=True)

    datos_empresa = {
        'nombre': 'PesatusPesos',
        'email': 'jmjcompanysa3@gmail.com',
        'telefono': '+57 310 520 4819',
        'ubicacion': 'Medellín, Colombia',
        'sitio_web': 'pesatuspesos.com'
    }
    
    # Preparar datos para las barras con estilos preformateados
    ingresos_con_color = []
    for m in ingresos_mensuales_ultimos_2:
        c_val = '#16a34a' if m['label'] == 'Mes Actual' else '#fff8dc'
        h_val = (m['monto'] / max_ingreso_mes_2 * 100) if max_ingreso_mes_2 > 0 else 0
        # Crear el string de estilo completo para evitar errores en el IDE
        m['css_style'] = f"height: {h_val}%; background: {c_val}; border: 1px solid rgba(255,255,255,0.1);"
        ingresos_con_color.append(m)

    contexto = {
        'lista_ingresos': lista_ingresos[:20],
        'total_ingresos': total_ingresos,
        'ingresos_mes_actual': ingresos_mes_actual,
        'conteo_ingresos': conteo_ingresos,
        'ingresos_mensuales_ultimos_2': ingresos_con_color,
        'max_ingreso_mes_2': max_ingreso_mes_2,
        'lista_categorias': lista_categorias,
        'fecha_actual': ahora,
        'nombre_reporte': 'Reporte de Ingresos y Capital Entrante',
        'empresa': datos_empresa,
    }
    
    return generar_pdf(request, 'reportes/ingresos_pdf.html', contexto, nombre_archivo="Reporte_Ingresos_Oficial.pdf")

def descargar_ahorros_pdf(request):
    ahora = timezone.now()
    lista_metas = Meta.objects.all()
    
    # KPIs
    total_objetivo = sum(m.monto_objetivo for m in lista_metas)
    metas_completadas = lista_metas.filter(completada=True).count()
    metas_activas = lista_metas.filter(completada=False).count()
    
    # Calcular ahorro real total desde aportes
    total_ahorrado = sum(a.monto for a in Aporte.objects.all())
    
    # Preparar datos de metas con progreso calculado
    metas_con_progreso = []
    for meta in lista_metas:
        ahorrado_meta = sum(a.monto for a in meta.aportes.all())
        progreso = (ahorrado_meta / meta.monto_objetivo * 100) if meta.monto_objetivo > 0 else 0
        p_val = min(round(progreso, 1), 100)
        c_val = '#16a34a' if progreso >= 100 else '#f3d989'
        metas_con_progreso.append({
            'obj': meta,
            'ahorrado': ahorrado_meta,
            'progreso': p_val,
            'faltante': max(meta.monto_objetivo - ahorrado_meta, 0),
            'color': c_val,
            # Estilo completo para evitar que el linter del IDE se queje de la sintaxis
            'css_progreso': f"width: {p_val}%; background: {c_val};",
            'css_color': f"color: {c_val};"
        })

    # Historial de aportes recientes (últimos 15)
    historial_aportes = Aporte.objects.all().order_by('-fecha')[:15]

    datos_empresa = {
        'nombre': 'PesatusPesos',
        'email': 'jmjcompanysa3@gmail.com',
        'telefono': '+57 310 520 4819',
        'ubicacion': 'Medellín, Colombia',
        'sitio_web': 'pesatuspesos.com'
    }
    
    contexto = {
        'metas': metas_con_progreso,
        'total_objetivo': total_objetivo,
        'total_ahorrado': total_ahorrado,
        'metas_completadas': metas_completadas,
        'metas_activas': metas_activas,
        'historial_aportes': historial_aportes,
        'fecha_actual': ahora,
        'nombre_reporte': 'Reporte General de Ahorros y Metas',
        'empresa': datos_empresa,
    }
    
    return generar_pdf(request, 'reportes/ahorros_pdf.html', contexto, nombre_archivo="Reporte_Ahorros_Oficial.pdf")
