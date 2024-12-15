import jieba
from collections import defaultdict
import os
import pickle
import string
from home.models import Games, GameTypeRelation, GameType

class InvertedIndex:
    def __init__(self):
        self.index = defaultdict(list)
        self.document_ids = set()
        self.last_indexed_game_id = 0  # 记录上次索引的最大游戏ID

    def add_document(self, doc_id, doc_title):
        doc_title = self._preprocess_text(doc_title)
        print(f"正在处理游戏标题: {doc_title}")
        words = jieba.cut(doc_title)
        for word in words:
            if doc_id not in self.index[word]:
                self.index[word].append(doc_id)
        self.document_ids.add(doc_id)

    def _preprocess_text(self, text):
        # 转换为小写并去除标点符号
        translator = str.maketrans('', '', string.punctuation)
        text = text.translate(translator)
        return text

    def build_index(self, batch_size=1000):
        """
        以指定的批次大小分批构建索引，避免一次性处理大量数据导致内存不足
        """
        total_documents = Games.objects.count()
        for i in range(0, total_documents, batch_size):
            end_index = min(i + batch_size, total_documents)
            games = Games.objects.all()[i:end_index]
            print(games)
            for game in games:
                self.add_document(game.game_id, game.game_name)

    def save_index_to_file(self, file_path):
        # 检查文件所在目录是否存在，不存在则创建
        directory = os.path.dirname(file_path)#提取目录
        if not os.path.exists(directory):
            os.makedirs(directory)

        with open(file_path, 'wb') as file_obj:
            pickle.dump((self.index, list(self.document_ids), self.last_indexed_game_id), file_obj)

    def load_index_from_file(self, file_path):
        if os.path.exists(file_path):
            with open(file_path, 'rb') as file_obj:
                self.index, self.document_ids, self.last_indexed_game_id = pickle.load(file_obj)
        else:
            print(f"文件 {file_path} 不存在，请检查路径。")

    def update_index(self):
        """
        增量更新索引，获取新添加的游戏数据并更新索引
        """
        new_games = Games.objects.filter(game_id__gt=self.last_indexed_game_id)#找到大于当前更新索引的内容
        for game in new_games:
            self.add_document(game.game_id, game.game_name)
        self.last_indexed_game_id = Games.objects.latest('game_id').game_id

    def search(self, query):
        query = self._preprocess_text(query)
        query_words = list(jieba.cut(query))
        result = set(self.index[query_words[0]])
        for word in query_words[1:]:
            result &= set(self.index[word])

        # 从数据库中获取对应的游戏标题
        retrieved_games = Games.objects.filter(game_id__in=result)

        return [(game.game_name, game.game_id) for game in retrieved_games]


    def init(self):
        # 创建倒排索引实例
        inverted_index = InvertedIndex()

        # 构建索引，可根据实际情况调整批次大小
        inverted_index.build_index(batch_size=500)

        # 指定索引文件存放的文件夹路径
        index_folder = os.path.join(os.path.dirname(__file__), "..", "index")
        if not os.path.exists(index_folder):
            os.makedirs(index_folder)

        # 拼接完整的文件路径
        file_path = os.path.join(index_folder, "inverted_index.pickle")
        print(file_path)

        # 将构建好的索引保存为文件
        inverted_index.save_index_to_file(file_path)
        if (inverted_index):
            print('ok')

        inverted_index.load_index_from_file(file_path)
