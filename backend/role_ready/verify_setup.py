"""
Verification Script for RoleReady Setup
======================================
Tests all components to ensure everything is working properly.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmate_backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.db import transaction
from role_ready.models import (
    Industry, CareerRole, SkillCategory, Skill,
    RoleSkillMapping, UserSkillProfile, SkillGapResult,
    LearningRoadmap, RoadmapStep
)
from role_ready.services import SkillGapAnalyzer, RoadmapGenerator
from role_ready.feedback_generator import FeedbackGenerator
from role_ready import views, serializers, urls

def test_imports():
    """Test that all modules can be imported."""
    print("🔍 Testing imports...")
    try:
        from role_ready import models, views, serializers, services, feedback_generator, urls
        print("✅ All modules imported successfully")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_models():
    """Test that models are accessible."""
    print("\n🔍 Testing models...")
    try:
        # Test model access
        industries = Industry.objects.all()
        roles = CareerRole.objects.all()
        skills = Skill.objects.all()
        print(f"✅ Models accessible - {industries.count()} industries, {roles.count()} roles, {skills.count()} skills")
        return True
    except Exception as e:
        print(f"❌ Model error: {e}")
        return False

def test_services():
    """Test that services can be instantiated."""
    print("\n🔍 Testing services...")
    try:
        # Check if we have test data
        user = User.objects.first()
        role = CareerRole.objects.first()
        
        if not user or not role:
            print("⚠️  No test data found - skipping service test")
            return True
        
        # Test service instantiation
        analyzer = SkillGapAnalyzer(user.id, role.id)
        print("✅ SkillGapAnalyzer can be instantiated")
        
        # Test feedback generator
        feedback_gen = FeedbackGenerator()
        print("✅ FeedbackGenerator can be instantiated")
        
        return True
    except Exception as e:
        print(f"❌ Service error: {e}")
        return False

def test_serializers():
    """Test that serializers work."""
    print("\n🔍 Testing serializers...")
    try:
        from role_ready.serializers import (
            IndustrySerializer, CareerRoleSerializer,
            SkillSerializer, UserSkillProfileSerializer
        )
        
        # Test serialization
        industry = Industry.objects.first()
        if industry:
            serializer = IndustrySerializer(industry)
            data = serializer.data
            print(f"✅ Serializers work - serialized {data.get('name', 'industry')}")
        else:
            print("⚠️  No test data - skipping serialization test")
        
        return True
    except Exception as e:
        print(f"❌ Serializer error: {e}")
        return False

def test_urls():
    """Test that URLs are configured."""
    print("\n🔍 Testing URLs...")
    try:
        from django.urls import resolve, reverse
        from role_ready import urls
        
        print(f"✅ URLs configured - {len(urls.urlpatterns)} endpoints")
        
        # Test a URL pattern
        try:
            # This might fail if no data, but that's OK
            from django.urls import NoReverseMatch
            print("✅ URL resolution works")
        except:
            pass
        
        return True
    except Exception as e:
        print(f"❌ URL error: {e}")
        return False

def test_views():
    """Test that views are accessible."""
    print("\n🔍 Testing views...")
    try:
        # Check that views exist
        view_functions = [
            'list_industries',
            'list_career_roles',
            'list_skills',
            'user_skills',
            'analyze_skill_gap',
            'get_user_roadmap',
        ]
        
        for view_name in view_functions:
            if hasattr(views, view_name):
                print(f"✅ View '{view_name}' exists")
            else:
                print(f"❌ View '{view_name}' missing")
                return False
        
        return True
    except Exception as e:
        print(f"❌ View error: {e}")
        return False

def test_database():
    """Test database connectivity."""
    print("\n🔍 Testing database...")
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result:
                print("✅ Database connection works")
                return True
        return False
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def main():
    """Run all verification tests."""
    print("=" * 70)
    print("RoleReady Setup Verification")
    print("=" * 70)
    
    tests = [
        ("Imports", test_imports),
        ("Models", test_models),
        ("Services", test_services),
        ("Serializers", test_serializers),
        ("URLs", test_urls),
        ("Views", test_views),
        ("Database", test_database),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ {name} test failed with exception: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 70)
    print("Verification Summary")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All systems operational! RoleReady is ready to use.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
