from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from .models import Skill, Exchange
from .forms import UserProfileForm
from .models import UserProfile
from .models import UserProfile, Skill, UserSkill
from django.db.models import Q
from .models import Skill, Category


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
            last_name=(
                " ".join(name.split(" ")[1:]) if name and len(name.split()) > 1 else ""
            ),
        )
        user.save()

        messages.success(request, "Account created successfully! Please log in.")
        return redirect("login")

    return render(request, "signup.html")


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


from django.contrib.auth import logout
from django.shortcuts import redirect


def logout_view(request):
    logout(request)
    return redirect("index")


def index_view(request):
    return render(request, "index.html")


from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import UserSkill, Category


from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Category, UserSkill

@login_required
def marketplace_view(request):
    # Get all categories for sidebar
    categories = Category.objects.all()

    # Define level choices
    levels = ["Any", "Beginner", "Intermediate", "Advanced", "Expert"]

    # Read selected filters from query (?category=1&level=Beginner)
    category_id = request.GET.get("category")
    level = request.GET.get("level")

    # Start with all offered skills (exclude current user)
    offered_skills = UserSkill.objects.filter(role="offer").exclude(user=request.user)

    # Apply category filter if not empty or "All"
    if category_id and category_id.lower() != "all":
        offered_skills = offered_skills.filter(skill__category_id=category_id)

    # Apply skill level filter if not empty or "Any"
    if level and level.lower() != "any":
        offered_skills = offered_skills.filter(proficiency__iexact=level)

    # Prepare context
    context = {
        "categories": categories,
        "skills": offered_skills,
        "levels": levels,  # pass to template
        "selected_category": category_id or "all",
        "selected_level": level or "any",
    }

    return render(request, "marketplace.html", context)


@staff_member_required
def admin_dashboard(request):
    total_users = User.objects.count()
    recent_users = User.objects.order_by("-date_joined")[:5]

    context = {
        "total_users": total_users,
        "active_exchanges": 0,
        "pending_issues": 0,
        "completed_exchanges": 0,
        "recent_users": recent_users,
    }
    return render(request, "admin_dashboard.html", context)


@staff_member_required
def admin_users(request):
    query = request.GET.get("q", "")
    if query:
        users = User.objects.filter(username__icontains=query)
    else:
        users = User.objects.all()
    return render(request, "admin_users.html", {"users": users})


def admin_exchanges(request):
    exchanges = Exchange.objects.all()
    return render(request, "admin_exchanges.html", {"exchanges": exchanges})


from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from .models import UserProfile, UserSkill


@login_required
def profile_view(request, user_id):
    user = get_object_or_404(User, id=user_id)

    # Redirect to profile creation page if profile not found
    try:
        profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        # If current logged-in user is viewing their own profile
        if request.user == user:
            return redirect("create_profile")
        else:
            # Show 404 if trying to view someone else's missing profile
            return render(request, "profile_not_found.html", {"profile_user": user})

    # Fetch offered and wanted skills
    offered_skills = UserSkill.objects.filter(user=user, role="offer")
    wanted_skills = UserSkill.objects.filter(user=user, role="seek")

    context = {
        "profile_user": user,
        "profile": profile,
        "offered_skills": offered_skills,
        "wanted_skills": wanted_skills,
    }

    return render(request, "profile.html", context)


@login_required
def create_profile(request):
    if hasattr(request.user, "userprofile"):
        messages.info(request, "You already have a profile.")
        return redirect("profile", user_id=request.user.id)

    if request.method == "POST":
        form = UserProfileForm(request.POST, request.FILES)
        if form.is_valid():
            profile = form.save(commit=False)
            profile.user = request.user
            profile.save()
            messages.success(request, "Profile created successfully!")
            return redirect("profile", user_id=request.user.id)
    else:
        form = UserProfileForm()

    return render(request, "create_profile.html", {"form": form})


from django.db.models import Q
from django.shortcuts import render
from .models import UserProfile, UserSkill, Exchange

from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def dashboard_view(request):
    user = request.user

    context = {
        "offered_skills": UserSkill.objects.filter(user=user, role="offer").count(),
        "learning_skills": UserSkill.objects.filter(user=user, role="seek").count(),
        "active_exchanges": Exchange.objects.filter(
            Q(user1=user, status="active") | Q(user2=user, status="active")
        ).count(),
        "profile_completion": 85,  # Dummy data
        "recent_activities": [
            {
                "icon": "fa-handshake",
                "title": "New Exchange Started",
                "description": "You began learning Graphic Design from Maria Johnson",
                "time": "2 hours ago",
            },
            {
                "icon": "fa-star",
                "title": "Skill Rated",
                "description": "Alex Smith rated your Web Development teaching 5 stars",
                "time": "1 day ago",
            },
            {
                "icon": "fa-comment",
                "title": "New Message",
                "description": "Carlos Rodriguez sent you a message",
                "time": "2 days ago",
            },
        ],
        "matches": [
            {
                "initials": "AS",
                "name": "Alex Smith",
                "offer": "Web Development",
                "want": "UI/UX Design",
                "percent": 92,
            },
            {
                "initials": "MJ",
                "name": "Maria Johnson",
                "offer": "Public Speaking",
                "want": "Graphic Design",
                "percent": 88,
            },
            {
                "initials": "CR",
                "name": "Carlos Rodriguez",
                "offer": "Spanish",
                "want": "Photography",
                "percent": 79,
            },
        ],
    }

    return render(request, "dashboard.html", context)


@login_required
def start_exchange(request, user_id, skill_id):
    """Initiate an exchange with another user."""
    other_user_skill = get_object_or_404(UserSkill, id=skill_id, user_id=user_id)
    current_user = request.user

    teach_skill = UserSkill.objects.filter(
        user=current_user, skill_type="teach"
    ).first()
    if not teach_skill:
        messages.error(
            request, "You must add a teaching skill before starting an exchange."
        )
        return redirect("dashboard")

    exchange = Exchange.objects.create(
        user1=current_user,
        user2=other_user_skill.user,
        skill1=teach_skill.skill,
        skill2=other_user_skill.skill,
        status="pending",
    )

    messages.success(
        request, f"Exchange request sent to {other_user_skill.user.username}!"
    )
    return redirect("dashboard")


from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import UserSkill
from .forms import UserSkillFormSet

from django.shortcuts import render, redirect
from django.forms import modelformset_factory
from django.contrib.auth.decorators import login_required
from .models import UserSkill

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from django.forms import modelformset_factory
from .models import UserSkill


@login_required
def manage_skills(request):
    SkillFormSet = modelformset_factory(
        UserSkill,
        fields=("skill", "role", "proficiency", "experience_years"),
        extra=1,
        can_delete=True,
    )

    queryset = UserSkill.objects.filter(user=request.user)
    if request.method == "POST":
        formset = SkillFormSet(request.POST, queryset=queryset)

        if formset.is_valid():
            # Save new or updated skills
            instances = formset.save(commit=False)
            for instance in instances:
                instance.user = request.user
                instance.save()

            # Delete those marked for removal
            for obj in formset.deleted_objects:
                obj.delete()

            return redirect("profile", user_id=request.user.id)
        else:
            print(formset.errors)  # Debug line
    else:
        formset = SkillFormSet(queryset=queryset)

    return render(request, "manage_skills.html", {"formset": formset})
