# 项目根目录的 urls.py
from django.contrib import admin
from django.urls import path, include
from home.views  import HomeView,DetailView
urlpatterns = [
     # 确保引入了 user 应用的 urls.py
    path("home/", HomeView.as_view(), name="home"),
    path("detail/<int:game_id>/", DetailView.as_view(), name="detail"),

]
