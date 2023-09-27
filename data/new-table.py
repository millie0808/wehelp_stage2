import mysql.connector

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "rootpass"
}

connection = mysql.connector.connect(**db_config)
cursor = connection.cursor(dictionary=True)

cursor.execute("USE taipei_day_trip")

# create_user_table_query = """
# CREATE TABLE user (
#     id BIGINT AUTO_INCREMENT PRIMARY KEY,
#     name VARCHAR(255) not null,
#     email VARCHAR(255) not null,
#     password VARCHAR(255) not null,
#     date TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null
# );
# """
# cursor.execute(create_user_table_query)

# default_user_query = """
# INSERT INTO user (name, email, password) 
# VALUES ('test', 'test@test.com', 'test');
# """
# cursor.execute(default_user_query)

create_booking_time_table_query = """
CREATE TABLE booking_time (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    time VARCHAR(255),
    price INT
);
"""
cursor.execute(create_booking_time_table_query)

default_booking_time_query = """
INSERT INTO booking_time (id, time, price)
VALUES 
    (1, 'morning', 2000),
    (2, 'afternoon', 2500);
"""
cursor.execute(default_booking_time_query)

create_booking_table_query = """
CREATE TABLE booking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attn_id BIGINT not null,
    user_id BIGINT not null,
    date DATE not null, 
    time_id BIGINT not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null,
    foreign key(attn_id) references attraction(id),
    foreign key(user_id) references user(id),
    foreign key(time_id) references booking_time(id)
);
"""
cursor.execute(create_booking_table_query)


connection.commit()
cursor.close()
connection.close()