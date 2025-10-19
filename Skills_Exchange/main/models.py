from django.db import models
from django.conf import settings

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)
    # description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class UserSkill(models.Model):
    ROLE_CHOICES = [
        ('teach', 'Can Teach'),
        ('learn', 'Wants to Learn'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    proficiency = models.IntegerField(default=0)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.get_role_display()})" # type: ignore
