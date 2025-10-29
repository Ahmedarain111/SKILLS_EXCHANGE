from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=150)
    bio = models.TextField()
    location = models.CharField(max_length=100)
    certifications = models.FileField(
        upload_to="certifications/", blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="skills",
    )

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    SKILL_ROLE = (
        ("offer", "Can Offer"),
        ("seek", "Looking For"),
    )

    PROFICIENCY_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
        ("expert", "Expert"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=SKILL_ROLE, default="offer")
    proficiency = models.CharField(
        max_length=20, choices=PROFICIENCY_CHOICES, default="beginner"
    )
    experience_years = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("user", "skill", "role")

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.role})"


class Exchange(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("dispute", "Dispute"),
        ("cancelled", "Cancelled"),
    ]

    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="exchanges_as_user1",
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="exchanges_as_user2",
    )

    skill1 = models.ForeignKey(
        Skill, on_delete=models.SET_NULL, null=True, related_name="offered_exchanges"
    )
    skill2 = models.ForeignKey(
        Skill, on_delete=models.SET_NULL, null=True, related_name="received_exchanges"
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user1.username} ↔ {self.user2.username} ({self.skill1} ↔ {self.skill2})"

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "Exchange"
        verbose_name_plural = "Exchanges"


class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.content[:30]}"
