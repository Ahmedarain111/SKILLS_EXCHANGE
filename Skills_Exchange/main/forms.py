from django import forms
from .models import UserProfile, Skill

class UserProfileForm(forms.ModelForm):
    skills_have = forms.ModelMultipleChoiceField(
        queryset=Skill.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Skills You Have"
    )
    skills_want = forms.ModelMultipleChoiceField(
        queryset=Skill.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Skills You Want to Learn"
    )

    class Meta:
        model = UserProfile
        fields = ['full_name', 'bio', 'location', 'certifications']
