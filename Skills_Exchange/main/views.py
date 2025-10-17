from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages

def signup(request):
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
