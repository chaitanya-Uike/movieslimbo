from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.registerPage, name='register'),
    path('login/', views.loginPage, name='login'),
    path('logout/', views.logoutUser, name='logout'),
    path('home/', views.home, name='home'),
    path('searchMovies/', views.searchMovies, name='searchMovies'),
    path('searchTV/', views.searchTV, name='searchTV'),
    path('searchUsers/', views.searchUsers, name='searchUsers'),
    path('info/movie/<str:id>/', views.movieInfo, name='movieInfo'),
    path('info/TV/<str:id>/', views.TVinfo, name='TVinfo'),
    path('update/<str:id>/<str:type>/', views.update, name="update"),
    path('remove/<str:id>/', views.remove, name="remove"),
    path('profile/<str:username>/', views.profile, name="profile"),
    path('list/<str:username>/', views.list, name="list"),
]
