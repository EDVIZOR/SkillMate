from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string
from datetime import timedelta
import json

class OTP(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    # Store user registration data temporarily
    user_data = models.TextField(blank=True, null=True)  # JSON string

    def __str__(self):
        return f"{self.email} - {self.otp_code}"

    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))

    def is_expired(self):
        """Check if OTP has expired"""
        return timezone.now() > self.expires_at

    def get_user_data(self):
        """Get stored user data as dict"""
        if self.user_data:
            return json.loads(self.user_data)
        return None

    def set_user_data(self, data):
        """Store user data as JSON string"""
        self.user_data = json.dumps(data)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # OTP expires in 10 minutes
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)
