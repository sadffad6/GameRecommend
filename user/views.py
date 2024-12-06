from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework import status
import redis
from RecommendSys.settings import REDIS_CONFIG
import redis

# 根据配置创建Redis连接实例
redis_conn = redis.Redis(
    host=REDIS_CONFIG['host'],
    port=REDIS_CONFIG['port'],
    db=REDIS_CONFIG['db']
)
# Cel
class RegisterView(APIView):
    permission_classes = [AllowAny]  # 注册界面允许公开访问

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"status": 400, "message": "用户名和密码不能为空"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"status": 400, "message": "用户名已存在"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User(username=username)
            user.set_password(password)  # 使用加密的密码
            user.save()

            # 在Redis中设置首次登录标识为True
            redis_conn.set(f"first_login:{user.id}", "true")

            return Response({"status": 200, "message": "注册成功"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"status": 400, "message": f"注册失败：{e}"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]  # 登录界面允许公开访问

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"status": 400, "message": "用户名和密码不能为空"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)

            # 检查Redis中该用户的首次登录标识
            first_login_status = redis_conn.get(f"first_login:{user.id}")
            is_first_login = first_login_status == b"true"

            return Response({
                "status": 200,
                "message": "登录成功",
                "data": {
                    "username": user.username,
                    "token": token.key
                },
                "isFirstLogin": is_first_login
            }, status=status.HTTP_200_OK)
        else:
            return Response({"status": 400, "message": "用户名或密码错误"}, status=status.HTTP_400_BAD_REQUEST)