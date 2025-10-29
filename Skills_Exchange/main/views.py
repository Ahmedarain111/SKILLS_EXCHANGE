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

    pending_requests = Exchange.objects.filter(
        user2=user, status="pending"
    ).select_related("user1", "user1__userprofile", "skill1", "skill2")

    # Calculate profile completion
    profile_completion = 0
    if hasattr(user, "userprofile"):
        profile = user.userprofile
        total_fields = 4
        filled_fields = 0
        if profile.full_name:
            filled_fields += 1
        if profile.bio:
            filled_fields += 1
        if profile.location:
            filled_fields += 1
        if profile.certifications:
            filled_fields += 1
        profile_completion = int((filled_fields / total_fields) * 100)

    # Get recent activities from actual exchanges
    recent_activities = []
    recent_exchanges = (
        Exchange.objects.filter(Q(user1=user) | Q(user2=user))
        .order_by("-last_updated")[:5]
        .select_related("user1", "user2", "skill1", "skill2")
    )

    for exchange in recent_exchanges:
        other_user = exchange.user2 if exchange.user1 == user else exchange.user1
        other_user_name = (
            other_user.userprofile.full_name
            if hasattr(other_user, "userprofile") and other_user.userprofile.full_name
            else other_user.username
        )

        if exchange.status == "active":
            if exchange.user1 == user:
                skill_learning = exchange.skill2.name
            else:
                skill_learning = exchange.skill1.name
            recent_activities.append(
                {
                    "icon": "fa-handshake",
                    "title": "Active Exchange",
                    "description": f"Learning {skill_learning} with {other_user_name}",
                    "time": f"{(exchange.last_updated).strftime('%b %d, %Y')}",
                }
            )
        elif exchange.status == "pending":
            if exchange.user1 == user:
                recent_activities.append(
                    {
                        "icon": "fa-clock",
                        "title": "Exchange Pending",
                        "description": f"Waiting for {other_user_name} to respond",
                        "time": f"{(exchange.start_date).strftime('%b %d, %Y')}",
                    }
                )
        elif exchange.status == "completed":
            recent_activities.append(
                {
                    "icon": "fa-check-circle",
                    "title": "Exchange Completed",
                    "description": f"Completed exchange with {other_user_name}",
                    "time": f"{(exchange.last_updated).strftime('%b %d, %Y')}",
                }
            )

    # Find potential matches based on complementary skills
    my_seeking_skills = UserSkill.objects.filter(user=user, role="seek").values_list(
        "skill_id", flat=True
    )
    my_offering_skills = UserSkill.objects.filter(user=user, role="offer").values_list(
        "skill_id", flat=True
    )

    matches = []
    if my_seeking_skills and my_offering_skills:
        # Find users who offer what I seek and seek what I offer
        potential_matches = (
            UserSkill.objects.filter(skill_id__in=my_seeking_skills, role="offer")
            .exclude(user=user)
            .select_related("user", "user__userprofile", "skill")[:10]
        )

        for match_skill in potential_matches:
            other_user = match_skill.user
            # Check if they seek what I offer
            their_seeking = UserSkill.objects.filter(
                user=other_user, role="seek", skill_id__in=my_offering_skills
            ).first()

            if their_seeking:
                name = (
                    other_user.userprofile.full_name
                    if hasattr(other_user, "userprofile")
                    and other_user.userprofile.full_name
                    else other_user.username
                )
                initials = name[:2].upper() if len(name) >= 2 else name[:1].upper()
                matches.append(
                    {
                        "initials": initials,
                        "name": name,
                        "user_id": other_user.id,
                        "offer": match_skill.skill.name,
                        "want": their_seeking.skill.name,
                    }
                )
                if len(matches) >= 3:
                    break

    context = {
        "offered_skills": UserSkill.objects.filter(user=user, role="offer").count(),
        "learning_skills": UserSkill.objects.filter(user=user, role="seek").count(),
        "active_exchanges": Exchange.objects.filter(
            Q(user1=user, status="active") | Q(user2=user, status="active")
        ).count(),
        "pending_requests": pending_requests,
        "profile_completion": profile_completion,
        "recent_activities": recent_activities,
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


@login_required
def propose_exchange_view(request, user_skill_id):
    """View to propose a skill exchange with another user."""
    other_user_skill = get_object_or_404(UserSkill, id=user_skill_id, role="offer")

    if other_user_skill.user == request.user:
        messages.error(request, "You cannot propose an exchange with yourself!")
        return redirect("marketplace")

    my_offered_skills = UserSkill.objects.filter(user=request.user, role="offer")

    if request.method == "POST":
        my_skill_id = request.POST.get("my_skill")
        notes = request.POST.get("notes", "")

        if not my_skill_id:
            messages.error(request, "Please select a skill you want to offer.")
            return redirect("propose_exchange", user_skill_id=user_skill_id)

        my_skill = get_object_or_404(
            UserSkill, id=my_skill_id, user=request.user, role="offer"
        )

        exchange = Exchange.objects.create(
            user1=request.user,
            user2=other_user_skill.user,
            skill1=my_skill.skill,
            skill2=other_user_skill.skill,
            status="pending",
            notes=notes,
        )

        messages.success(
            request,
            f"Exchange proposal sent to {other_user_skill.user.userprofile.full_name if hasattr(other_user_skill.user, 'userprofile') else other_user_skill.user.username}!",
        )
        return redirect("dashboard")

    context = {
        "other_user_skill": other_user_skill,
        "my_offered_skills": my_offered_skills,
    }

    return render(request, "propose_exchange.html", context)


@login_required
def accept_exchange(request, exchange_id):
    """Accept a pending exchange proposal."""
    exchange = get_object_or_404(
        Exchange, id=exchange_id, user2=request.user, status="pending"
    )

    exchange.status = "active"
    exchange.save()

    messages.success(
        request,
        f"Exchange accepted! You can now start learning {exchange.skill1.name} from {exchange.user1.userprofile.full_name if hasattr(exchange.user1, 'userprofile') else exchange.user1.username}.",
    )
    return redirect("dashboard")


@login_required
def reject_exchange(request, exchange_id):
    """Reject a pending exchange proposal."""
    exchange = get_object_or_404(
        Exchange, id=exchange_id, user2=request.user, status="pending"
    )

    exchange.status = "cancelled"
    exchange.save()

    messages.info(request, "Exchange proposal declined.")
    return redirect("dashboard")


from .models import Message
from django.db.models import Max, OuterRef, Subquery


from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q
from .models import Message
from django.contrib.auth import get_user_model

User = get_user_model()


@login_required
def messages_view(request, user_id=None):
    """Display list of conversations and optionally a selected conversation."""
    current_user = request.user

    # --- Build conversation list ---
    sent_to = (
        Message.objects.filter(sender=current_user)
        .values_list("receiver", flat=True)
        .distinct()
    )
    received_from = (
        Message.objects.filter(receiver=current_user)
        .values_list("sender", flat=True)
        .distinct()
    )
    conversation_user_ids = set(list(sent_to) + list(received_from))

    conversations = []
    for uid in conversation_user_ids:
        other_user = User.objects.get(id=uid)
        last_message = (
            Message.objects.filter(
                Q(sender=current_user, receiver=other_user)
                | Q(sender=other_user, receiver=current_user)
            )
            .order_by("-timestamp")
            .first()
        )
        unread_count = Message.objects.filter(
            sender=other_user, receiver=current_user, is_read=False
        ).count()
        conversations.append(
            {
                "user": other_user,
                "last_message": last_message,
                "unread_count": unread_count,
            }
        )

    # Sort conversations by last message timestamp
    conversations.sort(
        key=lambda x: (
            x["last_message"].timestamp if x["last_message"] else x["user"].date_joined
        ),
        reverse=True,
    )

    # --- Selected conversation (if any) ---
    selected_user = None
    messages_list = []
    if user_id:
        selected_user = get_object_or_404(User, id=user_id)

        # Mark unread messages as read
        Message.objects.filter(
            sender=selected_user, receiver=current_user, is_read=False
        ).update(is_read=True)

        # Get all messages with this user
        messages_list = (
            Message.objects.filter(
                Q(sender=current_user, receiver=selected_user)
                | Q(sender=selected_user, receiver=current_user)
            )
            .order_by("timestamp")
            .select_related("sender", "receiver")
        )

        # Handle sending a new message
        if request.method == "POST":
            content = request.POST.get("content", "").strip()
            if content:
                Message.objects.create(
                    sender=current_user, receiver=selected_user, content=content
                )
                return redirect("messages_combined", user_id=user_id)

    context = {
        "conversations": conversations,
        "selected_user": selected_user,
        "messages": messages_list,
    }

    return render(request, "messages.html", context)
