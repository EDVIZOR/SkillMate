from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Chat, ChatMessage
from .serializers import (
    ChatSerializer, ChatMessageSerializer,
    CreateChatSerializer, UpdateChatSerializer, ShareChatSerializer
)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_list_create(request):
    """Get all chats for user or create a new chat"""
    if request.method == 'GET':
        chats = Chat.objects.filter(user=request.user).prefetch_related('messages')
        serializer = ChatSerializer(chats, many=True, context={'request': request})
        return Response(serializer.data)
    
    # POST: Create new chat
    serializer = CreateChatSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    chat = Chat.objects.create(
        user=request.user,
        title=serializer.validated_data.get('title', 'New Conversation')
    )
    
    serializer = ChatSerializer(chat, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def chat_detail(request, chat_id):
    """Get, update, or delete a specific chat"""
    chat = get_object_or_404(Chat, id=chat_id, user=request.user)
    
    if request.method == 'GET':
        serializer = ChatSerializer(chat, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = UpdateChatSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if 'title' in serializer.validated_data:
            chat.title = serializer.validated_data['title']
        if 'is_shared' in serializer.validated_data:
            chat.is_shared = serializer.validated_data['is_shared']
        
        chat.save()
        serializer = ChatSerializer(chat, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_chat_messages(request, chat_id):
    """Save messages to a chat"""
    chat = get_object_or_404(Chat, id=chat_id, user=request.user)
    
    messages_data = request.data.get('messages', [])
    if not isinstance(messages_data, list):
        return Response(
            {'error': 'messages must be a list'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        # Delete existing messages (or keep them and append - your choice)
        # For now, we'll replace them
        chat.messages.all().delete()
        
        # Create new messages
        messages_to_create = []
        for msg_data in messages_data:
            messages_to_create.append(
                ChatMessage(
                    chat=chat,
                    message_type=msg_data.get('type', 'user'),
                    content=msg_data.get('content', ''),
                    is_error=msg_data.get('isError', False)
                )
            )
        
        ChatMessage.objects.bulk_create(messages_to_create)
    
    # Return updated chat
    serializer = ChatSerializer(chat, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_message(request, chat_id):
    """Add a single message to a chat"""
    chat = get_object_or_404(Chat, id=chat_id, user=request.user)
    
    message_type = request.data.get('type')
    content = request.data.get('content', '')
    is_error = request.data.get('isError', False)
    
    if message_type not in ['user', 'assistant']:
        return Response(
            {'error': 'type must be "user" or "assistant"'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    message = ChatMessage.objects.create(
        chat=chat,
        message_type=message_type,
        content=content,
        is_error=is_error
    )
    
    serializer = ChatMessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def share_chat(request, chat_id):
    """Share or unshare a chat"""
    chat = get_object_or_404(Chat, id=chat_id, user=request.user)
    
    serializer = ShareChatSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    chat.is_shared = serializer.validated_data['is_shared']
    chat.save()
    
    serializer = ChatSerializer(chat, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])  # Public access for shared chats
def get_shared_chat(request, share_id):
    """Get a shared chat by share_id (public access)"""
    chat = get_object_or_404(Chat, share_id=share_id, is_shared=True)
    
    serializer = ChatSerializer(chat, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat_with_messages(request):
    """Create a new chat and save messages in one request"""
    title = request.data.get('title', 'New Conversation')
    messages_data = request.data.get('messages', [])
    
    if not isinstance(messages_data, list):
        return Response(
            {'error': 'messages must be a list'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        # Create chat
        chat = Chat.objects.create(
            user=request.user,
            title=title
        )
        
        # Create messages
        messages_to_create = []
        for msg_data in messages_data:
            messages_to_create.append(
                ChatMessage(
                    chat=chat,
                    message_type=msg_data.get('type', 'user'),
                    content=msg_data.get('content', ''),
                    is_error=msg_data.get('isError', False)
                )
            )
        
        ChatMessage.objects.bulk_create(messages_to_create)
    
    serializer = ChatSerializer(chat, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)
