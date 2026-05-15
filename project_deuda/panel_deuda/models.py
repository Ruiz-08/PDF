from django.db import models

class Deuda(models.Model):
    acreedor = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)
    saldo_inicial = models.DecimalField(max_digits=12, decimal_places=2)
    saldo_actual = models.DecimalField(max_digits=12, decimal_places=2)
    tasa = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    vencimiento = models.DateField()
    estado = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.acreedor} - {self.tipo}"

class Pago(models.Model):
    deuda = models.ForeignKey(Deuda, on_delete=models.CASCADE, related_name='pagos')
    fecha_pago = models.DateField()
    monto_pago = models.DecimalField(max_digits=12, decimal_places=2)
    metodo_pago = models.CharField(max_length=50)
    notas = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Pago a {self.deuda.acreedor} - {self.fecha_pago}"
