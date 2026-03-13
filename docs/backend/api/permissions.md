# Permissions & Authentication

---

## JWT Authentication

```python
# settings.py

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'TOKEN_OBTAIN_SERIALIZER': 'users.serializers.CustomTokenObtainSerializer',
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/minute',
        'user': '100/minute',
    },
}
```

---

## Role-Based Permissions

**File:** `core/permissions.py`

```python
class HasRole(BasePermission):
    def __init__(self, required_role):
        self.required_role = required_role

    def has_permission(self, request, view):
        return request.user.roles.filter(role=self.required_role).exists()


class IsLearner(BasePermission):
    def has_permission(self, request, view):
        return request.user.roles.filter(role='learner').exists()


class IsTrainer(BasePermission):
    def has_permission(self, request, view):
        return request.user.roles.filter(role='trainer').exists()


class IsIQA(BasePermission):
    def has_permission(self, request, view):
        return request.user.roles.filter(role='iqa').exists()


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.roles.filter(role='admin').exists()


class IsAssignedTrainer(BasePermission):
    def has_object_permission(self, request, view, obj):
        enrolment = getattr(obj, 'enrolment', obj)
        return enrolment.assigned_trainer == request.user


class IsEnrolmentOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        enrolment = getattr(obj, 'enrolment', obj)
        return enrolment.learner == request.user
```
