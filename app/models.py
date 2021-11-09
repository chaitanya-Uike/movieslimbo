from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.enums import IntegerChoices
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.


class List(models.Model):
    STATUS = (
        ('Watching', 'Watching'),
        ('Plan to watch', 'Plan to watch'),
        ('Completed', 'Completed'),
        ('Rewatching', 'Rewatching'),
        ('On hold', 'On hold'),
        ('Dropped', 'Dropped'),
    )

    SCORE = ((str(x), str(x)) for x in range(1, 11))

    user = models.ForeignKey(User, on_delete=CASCADE)
    movie_id = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS)
    score = models.CharField(max_length=2, choices=SCORE, blank=True)
    date_added = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.user.username + '-' + self.movie_id
