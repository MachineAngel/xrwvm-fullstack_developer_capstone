import json
import os
from urllib.parse import quote

import requests
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST

from .models import CarModel

BACKEND = os.getenv("backend_url", "http://127.0.0.1:3030").rstrip("/")
SENTIMENT = os.getenv("sentiment_analyzer_url", "http://127.0.0.1:5050").rstrip("/")


def remote(url, payload=None):
    response = (requests.get(url, timeout=8) if payload is None
                else requests.post(url, json=payload, timeout=8))
    response.raise_for_status()
    return response.json()


def response_from(key, operation):
    try:
        return JsonResponse({"status": 200, key: operation()})
    except (requests.RequestException, ValueError):
        return JsonResponse({"status": 502, "message": "Service unavailable."}, status=502)


@require_POST
def login_user(request):
    data = json.loads(request.body)
    user = authenticate(request, username=data.get("userName"), password=data.get("password"))
    if user is None:
        return JsonResponse({"message": "Invalid credentials."}, status=401)
    login(request, user)
    return JsonResponse({"status": "Authenticated", "userName": user.username})


@require_POST
def logout_request(request):
    logout(request)
    return JsonResponse({"status": 200, "message": "Logged out"})


@require_POST
def registration(request):
    data = json.loads(request.body)
    form = UserCreationForm({"username": data.get("username"), "password1": data.get("password"),
                             "password2": data.get("password")})
    if not form.is_valid():
        return JsonResponse({"errors": form.errors}, status=400)
    user = form.save(commit=False)
    user.first_name = data.get("first_name", "")[:150]
    user.last_name = data.get("last_name", "")[:150]
    user.email = data.get("email", "")[:254]
    user.save()
    login(request, user)
    return JsonResponse({"userName": user.username}, status=201)


@require_GET
def get_dealerships(request, state=None):
    endpoint = "/fetchDealers" + ("/" + quote(state, safe="") if state else "")
    return response_from("dealers", lambda: remote(BACKEND + endpoint))


@require_GET
def get_dealer_details(request, dealer_id):
    return response_from("dealer", lambda: remote(f"{BACKEND}/fetchDealer/{dealer_id}"))


@require_GET
def get_dealer_reviews(request, dealer_id):
    def reviews():
        items = remote(f"{BACKEND}/fetchReviews/dealer/{dealer_id}")
        for item in items:
            try:
                item["sentiment"] = remote(SENTIMENT + "/analyze/" + quote(item["review"], safe=""))["sentiment"]
            except requests.RequestException:
                item["sentiment"] = "neutral"
        return items
    return response_from("reviews", reviews)


@require_POST
def add_review(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Please log in."}, status=401)
    data = json.loads(request.body)
    if not isinstance(data.get("review"), str) or not data["review"].strip():
        return JsonResponse({"message": "A review is required."}, status=400)
    data["name"] = request.user.get_full_name() or request.user.username
    return response_from("review", lambda: remote(BACKEND + "/insert_review", data))


@require_GET
def get_cars(request):
    records = CarModel.objects.select_related("make").order_by("make__name", "name", "year")
    return JsonResponse({"CarModels": [{"CarMake": m.make.name, "CarModel": m.name,
                                       "CarYear": m.year} for m in records]})
