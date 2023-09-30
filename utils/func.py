from flask import jsonify, session, request
from sqlalchemy.orm import joinedload
import jwt
import re
from models import *
from config import *

def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False, group_concat=False, rowcount=False):
    connection = connection_pool.get_connection()
    cursor = connection.cursor(dictionary=True)
    if group_concat:
        cursor.execute('SET SESSION group_concat_max_len = 1000000;')
    cursor.execute(query, params)
    if commit:
        affected_rows = None
        if rowcount:
            affected_rows = cursor.rowcount
        connection.commit()
        cursor.close()
        connection.close()
        if affected_rows != None:
            return affected_rows
    else:
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        cursor.close()
        connection.close()
        return result

def api_error(message, code):
	return jsonify({
		"error": True,
		"message": message
	}), code, utf8

def count_attraction_rows():
	sql_query = """
	SELECT count(*)
	FROM attraction
	"""
	query_result = execute_query(sql_query, fetch_one=True)
	num_of_rows = query_result["count(*)"]
	return num_of_rows

def select_attraction_by_id(attractionId):
	sql_query = """
	SELECT * 
	FROM attraction_data
	WHERE id = %s;
	"""
	query_result = execute_query(sql_query, (attractionId,), fetch_one=True, group_concat=True)
	return query_result

def handle_api_attractions(one_page, page, keyword):
	if keyword:
		sql_query = """
		SELECT * 
		FROM attraction_data
		WHERE mrt = %s OR name REGEXP %s
		ORDER BY id
		LIMIT %s, %s;
		"""
		query_result = execute_query(sql_query, (keyword, keyword, one_page*page, one_page+1), fetch_all=True, group_concat=True)
		return query_result
	else:
		sql_query = """
		SELECT * 
		FROM attraction_data
		ORDER BY id
		LIMIT %s, %s;
		"""
		query_result = execute_query(sql_query, (one_page*page, one_page+1), fetch_all=True, group_concat=True)
		return query_result

def handle_api_mrts():
    sql_query = """
        SELECT mrt.name, COUNT(attraction.mrt_id) AS num_of_attractions
		FROM mrt
		LEFT JOIN attraction ON mrt.id = attraction.mrt_id
		GROUP BY mrt.id
		ORDER BY num_of_attractions DESC;
		"""
    query_result = execute_query(sql_query, fetch_all=True)
    result = [station['name'] for station in query_result]
    return result

def is_valid_email(email):
    email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if re.match(email_pattern, email):
        return True
    else:
        return False

def check_signup(name, email, password):
    result = User.create_user(name, email, password)
    if result:
        return True
    else:
        return False
	# sql_query = """
	# 	INSERT INTO user (name, email, password) 
	# 	SELECT %s, %s, %s 
	# 	FROM user 
	# 	WHERE NOT EXISTS ( 
	# 		SELECT 1 
	# 		FROM user 
	# 		WHERE email = %s
	# 	) 
	# 	LIMIT 1;
	# 	"""
	# affected_rows = execute_query(sql_query, (name, email, password, email), commit=True, rowcount=True)
	# if affected_rows == 0:
	# 	return False
	# else:
	# 	return True

def check_signin(email, password):
	sql_query = """
		SELECT id, name, email
		FROM user
		WHERE email = %s AND password = %s;
		"""
	query_result = execute_query(sql_query, (email, password), fetch_one=True)
	return query_result

def generate_jwt_token(user_data):
    payload = {
		'id': user_data['id'],
		'name': user_data['name'],
		'email': user_data['email']
	}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

def get_token(auth_header):
	if auth_header and auth_header.startswith('Bearer '):
		token = auth_header.split(' ')[1]
		return token

def get_decoded_user_data():
    authorization_header = request.headers.get('Authorization')
    token = get_token(authorization_header)
    decoded_payload = verify_jwt_token(token)
    return decoded_payload

def verify_jwt_token(token):
	try:
		payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
		return payload
	except jwt.ExpiredSignatureError:
		# Token已過期
		return None
	except jwt.InvalidTokenError:
		# Token無效
		return None

# def get_booking_data(user_id):
# 	db_session = Session()
# 	booking_data = db_session.query(Booking, Attraction, BookingTime, Image).\
# 		outerjoin(Attraction, Booking.attn_id == Attraction.id).\
# 		outerjoin(BookingTime, Booking.time_id == BookingTime.id).\
# 		outerjoin(Image, Image.attn_id == Attraction.id).\
# 		filter(Booking.user_id == user_id).first()
# 	if booking_data != None:
# 		booking, attraction, booking_time, image = booking_data
# 		return_data = {
# 			"attraction": {
# 				"id": booking.attn_id,
# 				"name": attraction.name,
# 				"address": attraction.address,
# 				"image": image.url
# 				},
# 			"date": booking.date.strftime('%Y-%m-%d'),
# 			"time": booking_time.time,
# 			"price": booking_time.price
# 		}
# 	else:
# 		return_data = None
# 	return return_data

# def insert_into_booking(user_id, data):
# 	db_session = Session()
# 	# 刪除
# 	old_booking = db_session.query(Booking).filter_by(user_id=user_id).first()
# 	if old_booking:
# 		db_session.delete(old_booking)
# 	# 新增
# 	time_id = time_mapping.get(data['time'], -1)
# 	new_booking = Booking(attn_id=data['attractionID'], user_id=user_id, date=data['date'], time_id=time_id)
# 	db_session.add(new_booking)
# 	db_session.commit()

def init_cart():
    if 'carts' not in session:
        session['carts'] = {}

def get_cart(user_id):
	init_cart()
	if user_id in session['carts']:
		db_session = Session()
		attraction_data = db_session.query(Attraction.name, Attraction.address, Image.url).\
			outerjoin(Image, Image.attn_id == Attraction.id).\
			filter(Attraction.id == session['carts'][user_id]['attn_id']).first()
		attn_name, attn_address, attn_image = attraction_data
		booking_data = {
			"attraction": {
				"id": session['carts'][user_id]['attn_id'],
				"name": attn_name,
				"address": attn_address,
				"image": attn_image
			},
			"date": session['carts'][user_id]['date'],
			"time": session['carts'][user_id]['time'],
			"price": time_mapping.get(session['carts'][user_id]['time'])
		}
	else:
		booking_data = None
	return booking_data

def add_to_cart(user_id, data):
    init_cart()
	# trip_id = f"{data['attractionID']}-{data['date']}-{data['time']}"
    if user_id not in session['carts']:
        session['carts'][user_id] = {}
    session['carts'][user_id] = {
		'attn_id': data['attractionID'],
		'date': data['date'],
		'time': data['time']
	}
    print(session['carts'][user_id])
    session.modified = True
	# if trip_id not in session['carts'][user_id]:
	# 	session['carts'][user_id][trip_id] = {
	# 		'attn_id': data['attractionID'],
	# 		'date': data['date'],
	# 		'time': data['time']
	# 	}
	# 	session.modified = True

def remove_from_cart(user_id):
	init_cart()
	if user_id in session['carts']:
		del session['carts'][user_id]
		session.modified = True

# def delete_booking(user_id):
# 	db_session = Session()
# 	booking = db_session.query(Booking).filter_by(user_id=user_id).first()
# 	db_session.delete(booking)
# 	db_session.commit()