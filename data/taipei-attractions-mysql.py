import mysql.connector
import json
import re

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "rootpass"
}

connection = mysql.connector.connect(**db_config)
cursor = connection.cursor(dictionary=True)

create_db_query = "CREATE DATABASE taipei_day_trip"
cursor.execute(create_db_query)

cursor.execute("USE taipei_day_trip")

create_table_query = """
CREATE TABLE mrt (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);
"""
cursor.execute(create_table_query)

create_table_query = """
CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);
"""
cursor.execute(create_table_query)

create_table_query = """
CREATE TABLE attraction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    cat_id BIGINT not null,
    description VARCHAR(2048),
    address VARCHAR(255),
    transport VARCHAR(512),
    mrt_id BIGINT,
    lat DOUBLE,
    lng DOUBLE,
    foreign key(mrt_id) references mrt(id),
    foreign key(cat_id) references category(id)
);
"""
cursor.execute(create_table_query)

create_table_query = """
CREATE TABLE image (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255),
    attn_id BIGINT not null,
    foreign key(attn_id) references attraction(id)
);
"""
cursor.execute(create_table_query)

with open("data/taipei-attractions.json", "r") as json_file:
    data = json.load(json_file)

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    cursor.execute(query, params)
    if fetch_all or fetch_one:
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        return result

mrt_list = []
cat_list = []
for attraction in data['result']['results']:
    id = attraction['_id']
    name = attraction['name']
    category = attraction['CAT']
    if category not in cat_list:
        cat_list.append(category)
        category_query = """
        INSERT INTO category(name)
        VALUES (%s);
        """
        execute_query(category_query, (category,))

    description = attraction['description']
    address = attraction['address'].replace(' ','')
    transport = attraction['direction']
    mrt = attraction['MRT']
    if mrt and mrt not in mrt_list:
        mrt_list.append(mrt)
        mrt_query = """
        INSERT INTO mrt(name)
        VALUES (%s);
        """
        execute_query(mrt_query, (mrt,))
    lat = attraction['latitude']
    lng = attraction['longitude']

    url_unorganized = attraction['file']
    url_parts = re.split(r'(JPG|jpg|png)', url_unorganized)
    image_urls = [url_parts[i] + url_parts[i+1] for i in range(0, len(url_parts)-1, 2)]

    category_query = """
    SELECT id
    FROM category
    WHERE name=%s;
    """
    query_result = execute_query(category_query, (category,), fetch_one=True)
    cat_id = query_result['id']

    if mrt:
        mrt_query = """
        SELECT id
        FROM mrt
        WHERE name=%s;
        """
        query_result = execute_query(mrt_query, (mrt,), fetch_one=True)
        mrt_id = query_result['id']
        attraction_query = """
        INSERT INTO attraction(id,name,cat_id,description,address,transport,mrt_id,lat,lng)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
        execute_query(attraction_query, (id, name, cat_id, description, address, transport, mrt_id, lat, lng))
    else:
        attraction_query = """
        INSERT INTO attraction(id,name,cat_id,description,address,transport,lat,lng)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """
        execute_query(attraction_query, (id, name, cat_id, description, address, transport, lat, lng))

    for url in image_urls:
        image_query = """
        INSERT INTO image(url,attn_id)
        VALUES (%s,%s)
        """
        execute_query(image_query, (url,id))


view_query = """
CREATE VIEW attraction_data AS
SELECT 
    a.id, a.name, c.name AS category,
    a.description, a.address, a.transport,
    m.name AS mrt, a.lat, a.lng,
    GROUP_CONCAT(i.url) AS images
FROM attraction a
LEFT JOIN mrt m ON a.mrt_id = m.id
LEFT JOIN category c ON a.cat_id = c.id
LEFT JOIN image i ON a.id = i.attn_id 
GROUP BY a.id;
"""
execute_query(view_query)

connection.commit()
cursor.close()
connection.close()
