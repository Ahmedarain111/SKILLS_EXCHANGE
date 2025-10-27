from django.utils import timezone
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


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
    category = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    SKILL_TYPE = (
        ('teach', 'Can Teach'),
        ('learn', 'Wants to Learn'),
    )
    PROFICIENCY_LEVELS = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    skill_type = models.CharField(max_length=10, choices=SKILL_TYPE)
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS, default='beginner')
    experience_years = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'skill', 'skill_type')

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.skill_type}, {self.proficiency}, {self.experience_years} yrs)"



# models.py

from django.db import models
from django.contrib.auth.models import User

class Exchange(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_exchanges')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_exchanges')
    skill = models.ForeignKey('UserSkill', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.requester.username} ↔ {self.receiver.username} ({self.skill.skill.name})"
