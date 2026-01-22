from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .email_templates import get_otp_email_html, get_resend_otp_email_html
from .otp_service import OTPService

class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        # Generate OTP
        otp_code = OTPService.generate_otp()
        
        # Store user data temporarily in cache (not database)
        user_data = {
            'name': validated_data['name'],
            'email': validated_data['email'],
            'password': validated_data['password'],
        }
        
        # Store OTP and user data in cache (temporary, auto-expires)
        OTPService.store_otp(validated_data['email'], otp_code, user_data)
        
        # Send OTP email with beautiful HTML template
        try:
            user_name = validated_data.get('name', '').split()[0] if validated_data.get('name') else None
            html_content = get_otp_email_html(otp_code, user_name)
            plain_text = f'Your SkillMate verification code is: {otp_code}\n\nThis code will expire in 10 minutes.\n\nPlease enter this code on the verification screen to complete your registration.'
            
            email = EmailMultiAlternatives(
                subject='Welcome to SkillMate - Verify Your Email 👋',
                body=plain_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[validated_data['email']],
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
        except Exception as e:
            raise serializers.ValidationError(f"Failed to send email: {str(e)}")
        
        return {
            'email': validated_data['email'],
            'message': 'OTP sent to your email. Please verify to complete registration.'
        }

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # Check if there's user data in cache (pending verification)
        user_data = OTPService.get_user_data(value)
        if not user_data:
            raise serializers.ValidationError("No pending verification found for this email. Please sign up again.")
        return value

    def resend_otp(self):
        email = self.validated_data['email']
        
        # Get new OTP and user data from cache
        new_otp_code, user_data = OTPService.resend_otp(email)
        
        if not new_otp_code or not user_data:
            raise serializers.ValidationError("No pending verification found for this email.")
        
        # Send new OTP email with beautiful HTML template
        try:
            user_name = user_data.get('name', '').split()[0] if user_data and user_data.get('name') else None
            html_content = get_resend_otp_email_html(new_otp_code, user_name)
            plain_text = f'Your new SkillMate verification code is: {new_otp_code}\n\nThis code will expire in 10 minutes.\n\nPlease enter this code on the verification screen to complete your registration.'
            
            email_msg = EmailMultiAlternatives(
                subject='New Verification Code - SkillMate 🔄',
                body=plain_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )
            email_msg.attach_alternative(html_content, "text/html")
            email_msg.send()
            return {'message': 'New OTP sent to your email.'}
        except Exception as e:
            raise serializers.ValidationError(f"Failed to send email: {str(e)}")

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs['email']
        otp_code = attrs['otp_code']
        
        # Verify OTP using cache (not database)
        is_valid, user_data = OTPService.verify_otp(email, otp_code)
        
        if not is_valid:
            if not user_data:
                raise serializers.ValidationError("OTP has expired or not found. Please request a new one.")
            else:
                raise serializers.ValidationError("Invalid OTP code.")
        
        # Store user_data for create_user method
        attrs['user_data'] = user_data
        return attrs

    def create_user(self):
        """Create USER in database after successful OTP verification"""
        user_data = self.validated_data['user_data']
        
        if not user_data:
            raise serializers.ValidationError("User data not found. Please sign up again.")
        
        # Create USER in database (only after successful verification)
        user = User.objects.create_user(
            username=user_data['email'],  # Use email as username
            email=user_data['email'],
            password=user_data['password'],
            first_name=user_data['name'],
        )
        
        # OTP is automatically deleted from cache after verification
        # No need to mark anything - it's already gone from temporary storage
        
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email']
        password = attrs['password']
        
        # Try to find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        # Authenticate user
        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        attrs['user'] = user
        return attrs
