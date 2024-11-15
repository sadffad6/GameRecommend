from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from home.models import Games  # 引入自定义模型
from home.models import GameComment
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from home.models import Games, GameComment
from django.contrib.auth.models import User
from django.http import Http404
from rest_framework import status
from django.conf import settings
class HomeView(APIView):
    permission_classes = [IsAuthenticated]  # 仅允许经过认证的用户访问

    def get(self, request):
        # 获取所有的 HomeModel 实例
        homes = Games.objects.all().values('game_id', 'game_name','game_platform','game_rating','game_cover')

        # 将查询结果转换为列表并返回
        return Response({"status": 200, "message": "成功", "data": list(homes)})



class DetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, game_id):
        # 查询游戏详情信息
        try:
            game_details = Games.objects.filter(game_id=game_id).values(
                'game_id', 'game_name', 'game_platform', 'game_rating', 'game_description', 'game_cover'
            ).first()
            if not game_details:
                return Response({"status": 404, "message": "Game not found"}, status=404)

            comments = GameComment.objects.filter(game_id=game_id).values(
                'user_id', 'user__username', 'comment', 'is_recommended', 'timestamp'
            )

            new_comments = [
                {
                    'user_id': comment['user_id'],
                    'username': comment['user__username'],
                    'comment': comment['comment'],
                    'is_recommended': comment['is_recommended'],
                    'timestamp': comment['timestamp']
                }
                for comment in comments
            ]
            #user__username 表示跨表查询


            # 构造返回数据
            response_data = {
                "game_details": game_details,
                "comments": list(new_comments)
            }
            return Response({"status": 200, "data": response_data}, status=200)

        except Exception as e:
            return Response({"status": 500, "message": str(e)}, status=500)

    def post(self, request,game_id):
        """
        增加用户评论
        """
        user = request.user  # 获取当前登录用户
        comment_text = request.POST.get("comment")
        is_recommended = request.POST.get("is_recommended")
        print(comment_text)
        print(is_recommended)
        print(user)
        if not game_id or not comment_text or is_recommended is None:
            return Response({"status": 400, "message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            game = Games.objects.get(game_id=game_id)
        except Games.DoesNotExist:
            return Response({"status": 404, "message": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

        # 检查用户是否已经对该游戏评论
        if GameComment.objects.filter(user=user, game=game).exists():
            return Response({"status": 400, "message": "You have already commented on this game"},
                            status=status.HTTP_400_BAD_REQUEST)

        # 创建评论
        comment = GameComment.objects.create(
            user=user,
            game=game,
            comment=comment_text,
            is_recommended=is_recommended
        )

        return Response({
            "status": 201,
            "message": "Comment added successfully",
            "data": {
                "comment_id": comment.id,
                "comment": comment.comment,
                "is_recommended": comment.is_recommended
            }
        }, status=status.HTTP_201_CREATED)

    def put(self, request,game_id):#用于更新资源
        """
        修改过往评论
        """
        user = request.user  # 获取当前登录用户
        comment_text = request.POST.get("comment")
        is_recommended = request.POST.get("is_recommended")

        if not game_id or not comment_text or is_recommended is None:
            return Response({"status": 400, "message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            game = Games.objects.get(game_id=game_id)
        except Games.DoesNotExist:
            return Response({"status": 404, "message": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

        # 检查评论是否存在
        try:
            comment = GameComment.objects.get(user=user, game=game)
        except GameComment.DoesNotExist:
            return Response({"status": 404, "message": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

        # 修改评论内容
        comment.comment = comment_text
        comment.is_recommended = is_recommended
        comment.save()

        return Response({
            "status": 200,
            "message": "Comment updated successfully",
            "data": {
                "comment_id": comment.id,
                "comment": comment.comment,
                "is_recommended": comment.is_recommended
            }
        }, status=status.HTTP_200_OK)