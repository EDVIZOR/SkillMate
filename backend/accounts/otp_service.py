"""
Professional OTP service using Django cache instead of database
OTP data is stored temporarily and automatically expires
Only USER data is saved to database after successful verification
"""
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from typing import Tuple, Optional
import random
import string

OTP_CACHE_TIMEOUT = 600  # 10 minutes in seconds
OTP_CACHE_PREFIX = 'otp_'
USER_DATA_CACHE_PREFIX = 'user_data_'

class OTPService:
    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    @staticmethod
    def store_otp(email: str, otp_code: str, user_data: dict):
        """
        Store OTP and user data in cache (temporary storage)
        Automatically expires after 10 minutes
        """
        cache_key = f"{OTP_CACHE_PREFIX}{email}"
        user_data_key = f"{USER_DATA_CACHE_PREFIX}{email}"
        
        # Store OTP with expiration
        cache.set(cache_key, otp_code, timeout=OTP_CACHE_TIMEOUT)
        
        # Store user data with expiration
        cache.set(user_data_key, user_data, timeout=OTP_CACHE_TIMEOUT)
        
        return True
    
    @staticmethod
    def verify_otp(email: str, otp_code: str) -> Tuple[bool, Optional[dict]]:
        """
        Verify OTP code
        Returns: (is_valid, user_data)
        """
        cache_key = f"{OTP_CACHE_PREFIX}{email}"
        user_data_key = f"{USER_DATA_CACHE_PREFIX}{email}"
        
        stored_otp = cache.get(cache_key)
        user_data = cache.get(user_data_key)
        
        if not stored_otp:
            return False, None
        
        if stored_otp != otp_code:
            return False, None
        
        # OTP is valid, return user data and delete from cache
        cache.delete(cache_key)
        cache.delete(user_data_key)
        
        return True, user_data
    
    @staticmethod
    def resend_otp(email: str) -> Tuple[Optional[str], Optional[dict]]:
        """
        Generate new OTP for existing email
        Returns: (new_otp_code, user_data)
        """
        user_data_key = f"{USER_DATA_CACHE_PREFIX}{email}"
        user_data = cache.get(user_data_key)
        
        if not user_data:
            return None, None
        
        # Generate new OTP
        new_otp = OTPService.generate_otp()
        
        # Store new OTP
        cache_key = f"{OTP_CACHE_PREFIX}{email}"
        cache.set(cache_key, new_otp, timeout=OTP_CACHE_TIMEOUT)
        
        return new_otp, user_data
    
    @staticmethod
    def get_user_data(email: str) -> dict:
        """Get stored user data without verifying OTP"""
        user_data_key = f"{USER_DATA_CACHE_PREFIX}{email}"
        return cache.get(user_data_key)
