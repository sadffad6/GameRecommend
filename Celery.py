import os
from celery import Celery

# 设置Django项目的配置模块
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "RecommendSys.settings")

app = Celery('RecommendSys')

# 从Django的settings文件中加载Celery配置
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现任务模块，这里假设任务模块都在名为'tasks'的目录下
app.autodiscover_tasks(['tasks'])