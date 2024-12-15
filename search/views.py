from search.InvertedIndex import InvertedIndex
from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from home.models import Games, GameTypeRelation
import os
import redis
from django.conf import settings  # 导入settings模块以获取配置信息

class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # 优先从路径参数获取 `query`，如果没有则从请求参数中获取
            query = request.GET.get('query', None)
            if not query:
                return Response({"status": 400, "message": "Query parameter is required."}, status=400)

            # 实例化倒排索引类
            inverted_index = InvertedIndex()

            # 加载索引
            index_folder = os.path.join(os.path.dirname(__file__), "..", "index")
            file_path = os.path.join(index_folder, "inverted_index.pickle")
            inverted_index.load_index_from_file(file_path)

            # 执行搜索
            results = inverted_index.search(query)

            # 收集所有匹配的游戏 ID
            matching_game_ids = [doc_id for _, doc_id in results]

            # 查询数据库并按评分排序
            games = Games.objects.prefetch_related(
                Prefetch(
                    'game_type_relations',
                    queryset=GameTypeRelation.objects.select_related('type'),
                    to_attr='related_types'
                )
            ).select_related('developer').filter(
                game_id__in=matching_game_ids
            ).order_by('-game_rating')  # 按评分从高到低排序

            # 构造响应数据
            response_data = []
            for game in games:
                response_data.append({
                    'title': game.game_name,
                    'game_id': game.game_id,
                    'description': game.game_description,
                    'developer': game.developer.name if game.developer else "Unknown Developer",
                    'types': [relation.type.type_name for relation in game.related_types],
                    'rating': float(game.game_rating),
                })

            # 根据配置文件创建Redis连接
            r = redis.Redis(
                host=settings.REDIS_CONFIG['host'],
                port=settings.REDIS_CONFIG['port'],
                db=settings.REDIS_CONFIG['db'],

            )

            # 将搜索结果写入Redis
            cache_key = f"search:{query}"
            r.set(cache_key, str(response_data))

            return Response({"status": 200, "data": response_data}, status=200)
        except Games.DoesNotExist:
            return Response({"status": 404, "message": "Game not found."}, status=404)
        except Exception as e:
            return Response({"status": 500, "message": str(e)}, status=500)