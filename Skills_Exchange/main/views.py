from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login # type: ignore
from django.contrib.auth.models import User
from django.contrib import messages

def signup_view(request):
    if request.method == "POST":
        username = request.POST.get("fullname")
        username = request.POST.get("email")
        password = request.POST.get("password")
        confirm = request.POST.get("confirm") 

        if password == confirm:
            User.objects.create_user(username=username, password=password)
            messages.success(request, "Account created successfully!")
            return redirect("login")
        else:
            messages.error(request, "Passwords do not match!")

    return render(request, "signup.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Logged in successfully!")
            return redirect("marketplace")
        else:
            messages.error(request, "Invalid username or password")

    return render(request, "login.html")
    

def index_view(request):
    return render(request, 'index.html')

def marketplace_view(request):
    return render(request, 'marketplace.html')