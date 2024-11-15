每次进行数据库更新使用指令进行数据迁移：
python manage.py makemigrations user
python manage.py migrate


使用前更新RecommendSys/settings.py的有关数据库的配置


有包的更新使用 pip freeze > requirements.txt
想要下载需要的包使用 pip install -r requirements.txt
