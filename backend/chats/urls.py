from django.urls import path
from . import views

app_name = 'chats'

urlpatterns = [
    path('', views.chat_list_create, name='chat_list_create'),
    path('<int:chat_id>/', views.chat_detail, name='chat_detail'),
    path('<int:chat_id>/messages/', views.save_chat_messages, name='save_chat_messages'),
    path('<int:chat_id>/message/', views.add_message, name='add_message'),
    path('<int:chat_id>/share/', views.share_chat, name='share_chat'),
    path('create-with-messages/', views.create_chat_with_messages, name='create_chat_with_messages'),
    path('share/<str:share_id>/', views.get_shared_chat, name='get_shared_chat'),
]
