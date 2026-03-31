from moodle.models import Task
from django.contrib import admin


# Register your models here.
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'description')
    ordering = ('id',)
    list_per_page = 10
    list_display_links = ('id', 'title')
    list_editable = ('description',)
    list_max_show_all = 10
    list_select_related = True
    list_prefetch_related = True