import json
from pathlib import Path
from .models import CarMake, CarModel


def initiate():
    source = Path(__file__).resolve().parents[1] / "database/data/car_records.json"
    for car in json.loads(source.read_text())["cars"]:
        make, _ = CarMake.objects.get_or_create(name=car["make"])
        CarModel.objects.get_or_create(make=make, name=car["model"], year=car["year"])
