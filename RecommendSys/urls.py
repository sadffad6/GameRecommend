# 项目根目录的 urls.py
from itertools import product

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("user.urls")),  # 确保引入了 user 应用的 urls.py
    path("",include("home.urls")),
    path("",include("search.urls"))
]
