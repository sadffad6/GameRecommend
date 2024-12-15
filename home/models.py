from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Developer(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="开发厂商")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "开发厂商"
        verbose_name_plural = "开发厂商列表"


class Games(models.Model):
    id = models.AutoField(primary_key=True)
    game_id = models.CharField(max_length=255, unique=True, verbose_name="实际的游戏id")
    game_name = models.CharField(max_length=255, verbose_name="游戏名称")
    game_platform = models.CharField(max_length=255, verbose_name="游戏平台")
    game_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        verbose_name="游戏评分"
    )
    game_cover = models.URLField(max_length=500, verbose_name="游戏封面 URL")
    game_description = models.TextField(max_length=500, default="Default game description", verbose_name="游戏描述")
    developer = models.ForeignKey(
        'Developer',
        on_delete=models.SET_NULL,  # 删除开发商时设置为 NULL
        null=True,
        blank=True,
        verbose_name="开发厂商"
    )

    def __str__(self):
        return self.game_name

    class Meta:
        verbose_name = "游戏"
        verbose_name_plural = "游戏列表"

class GameComment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="用户")
    game = models.ForeignKey(Games, on_delete=models.CASCADE, to_field='id', verbose_name="游戏")
    user_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        verbose_name="用户评分"
    )
    game_actual_id = models.CharField(max_length=255, verbose_name="游戏实际ID",default=0)
    comment = models.TextField(max_length=1000, verbose_name="评论内容")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="评论时间")  # 默认使用当前时间

    def __str__(self):
        return f'{self.user.username} - {self.game.game_name}'

    class Meta:
        verbose_name = "游戏评论"
        verbose_name_plural = "游戏评论列表"


class GameType(models.Model):
    type_id = models.AutoField(primary_key=True)
    type_name = models.CharField(max_length=64, unique=True, verbose_name="类型名称")

    def __str__(self):
        return self.type_name

    class Meta:
        verbose_name = "游戏类型"
        verbose_name_plural = "游戏类型列表"


class GameTypeRelation(models.Model):
    game = models.ForeignKey(
        Games,
        on_delete=models.CASCADE,
        related_name="game_type_relations",
        verbose_name="游戏"
    )
    type = models.ForeignKey(
        GameType,
        on_delete=models.CASCADE,
        related_name="type_game_relations",
        verbose_name="类型"
    )

    class Meta:
        unique_together = ('game', 'type')
        verbose_name = "游戏类型关系"
        verbose_name_plural = "游戏类型关系列表"


class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="用户")
    game_types = models.ManyToManyField(GameType, blank=True, verbose_name="游戏类型偏好")
    developers = models.ManyToManyField(Developer, blank=True, verbose_name="开发厂商偏好")

    class Meta:
        verbose_name = "用户偏好"
        verbose_name_plural = "用户偏好列表"