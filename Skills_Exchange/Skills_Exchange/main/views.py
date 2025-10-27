from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from .models import Skill, Exchange
from .forms import UserProfileForm
from .models import UserProfile
from .models import UserProfile, Skill, UserSkill, Exchange
from django.db.models import Q


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


@login_required
def marketplace_view(request):
    current_user = request.user
    others_skills = UserSkill.objects.select_related("user", "skill").exclude(
        user=current_user
    )
    teach_skills = others_skills.filter(skill_type="teach")
    learn_skills = others_skills.filter(skill_type="learn")

    return render(
        request,
        "marketplace.html",
        {
            "teach_skills": teach_skills,
            "learn_skills": learn_skills,
        },
    )


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


@login_required
def create_profile(request):
    from .models import Skill, UserSkill, UserProfile

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        profile = None

    if request.method == "POST":
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            user_profile = form.save(commit=False)
            user_profile.user = request.user
            user_profile.save()

            # Clear previous user skills before saving
            UserSkill.objects.filter(user=request.user).delete()

            # Handle "skills you have"
            for skill_id in request.POST.getlist("skills_have"):
                skill = Skill.objects.get(id=skill_id)
                proficiency = request.POST.get(f"proficiency_{skill_id}", "")
                experience = request.POST.get(f"experience_{skill_id}", 0)
                UserSkill.objects.create(
                    user=request.user,
                    skill=skill,
                    skill_type="teach",
                    proficiency=proficiency,
                    experience_years=experience
                )

            # Handle "skills you want"
            for skill_id in request.POST.getlist("skills_want"):
                skill = Skill.objects.get(id=skill_id)
                proficiency = request.POST.get(f"proficiency_want_{skill_id}", "")
                experience = request.POST.get(f"experience_want_{skill_id}", 0)
                UserSkill.objects.create(
                    user=request.user,
                    skill=skill,
                    skill_type="learn",
                    proficiency=proficiency,
                    experience_years=experience
                )

            messages.success(request, "Profile and skills saved successfully!")
            return redirect("dashboard")
    else:
        form = UserProfileForm(instance=profile)

    # 🟢 Important — send Skill data to template
    skills_have = Skill.objects.all()
    skills_want = Skill.objects.all()

    return render(request, "profile.html", {
        "form": form,
        "skills_have": skills_have,
        "skills_want": skills_want,
    })



@login_required
def dashboard_view(request):
    user = request.user

    profile = UserProfile.objects.filter(user=user).first()

    # Skill stats
    skills_have_count = UserSkill.objects.filter(user=user, skill_type="teach").count()
    skills_want_count = UserSkill.objects.filter(user=user, skill_type="learn").count()
    active_exchanges_count = Exchange.objects.filter(
        Q(requester=user) | Q(receiver=user), status="accepted"
    ).count()

    # Profile completion
    if profile:
        fields = [profile.full_name, profile.bio, profile.location]
        completion_fields = sum(bool(f) for f in fields)
        total_fields = len(fields)
        profile_completion = int((completion_fields / total_fields) * 100)
    else:
        profile_completion = 0

    # Recent exchanges
    recent_exchanges = Exchange.objects.filter(
        Q(requester=user) | Q(receiver=user)
    ).order_by("-created_at")[:5]

    recent_activity = []
    for ex in recent_exchanges:
        partner = ex.receiver if ex.requester == user else ex.requester
        skill_you_offer = ex.skill.skill.name
        recent_activity.append(
            {
                "icon": "fas fa-handshake",
                "title": (
                    "Exchange Active"
                    if ex.status == "accepted"
                    else ex.get_status_display()
                ),
                "desc": f"With {partner.username}: {skill_you_offer}",
                "time": ex.created_at.strftime("%b %d, %Y"),
            }
        )

    # Potential matches
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
    from_user = request.user
    to_user_skill = get_object_or_404(UserSkill, id=skill_id, user__id=user_id)

    # Prevent users from starting exchange with themselves
    if from_user == to_user_skill.user:
        messages.warning(request, "You cannot start an exchange with yourself.")
        return redirect("marketplace")

    # Check if exchange already exists
    existing_exchange = Exchange.objects.filter(
        (Q(requester=from_user) & Q(receiver=to_user_skill.user))
        | (Q(requester=to_user_skill.user) & Q(receiver=from_user))
    ).first()

    if existing_exchange:
        messages.info(request, "Exchange already exists. Redirecting to chat...")
        return redirect("exchange_detail", exchange_id=existing_exchange.id)

    # Create a new exchange
    exchange = Exchange.objects.create(
        requester=from_user,
        receiver=to_user_skill.user,
        skill=to_user_skill.skill,
        status="pending",
    )

    messages.success(request, "Exchange request sent successfully!")
    return redirect("exchange_detail", exchange_id=exchange.id)
