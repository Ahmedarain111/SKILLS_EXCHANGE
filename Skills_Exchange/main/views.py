from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login  # type: ignore
from django.contrib.auth.models import User
from django.contrib import messages


from django.contrib.auth.models import User
from django.contrib import messages
from django.shortcuts import render, redirect

def signup_view(request):
    if request.method == "POST":
        name = request.POST.get("fullname")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirm = request.POST.get("confirm")

        if password != confirm:
            messages.error(request, "Passwords do not match!")
            return redirect("signup")

        if User.objects.filter(username=email).exists():
            messages.error(request, "Email is already registered!")
            return redirect("signup")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name.split(" ")[0] if name else "",
            last_name=" ".join(name.split(" ")[1:]) if name and len(name.split()) > 1 else ""
        )
        user.save()

        messages.success(request, "Account created successfully! Please log in.")
        return redirect("login")

    return render(request, "signup.html")



from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.shortcuts import render, redirect

def login_view(request):
    if request.method == "POST":
        email = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Logged in successfully!")
            return redirect("marketplace")
        else:
            messages.error(request, "Invalid email or password!")

    return render(request, "login.html")


def index_view(request):
    return render(request, "index.html")


def marketplace_view(request):
    return render(request, "marketplace.html")
