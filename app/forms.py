from django.contrib.auth.forms import UserCreationForm
from account.models import Account
from django import forms
from app.models import List


class CreateUserForm(UserCreationForm):
    class Meta:
        model = Account
        fields = ['username', 'email', 'password1', 'password2']


class AddListItemForm(forms.ModelForm):
    class Meta:
        model = List
        fields = ['status', 'score']
