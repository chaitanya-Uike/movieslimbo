from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class MyAccountManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("users must have an username")

        user = self.model(
            email=self.normalize_email(email),
            username=username,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(
            email=self.normalize_email(email),
            password=password,
            username=username,
        )

        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class Account(AbstractBaseUser):
    email = models.EmailField(max_length=60, unique=True)
    username = models.CharField(max_length=30, unique=True)
    following = models.ManyToManyField(
        'self', through='Follower', symmetrical=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    profile_pic = models.ImageField(default='default.jpg')
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', ]

    objects = MyAccountManager()

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True


class Follower(models.Model):
    person = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name='source')
    following = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name='target')

    def __str__(self):
        return self.person.username + '->' + self.following.username
