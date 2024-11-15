from django.db import models
from django.contrib.auth.models import User
class Games(models.Model):
    game_id = models.AutoField(primary_key=True)
    game_name = models.CharField(max_length=255)         # 游戏名称
    game_platform = models.CharField(max_length=255)     # 游戏平台
    game_rating = models.DecimalField(max_digits=3, decimal_places=1)  # 游戏评分
    game_cover = models.URLField(max_length=500)         # 游戏封面 URL
    game_description = models.TextField(max_length=500,default="Default game description")
    def __str__(self):
        return self.name


class GameComment(models.Model):
    user = models.ForeignKey(User,to_field="id", on_delete=models.CASCADE)
    game = models.ForeignKey(Games, to_field="game_id",on_delete=models.CASCADE)
    is_recommended = models.BooleanField()  # True 表示推荐，False 表示不推荐
    comment = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.game.game_name} - {self.rating}"
