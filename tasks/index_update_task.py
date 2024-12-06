from celery import Celery,shared_task
from search.InvertedIndex import InvertedIndex
from home.models import Games
import os
@shared_task
def check_and_update_index():
    index=InvertedIndex()
    max_game_id_in_db = Games.objects.latest('game_id').game_id

    if max_game_id_in_db>index.last_indexed_game_id:
        index.update_index()
        index_folder = os.path.join(os.path.dirname(__file__), "..", "index")
        file_path = os.path.join(index_folder, "inverted_index.pickle")

        # 将更新后的索引保存回文件
        index.save_index_to_file(file_path)

