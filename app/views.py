from django.http.response import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from .forms import *
from django.contrib.auth import authenticate, login, logout
from account.models import Account, Follower
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


def getTVInfo(id):
    response = requests.get(
        f'https://api.themoviedb.org/3/tv/{id}?api_key=09dbf57fe94efeab48abeb2a2e2d1ca5&language=en-US')
    return response.json()


def searchMovieByKeyword(keyword):
    response = requests.get(
        f'https://api.themoviedb.org/3/search/movie?api_key=09dbf57fe94efeab48abeb2a2e2d1ca5&language=en-US&query={keyword}&page=1&include_adult=false')
    return response.json()['results']


def searchTVByKeyword(keyword):
    response = requests.get(
        f'https://api.themoviedb.org/3/search/tv?api_key=09dbf57fe94efeab48abeb2a2e2d1ca5&language=en-US&query={keyword}&page=1&include_adult=false')
    return response.json()['results']


def searchMovies(request):
    if request.method == "POST":
        keyword = json.loads(request.body.decode("utf-8"))['keyword']
        if(len(keyword) > 0):
            results = searchMovieByKeyword(keyword)

            return JsonResponse({"results": results})
        else:
            return JsonResponse({'results': []})


def searchTV(request):
    if request.method == "POST":
        keyword = json.loads(request.body.decode("utf-8"))['keyword']
        if(len(keyword) > 0):
            results = searchTVByKeyword(keyword)

            return JsonResponse({"results": results})
        else:
            return JsonResponse({'results': []})


def searchUsers(request):
    if request.method == "POST":
        keyword = json.loads(request.body.decode("utf-8"))['keyword']
        results = []
        if(len(keyword) > 0):
            data = Account.objects.filter(
                username__icontains=keyword, is_staff=False).exclude(username=request.user.username)
            for result in data:
                results.append({"username": result.username,
                               "profilePic": result.profile_pic.url})

            return JsonResponse({"results": results})
        else:
            return JsonResponse({'results': []})


def movieInfo(request, id):

    # get movie data through API
    response = getMovieInfo(id)
    context = {'response': response, "type": "Movie"}

    # have to use filter bcoz get() method does not have attribute exists()
    item = List.objects.filter(user=request.user, movie_id=id)

    # if the item already exists in database display its values
    if item.exists():
        # .first used bcoz filter returns a queryset
        context['initial'] = {'status': item.first().status,
                              'score': item.first().score,
                              'favorite': item.first().favorite, }

    return render(request, 'app/info.html', context)


def TVinfo(request, id):

    # get Tv show data through API
    response = getTVInfo(id)
    context = {'response': response, 'type': "TV"}

    # have to use filter bcoz get() method does not have attribute exists()
    item = List.objects.filter(user=request.user, movie_id=id)

    # if the item already exists in database display its values
    if item.exists():
        # .first used bcoz filter returns a queryset
        context['initial'] = {'status': item.first().status,
                              'score': item.first().score,
                              'favorite': item.first().favorite, }

    return render(request, 'app/info.html', context)


def update(request, id, type):
    if request.method == "POST":
        # have to use filter bcoz get() method does not have attribute exists()
        item = List.objects.filter(user=request.user, movie_id=id)
        # to update existing listing
        data = json.loads(request.body.decode("utf-8"))
        print(data)
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
            form.instance.type = type
            form.instance.favorite = data.get("favorite")
            form.save()

    return HttpResponse('')


def profile(request, username):

    if request.method == "POST":
        instance = Account.objects.get(username=username)
        instance.profile_pic = request.FILES['file']
        instance.save()

    account = Account.objects.filter(username=username)
    if not account:
        return HttpResponse(status_code=404)
    """
        to check if the user has permission to edit the list.
        same view is called when viewing our own or others profile, so permission variable is  created.
    """
    permission = username == request.user.username

    # to check if the requested user is already being followed
    following = Follower.objects.filter(
        person=request.user, following__username=username).exists()

    # get the profile pic url
    profilePic = account.first().profile_pic.url

    context = {'username': username,
               'permission': permission, "following": following, "profilePic": profilePic}

    if permission:
        followingList = Follower.objects.filter(person=request.user)
        context["followingList"] = followingList

    return render(request, 'app/profile.html', context)


def list(request, username):

    list = List.objects.filter(user__username=username)
    distribution = {'total': len(list), 'Watching': 0,
                    'Plan to watch': 0, 'Completed': 0, 'On hold': 0}

    data = []

    if list.exists():
        for item in list:

            if item.status == 'Watching':
                distribution['Watching'] += 1
            elif item.status == 'Plan to watch':
                distribution['Plan to watch'] += 1
            elif item.status == 'Completed':
                distribution['Completed'] += 1
            elif item.status == 'On hold':
                distribution['On hold'] += 1

            if item.type == "Movie":
                response = getMovieInfo(item.movie_id)
                data.append({"movie_id": item.movie_id, "type": item.type,
                            "title": response.get('title'), "status": item.status, "score": item.score, "img": response.get('poster_path'), "backdrop": response.get('backdrop_path'), "favorite": item.favorite, })
            else:
                response = getTVInfo(item.movie_id)
                data.append({"movie_id": item.movie_id, "type": item.type,
                             "title": response.get('name'), "status": item.status, "score": item.score, "img": response.get('poster_path'), "backdrop": response.get('backdrop_path'), "favorite": item.favorite, })

    query = {"data": data, "distribution": distribution}

    return JsonResponse(query)


def remove(request, id):
    item = List.objects.get(user=request.user, movie_id=id)
    item.delete()
    return HttpResponse('')


def follow(request, username):
    following = Account.objects.get(username=username)
    instance = Follower(person=request.user, following=following)
    instance.save()
    return HttpResponse('')


def unfollow(request, username):
    following = Account.objects.get(username=username)
    instance = Follower.objects.get(person=request.user, following=following)
    instance.delete()
    return HttpResponse('')


def updateProfilePic(request, username):
    print(request.POST)
    return HttpResponse('')
