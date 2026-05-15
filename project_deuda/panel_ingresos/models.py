from django.db import models

class Ingreso(models.Model):
    fecha = models.DateField()
    descripcion = models.CharField(max_length=255)
    metodo = models.CharField(max_length=50)
    concepto = models.CharField(max_length=50)
    monto = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.descripcion} - {self.monto}"
