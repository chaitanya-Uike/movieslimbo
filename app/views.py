from typing import Text
from django.http.response import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from .forms import *
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
import requests
import json


# Create your views here.

api_key = '09dbf57fe94efeab48abeb2a2e2d1ca5'


def registerPage(request):
    form = CreateUserForm()
    if request.method == 'POST':
        data = json.loads(request.body.decode("utf-8"))
        form = CreateUserForm(data)
        if form.is_valid():
            form.save()
            return redirect('login')
        else:
            return HttpResponse(str(form.errors), status=403)

    context = {'form': form}
    return render(request, 'app/register.html', context)


def loginPage(request):
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))
        username = data['username']
        password = data['password']

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponse('OK', status=200)
        else:
            return HttpResponse('Unauthorized', status=401)

    return render(request, 'app/login.html')


def logoutUser(request):
    logout(request)
    return redirect('login')


def home(request):
    context = {}
    if request.user.is_authenticated:
        user = request.user
        context = {'user': user}
        return render(request, 'app/user_home.html', context)
    else:
        return render(request, 'app/anonymous_home.html', context)


def getMovieInfo(id):
    response = requests.get(
        f'https://api.themoviedb.org/3/movie/{id}?api_key=09dbf57fe94efeab48abeb2a2e2d1ca5&language=en-US')
    return response.json()


def searchMovie(keyword):
    response = requests.get(
        f'https://api.themoviedb.org/3/search/movie?api_key=09dbf57fe94efeab48abeb2a2e2d1ca5&language=en-US&query={keyword}&page=1&include_adult=false')
    return response.json()['results']


def searchMovies(request):
    if request.method == "POST":
        keyword = json.loads(request.body.decode("utf-8"))['keyword']
        if(len(keyword) > 0):
            results = searchMovie(keyword)

            return JsonResponse({"results": results})
        else:
            return JsonResponse({'results': []})


def searchUsers(request):
    if request.method == "POST":
        keyword = json.loads(request.body.decode("utf-8"))['keyword']
        results = []
        if(len(keyword) > 0):
            data = User.objects.filter(
                username__icontains=keyword, is_staff=False)
            for result in data:
                results.append({"username": result.username})

            return JsonResponse({"results": results})
        else:
            return JsonResponse({'results': []})


def info(request, id):

    # get movie data through API
    response = getMovieInfo(id)
    context = {'response': response}

    # have to use filter bcoz get() method does not have attribute exists()
    item = List.objects.filter(user=request.user, movie_id=id)

    # if the item already exists in database display its values
    if item.exists():
        # .first used bcoz filter returns a queryset
        context['initial'] = {'status': item.first().status,
                              'score': item.first().score}

    return render(request, 'app/info.html', context)


def update(request, id):
    if request.method == "POST":
        # have to use filter bcoz get() method does not have attribute exists()
        item = List.objects.filter(user=request.user, movie_id=id)
        # to update existing listing
        data = json.loads(request.body.decode("utf-8"))
        if item.exists():
            # .first() is used bcoz item is a queryset
            form = AddListItemForm(data, instance=item.first())
            # to add a new listing
        else:
            form = AddListItemForm(data)

        # saving to database
        if form.is_valid():
            form.instance.user = request.user
            form.instance.movie_id = id
            form.save()

    return HttpResponse('')


def profile(request, username):
    """ 
        to check if the user has permission to edit the list.
        same view is called when viewing our own or others profile, so permission variable is  created.
    """
    permission = username == request.user.username
    context = {'username': username, 'permission': permission}

    class Data:
        def __init__(self, id, title, status, score, img, backdrop):
            self.movie_id = id
            self.title = title
            self.status = status
            self.score = score
            self.img = img
            self.backdrop = backdrop

    # to access the field of parent model use __
    itemList = List.objects.filter(user__username=username)
    if itemList.exists():
        data = []
        for item in itemList:
            response = requests.get(
                f'https://api.themoviedb.org/3/movie/{item.movie_id}?api_key=09dbf57fe94efeab48abeb2a2e2d1ca5&language=en-US')

            data.append(Data(item.movie_id, response.json(
            )["title"], item.status, item.score, response.json()["poster_path"], response.json()["backdrop_path"],).__dict__)

        context['data'] = data
    return render(request, 'app/profile.html', context)


def edit(request, user, id):
    if request.method == "POST":
        item = List.objects.get(
            user__username=user, movie_id=id)
        form = AddListItemForm(request.POST, instance=item)
        if form.is_valid():
            form.save()
    return redirect(request.META.get('HTTP_REFERER'))


def remove(request, id):
    item = List.objects.get(user=request.user, movie_id=id)
    item.delete()
    return HttpResponse('')
