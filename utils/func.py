from flask import jsonify, session, request
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import jwt
import re
import requests
import json
import random
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
    db_session = Session()
    mrts = db_session.query(Mrt.name)\
        .outerjoin(Attraction, Mrt.id == Attraction.mrt_id)\
        .group_by(Mrt.id)\
        .order_by(func.count(Attraction.mrt_id).desc())\
        .all()
    mrt_names = [station.name for station in mrts]
    return mrt_names

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

def check_signin(email, password):
    db_session = Session()
    user = db_session.query(User).filter_by(email=email, password=password).first()
    return user

def generate_jwt_token(user_data):
    payload = {
		'id': user_data.id,
		'name': user_data.name,
		'email': user_data.email
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

def get_cart(user_id):
    cart = Cart.get(user_id)
    if cart:
        booking_data = {
            "attraction": {
                "id": cart.attn_id,
                "name": cart.attn_name,
                "address": cart.attn_address,
                "image": cart.attn_image
            },
            "date": cart.date,
            "time": cart.time,
            "price": cart.price
        }
    else:
        booking_data = None
    return booking_data

def add_to_cart(user_id, data):
    if Cart.get(user_id):
        Cart.delete(user_id)
    db_session = Session()
    new_cart = Cart(
        user_id = user_id,
        attn_id = data['attractionID'],
        date = data['date'],
        time = data['time'],
        price = data['price']
    )
    db_session.add(new_cart)
    db_session.commit()
    db_session.close()

def remove_from_cart(user_id):
    Cart.delete(user_id)

def to_tappay(data):
    url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "partner_oSofhGL6VSpC3tinjd98JJkvh4uKwj8QdBFHFVMKpcQyi8q9UPV3dC1S"
    }
    request_data = {
        "prime": data['prime'],
        "partner_key": "partner_oSofhGL6VSpC3tinjd98JJkvh4uKwj8QdBFHFVMKpcQyi8q9UPV3dC1S",
        "merchant_id": 'millie000_ESUN',
        "details": "tour",
        "amount": data['order']['price'],
        "cardholder": {
            "phone_number": "+886923456789",
            "name": data['order']['contact']['name'],
            "email": data['order']['contact']['email'],
        }
    }
    response = requests.post(url, headers=headers, data=json.dumps(request_data))
    response_data = response.json()
    return response_data

def generate_order_serial_number():
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_digits = ''.join([str(random.randint(0, 9)) for _ in range(4)])
    order_serial_number = f"{timestamp}{random_digits}"
    return order_serial_number

def create_new_order(user_id, data):
    SN = generate_order_serial_number()
    amount = data['order']['price']
    contact =  data['order']['contact']
    new_order = Orders.new(user_id, SN, amount, contact)
    trip = data['order']['trip']
    price = data['order']['price']
    OrderItem.new(new_order.id, trip, price)
    remove_from_cart(user_id)
    return new_order