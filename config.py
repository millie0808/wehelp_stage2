from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from mysql.connector.pooling import MySQLConnectionPool
from dotenv import load_dotenv
import os

load_dotenv()

# SQLALCHEMY
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
# SQLAlchemy connection
engine = create_engine(SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)

# JWT
JWT_SECRET_KEY = 'adiwnonrijf;oiwjfi'

# MySQL connection
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_NAME = os.getenv("DATABASE_NAME")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
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