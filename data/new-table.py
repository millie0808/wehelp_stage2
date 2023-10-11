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
#     email VARCHAR(255) not null unique,
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

create_cart_table_query = """
CREATE TABLE cart (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT not null,
    attn_id BIGINT not null,
    date DATE not null,
    time VARCHAR(20) CHECK (time IN ('morning', 'afternoon')) NOT NULL,
    price BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() not null,
    foreign key(user_id) references user(id),
    foreign key(attn_id) references attraction(id)
);
"""
cursor.execute(create_cart_table_query)

create_order_table_query = """
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    SN VARCHAR(255) not null unique,
    user_id BIGINT not null,
    amount BIGINT NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    rec_trade_id VARCHAR(20),
    contact_name VARCHAR(255) not null,
    contact_email VARCHAR(255) not null,
    contact_phone VARCHAR(255) not null,
    created_at TIMESTAMP DEFAULT NOW() not null,
    modified_at TIMESTAMP,
    foreign key(user_id) references user(id)
);
"""
cursor.execute(create_order_table_query)

create_order_item_table_query = """
CREATE TABLE order_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT not null,
    attn_id BIGINT not null,
    date DATE not null,
    time VARCHAR(20) CHECK (time IN ('morning', 'afternoon')) not null,
    price BIGINT not null,
    foreign key(order_id) references orders(id),
    foreign key(attn_id) references attraction(id)
);
"""
cursor.execute(create_order_item_table_query)


connection.commit()
cursor.close()
connection.close()