# 项目根目录的 urls.py
from django.contrib import admin
from django.urls import path, include
from search.views import SearchView

urlpatterns = [
# 确保引入了 user 应用的 urls.py

    path("search/",SearchView.as_view(), name="detail"),


]
