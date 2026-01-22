from rest_framework import serializers
from .models import Chat, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'is_error', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatSerializer(serializers.ModelSerializer):
    """Serializer for chat conversations"""
    messages = ChatMessageSerializer(many=True, read_only=True)
    share_url = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = [
            'id', 'title', 'share_id', 'share_url', 'is_shared',
            'message_count', 'messages', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'share_id', 'created_at', 'updated_at']
    
    def get_share_url(self, obj):
        """Generate shareable URL"""
        request = self.context.get('request')
        if request:
            return f"{request.scheme}://{request.get_host()}/chatbot/share/{obj.share_id}"
        return f"/chatbot/share/{obj.share_id}"
    
    def get_message_count(self, obj):
        """Get message count"""
        return obj.messages.count()


class CreateChatSerializer(serializers.Serializer):
    """Serializer for creating a new chat"""
    title = serializers.CharField(max_length=200, required=False, default='New Conversation')


class UpdateChatSerializer(serializers.Serializer):
    """Serializer for updating chat"""
    title = serializers.CharField(max_length=200, required=False)
    is_shared = serializers.BooleanField(required=False)


class ShareChatSerializer(serializers.Serializer):
    """Serializer for sharing a chat"""
    is_shared = serializers.BooleanField(default=True)
