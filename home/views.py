from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from home.models import Games  # 引入自定义模型
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from home.models import Games, GameComment
from django.contrib.auth.models import User
from django.http import Http404
from rest_framework import status, permissions
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from home.models import Games, GameType, GameTypeRelation,Developer,UserPreference
from django.db.models import Prefetch,Q



class UserPreferenceView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # 查询游戏类型
            types = GameType.objects.values("type_id", "type_name")

            # 查询开发厂商
            developers = Developer.objects.values("id", "name")

            # 构造响应数据
            return Response({
                "status": 200,
                "types": list(types),  # 将 QuerySet 转为列表
                "developers": list(developers),  # 将 QuerySet 转为列表
            }, status=200)
        except Exception as e:
            return Response({"status": 500, "message": str(e)}, status=500)

    def post(self, request):
        """
        更新用户的偏好设置
        """
        user = request.user
        game_types = request.data.get("game_types", [])  # 游戏类型ID列表
        developers = request.data.get("developers", [])  # 开发商ID列表

        if not isinstance(game_types, list) or not isinstance(developers, list):
            return Response({"status": 400, "message": "Invalid data format. Both 'game_types' and 'developers' must be arrays."},
                            status=400)

        try:
            # 获取或创建用户偏好记录
            user_preference, created = UserPreference.objects.get_or_create(user=user)

            # 更新游戏类型偏好
            if game_types:
                game_type_objects = GameType.objects.filter(type_id__in=game_types)
                user_preference.game_types.set(game_type_objects)  # 使用 set() 替换现有的关系
            else:
                user_preference.game_types.clear()  # 如果为空则清除关系

            # 更新开发商偏好
            if developers:
                developer_objects = Developer.objects.filter(id__in=developers)
                user_preference.developers.set(developer_objects)  # 使用 set() 替换现有的关系
            else:
                user_preference.developers.clear()  # 如果为空则清除关系

            return Response({"status": 200, "message": "Preferences updated successfully."})
        except Exception as e:
            return Response({"status": 500, "message": str(e)}, status=500)


class RecommendationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        按用户评分记录或偏好推荐游戏列表。
        """
        try:
            user = request.user

            # 检查用户是否有评分记录
            user_has_rated = GameComment.objects.filter(user=user).exists()

            if not user_has_rated:
                # 如果用户没有评分记录，按照偏好推荐
                try:
                    user_preference = UserPreference.objects.get(user=user)
                    preferred_game_types = user_preference.game_types.all()  # 偏好类型
                    preferred_developers = user_preference.developers.all()  # 偏好开发商
                except UserPreference.DoesNotExist:
                    # 如果没有设置偏好，默认返回空查询集
                    preferred_game_types = GameType.objects.none()
                    preferred_developers = Developer.objects.none()

                # 根据偏好筛选游戏
                games = Games.objects.prefetch_related(
                    Prefetch(
                        'game_type_relations',
                        queryset=GameTypeRelation.objects.select_related('type'),
                        to_attr='related_types'
                    )
                ).select_related('developer').filter(
                    Q(game_type_relations__type__in=preferred_game_types) |  # 偏好类型
                    Q(developer__in=preferred_developers)  # 偏好开发商
                ).distinct().order_by('-game_rating')

                # 构造推荐游戏列表数据
                preferred_game_list = [
                    {
                        "game_id": game.game_id,
                        "game_name": game.game_name,
                        "game_platform": game.game_platform,
                        "game_rating": game.game_rating,
                        "game_cover": game.game_cover,
                        "developer": game.developer.name if game.developer else "Unknown Developer",
                        "tags": [relation.type.type_name for relation in game.related_types]
                    }
                    for game in games
                ]

                return Response({
                    "status": 200,
                    "message": "Recommended games based on user preferences.",
                    "data": preferred_game_list
                }, status=200)

            # 用户有评分记录，根据评分和偏好推荐
            try:
                user_preference = UserPreference.objects.get(user=user)
                preferred_game_types = user_preference.game_types.all()
                preferred_developers = user_preference.developers.all()
            except UserPreference.DoesNotExist:
                preferred_game_types = GameType.objects.none()
                preferred_developers = Developer.objects.none()

            # 根据用户评分和偏好推荐游戏
            games = Games.objects.prefetch_related(
                Prefetch(
                    'game_type_relations',
                    queryset=GameTypeRelation.objects.select_related('type'),
                    to_attr='related_types'
                )
            ).select_related('developer').filter(
                Q(game_type_relations__type__in=preferred_game_types) |
                Q(developer__in=preferred_developers)
            ).distinct().order_by('-game_rating')

            # 构造推荐游戏列表数据
            recommended_game_list = [
                {
                    "game_id": game.game_id,
                    "game_name": game.game_name,
                    "game_platform": game.game_platform,
                    "game_rating": game.game_rating,
                    "game_cover": game.game_cover,
                    "developer": game.developer.name if game.developer else "Unknown Developer",
                    "tags": [relation.type.type_name for relation in game.related_types]
                }
                for game in games
            ]

            return Response({
                "status": 200,
                "message": "Recommended games based on user preferences and ratings.",
                "data": recommended_game_list
            }, status=200)

        except Exception as e:
            return Response({"status": 500, "message": str(e)}, status=500)

class HomeView(APIView):
    #
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        获取游戏列表并关联类型和开发厂商
        """
        try:
            # 使用正确的 related_name 预加载类型关系
            games = Games.objects.prefetch_related(
                Prefetch(
                    'game_type_relations',  # 使用 GameTypeRelation 的 related_name
                    queryset=GameTypeRelation.objects.select_related('type'),  # 优化查询
                    to_attr='related_types'  # 自定义属性名称
                )
            ).select_related('developer').order_by('-game_rating')  # 按评分降序排序，并预加载开发厂商

            # 构造返回数据
            game_list = [
                {
                    "game_id": game.game_id,
                    "game_name": game.game_name,
                    "game_platform": game.game_platform,
                    "game_rating": game.game_rating,
                    "game_cover": game.game_cover,
                    "developer": game.developer.name if game.developer else "Unknown Developer",  # 添加开发厂商信息
                    "tags": [relation.type.type_name for relation in game.related_types]  # 提取类型名称
                }
                for game in games
            ]

            return Response({"status": 200, "data": game_list}, status=200)
        except Exception as e:
            return Response({"status": 500, "message": str(e)}, status=500)




class DetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, game_id):
        """
        获取游戏详情、类型、开发厂商和评论
        """
        try:
            # 查询游戏详情并预加载开发厂商信息
            game = Games.objects.select_related('developer').filter(game_id=game_id).first()
            if not game:
                return Response({"status": 404, "message": "Game not found"}, status=404)

            game_details = {
                "game_id": game.game_id,
                "game_name": game.game_name,
                "game_platform": game.game_platform,
                "game_rating": game.game_rating,
                "game_description": game.game_description,
                "game_cover": game.game_cover,
                "developer": game.developer.name if game.developer else "Unknown Developer"  # 添加开发厂商信息
            }

            # 查询关联的类型
            tags = GameTypeRelation.objects.filter(game_id=game_id).select_related('type').values_list('type__type_name', flat=True)

            # 查询评论
            comments = GameComment.objects.filter(game_id=game_id).values(
                'user_id', 'user__username', 'comment', 'user_rating', 'timestamp'
            )
            new_comments = [
                {
                    'user_id': comment['user_id'],
                    'username': comment['user__username'],
                    'comment': comment['comment'],
                    'user_rating': comment['user_rating'],
                    'timestamp': comment['timestamp']
                }
                for comment in comments
            ]

            # 构造返回数据
            response_data = {
                "game_details": game_details,
                "tags": list(tags),  # 将类型数据加入返回
                "comments": new_comments
            }
            return Response({"status": 200, "data": response_data}, status=200)

        except Exception as e:
            return Response({"status": 500, "message": str(e)}, status=500)


    def post(self, request, game_id):
        """
        增加用户评论
        """
        user = request.user
        comment_text = request.data.get("comment")
        user_rating = request.data.get("user_rating")  # 修改为 user_rating

        if not game_id or not comment_text or user_rating is None:
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
            user_rating=user_rating  # 保存用户评分
        )

        return Response({
            "status": 201,
            "message": "Comment added successfully",
            "data": {
                "comment_id": comment.id,
                "comment": comment.comment,
                "user_rating": comment.user_rating
            }
        }, status=status.HTTP_201_CREATED)

    def put(self, request, game_id):
        """
        修改过往评论
        """
        user = request.user
        comment_text = request.data.get("comment")
        user_rating = request.data.get("user_rating")  # 修改为 user_rating

        if not game_id or not comment_text or user_rating is None:
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
        comment.user_rating = user_rating  # 更新用户评分
        comment.save()

        return Response({
            "status": 200,
            "message": "Comment updated successfully",
            "data": {
                "comment_id": comment.id,
                "comment": comment.comment,
                "user_rating": comment.user_rating
            }
        }, status=status.HTTP_200_OK)