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


class Exchange(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dispute', 'Dispute'),
        ('cancelled', 'Cancelled'),
    ]

    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exchanges_as_user1'
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exchanges_as_user2'
    )

    skill1 = models.ForeignKey(
        Skill,
        on_delete=models.SET_NULL,
        null=True,
        related_name='offered_exchanges'
    )
    skill2 = models.ForeignKey(
        Skill,
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_exchanges'
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user1.username} ↔ {self.user2.username} ({self.skill1} ↔ {self.skill2})"

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Exchange'
        verbose_name_plural = 'Exchanges'
