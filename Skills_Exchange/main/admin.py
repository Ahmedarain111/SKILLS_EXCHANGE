from django.contrib import admin
from .models import Skill, Category, UserProfile, UserSkill, Exchange, Message

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category")
    search_fields = ("name", "category")
    list_filter = ("category",)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "timestamp", "is_read")
    search_fields = ("sender__username", "receiver__username", "content")
    list_filter = ("is_read", "timestamp")
    readonly_fields = ("timestamp",)

admin.site.register(Category)
admin.site.register(UserProfile)
admin.site.register(UserSkill)
admin.site.register(Exchange)
