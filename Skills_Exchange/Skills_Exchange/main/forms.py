from django import forms
from .models import UserProfile, Skill

class UserProfileForm(forms.ModelForm):
    skills_have = forms.ModelMultipleChoiceField(
        queryset=Skill.objects.none(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Skills You Can Teach"
    )
    skills_want = forms.ModelMultipleChoiceField(
        queryset=Skill.objects.none(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Skills You Want to Learn"
    )

    class Meta:
        model = UserProfile
        fields = ["full_name", "bio", "location", "certifications", "skills_have", "skills_want"]
