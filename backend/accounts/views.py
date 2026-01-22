from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import SignupSerializer, OTPVerifySerializer, LoginSerializer, ResendOTPSerializer
from django.contrib.auth import login
from rest_framework.authtoken.models import Token
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .email_templates import get_welcome_email_html

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """Handle user signup and send OTP"""
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        result = serializer.save()
        return Response(result, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and create user account"""
    serializer = OTPVerifySerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.create_user()
            # Create or get token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            # Send welcome email after successful verification
            try:
                user_name = user.first_name if user.first_name else None
                html_content = get_welcome_email_html(user_name, user.email)
                plain_text = f"""Welcome to SkillMate, {user_name if user_name else 'there'}! 🎉

Your email has been successfully verified! You're all set to start your engineering domain discovery journey.

What SkillMate Offers You:
🎯 AI-Powered Domain Discovery - Answer simple questions and get personalized recommendations
💻 Explore 5 CS Domains - Software Development, AI & ML, Data Science, Cybersecurity, Cloud & DevOps
📊 Personalized Recommendations - Tailored suggestions based on your interests
🎓 Beginner-Friendly Approach - Perfect for first-year engineering students
🤝 Supportive Community - Connect with other students on the same journey
💜 No Pressure, Just Guidance - Explore at your own pace

Ready to start? Log in to your SkillMate dashboard and begin your domain discovery journey today!

Visit: http://localhost:3000/login

Questions? We're here to help!

© 2024 SkillMate. All rights reserved."""
                
                welcome_email = EmailMultiAlternatives(
                    subject='Welcome to SkillMate! 🎉 Your Account is Ready',
                    body=plain_text,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email],
                )
                welcome_email.attach_alternative(html_content, "text/html")
                welcome_email.send()
            except Exception as email_error:
                # Don't fail the verification if email fails, just log it
                print(f"Failed to send welcome email: {str(email_error)}")
            
            return Response({
                'message': 'Account created successfully!',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.first_name,
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """Handle user login"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        # Create or get token for the user
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Login successful',
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.first_name,
            }
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """Resend OTP to user's email"""
    serializer = ResendOTPSerializer(data=request.data)
    if serializer.is_valid():
        try:
            result = serializer.resend_otp()
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
