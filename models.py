from django.db import models


class CarMake(models.Model):
    name = models.CharField(max_length=80, unique=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    make = models.ForeignKey(CarMake, on_delete=models.CASCADE)
    name = models.CharField(max_length=80)
    year = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [models.UniqueConstraint(fields=["make", "name", "year"],
                                               name="unique_car_model_year")]

    def __str__(self):
        return f"{self.make} {self.name} ({self.year})"
