from django.contrib import admin

from account.models import Account, Follower

admin.site.register(Account)
admin.site.register(Follower)
