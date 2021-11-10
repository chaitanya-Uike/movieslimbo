from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.registerPage, name='register'),
    path('login/', views.loginPage, name='login'),
    path('logout/', views.logoutUser, name='logout'),
    path('home/', views.home, name='home'),
    path('search/', views.search, name='search'),
    path('info/<str:id>/', views.info, name='info'),
    path('update/<str:id>/', views.update, name="update"),
    path('remove/<str:id>/', views.remove, name="remove"),
    path('profile/<str:username>/', views.profile, name="profile"),
]
