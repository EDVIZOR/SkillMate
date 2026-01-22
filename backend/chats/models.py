from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import secrets


class Chat(models.Model):
    """Chat conversation model"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chats',
        null=True,
        blank=True,
        help_text="User who created the chat (null for anonymous)"
    )
    title = models.CharField(max_length=200, default='New Conversation')
    share_id = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        help_text="Unique ID for sharing this chat"
    )
    is_shared = models.BooleanField(default=False, help_text="Whether this chat is publicly shared")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} ({self.share_id})"
    
    def save(self, *args, **kwargs):
        if not self.share_id:
            # Generate a unique share ID
            self.share_id = self.generate_share_id()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_share_id():
        """Generate a unique share ID"""
        while True:
            share_id = secrets.token_urlsafe(24)[:24]  # 24 character URL-safe string
            if not Chat.objects.filter(share_id=share_id).exists():
                return share_id


class ChatMessage(models.Model):
    """Individual message in a chat"""
    MESSAGE_TYPES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    content = models.TextField()
    is_error = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."
