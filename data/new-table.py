import mysql.connector

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "rootpass"
}

connection = mysql.connector.connect(**db_config)
cursor = connection.cursor(dictionary=True)

cursor.execute("USE taipei_day_trip")

create_user_table_query = """
CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) not null,
    email VARCHAR(255) not null,
    password VARCHAR(255) not null,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null
);
"""
cursor.execute(create_user_table_query)

default_user_query = """
INSERT INTO user (name, email, password) 
VALUES ('test', 'test@test.com', 'test');
"""
cursor.execute(default_user_query)


connection.commit()
cursor.close()
connection.close()