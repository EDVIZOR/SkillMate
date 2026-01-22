from django.contrib import admin
from .models import Chat, ChatMessage


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'user', 'share_id', 'is_shared', 'created_at', 'updated_at']
    list_filter = ['is_shared', 'created_at']
    search_fields = ['title', 'share_id', 'user__email']
    readonly_fields = ['share_id', 'created_at', 'updated_at']
    raw_id_fields = ['user']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'chat', 'message_type', 'content_preview', 'is_error', 'created_at']
    list_filter = ['message_type', 'is_error', 'created_at']
    search_fields = ['content', 'chat__title']
    raw_id_fields = ['chat']
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'
