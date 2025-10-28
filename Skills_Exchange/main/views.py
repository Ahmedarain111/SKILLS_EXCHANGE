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


def index_view(request):
    return render(request, "index.html")


from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import UserSkill, Category


@login_required
def marketplace_view(request):
    # Get all categories for sidebar
    categories = Category.objects.all()

    # Read selected category from query (?category=1)
    category_id = request.GET.get("category")

    # Start with all offered skills (exclude current user)
    offered_skills = UserSkill.objects.filter(role="offer").exclude(user=request.user)

    # If a category filter is applied
    if category_id:
        offered_skills = offered_skills.filter(skill__category_id=category_id)

    # Prepare context
    context = {
        "categories": categories,
        "skills": offered_skills,  # pass UserSkill queryset
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

@login_required
def dashboard_view(request):
    user = request.user

    profile = UserProfile.objects.filter(user=user).first()

    skills_have_count = UserSkill.objects.filter(user=user, skill_type="teach").count()
    skills_want_count = UserSkill.objects.filter(user=user, skill_type="learn").count()
    active_exchanges_count = Exchange.objects.filter(
        Q(user1=user) | Q(user2=user), status="active"
    ).count()

    if profile:
        fields = [profile.full_name, profile.bio, profile.location]
        completion_fields = sum(bool(f) for f in fields)
        total_fields = len(fields)
        profile_completion = int((completion_fields / total_fields) * 100)
    else:
        profile_completion = 0

    recent_exchanges = Exchange.objects.filter(Q(user1=user) | Q(user2=user)).order_by(
        "-start_date"
    )[:5]

    recent_activity = []
    for ex in recent_exchanges:
        partner = ex.user2 if ex.user1 == user else ex.user1
        skill_you_give = ex.skill1 if ex.user1 == user else ex.skill2
        skill_you_get = ex.skill2 if ex.user1 == user else ex.skill1
        recent_activity.append(
            {
                "icon": "fas fa-handshake",
                "title": (
                    "Exchange Started"
                    if ex.status == "active"
                    else ex.get_status_display()
                ),
                "desc": f"With {partner.username}: {skill_you_give} ↔ {skill_you_get}",
                "time": ex.start_date.strftime("%b %d, %Y"),
            }
        )

    your_teach_skills = UserSkill.objects.filter(
        user=user, skill_type="teach"
    ).values_list("skill", flat=True)
    your_learn_skills = UserSkill.objects.filter(
        user=user, skill_type="learn"
    ).values_list("skill", flat=True)

    matches = []
    if your_teach_skills.exists() or your_learn_skills.exists():
        potential_users = (
            UserSkill.objects.exclude(user=user)
            .filter(
                Q(skill__in=your_learn_skills, skill_type="teach")
                | Q(skill__in=your_teach_skills, skill_type="learn")
            )
            .select_related("user", "skill")
            .distinct()[:4]
        )

        for us in potential_users:
            matches.append(
                {
                    "initials": us.user.username[:2].upper(),
                    "name": us.user.get_full_name() or us.user.username,
                    "exchange": f"{us.skill.name}",
                }
            )

    context = {
        "profile": profile,
        "skills_have_count": skills_have_count,
        "skills_want_count": skills_want_count,
        "active_exchanges_count": active_exchanges_count,
        "profile_completion": profile_completion,
        "recent_activity": recent_activity,
        "matches": matches,
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
