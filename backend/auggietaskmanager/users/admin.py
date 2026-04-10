from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'schoolYear', 'major', 'minor', 'bio', 'created_at')
    list_filter = ('schoolYear', 'major', 'minor')
    search_fields = ('user__username', 'user__email', 'bio')
    ordering = ('user__username',)
    list_per_page = 10
    list_display_links = ('user', 'schoolYear')
    list_editable = ('major', 'minor', 'bio')
    list_max_show_all = 10
    list_select_related = True
    list_prefetch_related = True
