from django import forms
from .models import UserProfile, Skill

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ["full_name", "bio", "location", "certifications"]