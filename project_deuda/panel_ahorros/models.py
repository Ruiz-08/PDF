from django.db import models

class Meta(models.Model):
    titulo = models.CharField(max_length=255)
    monto_objetivo = models.DecimalField(max_digits=12, decimal_places=2)
    duracion_meses = models.IntegerField()
    frecuencia = models.CharField(max_length=50) # Semanal, Quincenal, Mensual
    fecha_inicio = models.DateField()
    fecha_meta = models.DateField()
    completada = models.BooleanField(default=False)
    imagen = models.ImageField(upload_to='metas/', null=True, blank=True)

    def __str__(self):
        return self.titulo

class Aporte(models.Model):
    meta = models.ForeignKey(Meta, on_delete=models.CASCADE, related_name='aportes')
    fecha = models.DateField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    metodo = models.CharField(max_length=50, default='Efectivo')

    def __str__(self):
        return f"Aporte a {self.meta.titulo} - {self.monto}"
