from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from mysql.connector.pooling import MySQLConnectionPool

# SQLALCHEMY
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:rootpass@localhost/taipei_day_trip'
# SQLAlchemy connection
engine = create_engine(SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)

# session
SECRET_KEY = 'eovnlfnlonlkjmflo'

# JWT
JWT_SECRET_KEY = 'adiwnonrijf;oiwjfi'

# MySQL connection
DATABASE_HOST = 'localhost'
DATABASE_NAME = 'taipei_day_trip'
DATABASE_USER = 'root'
DATABASE_PASSWORD = 'rootpass'
# connection pool
CONNECTION_POOL_SIZE = 5
db_config = {
    "host": DATABASE_HOST,
    "database": DATABASE_NAME,
    "user": DATABASE_USER,
    "password": DATABASE_PASSWORD,
}
connection_pool = MySQLConnectionPool(
    pool_name = "my_connection_pool",
    pool_size = CONNECTION_POOL_SIZE,
    **db_config
)

# 其他
JSON_AS_ASCII = False
TEMPLATES_AUTO_RELOAD = True
JSON_SORT_KEYS = False

utf8 = {"Content-Type": "application/json; charset=utf-8"}
time_mapping = {
    'morning': 2000,
    'afternoon': 2500
}