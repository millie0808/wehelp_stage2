from flask import *
from mysql.connector.pooling import MySQLConnectionPool
import re
import jwt
import random
import string

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False
app = Flask(
    __name__,
    static_folder = "static",
    static_url_path = "/"
)

db_config = {
    "host": "localhost",
    "database": "taipei_day_trip",
    "user": "root",
    "password": "rootpass",
}

connection_pool = MySQLConnectionPool(
    pool_name = "my_connection_pool",
    pool_size = 5,
    **db_config
)

# MySQL Views: attraction_data

# Global variables
utf8 = {"Content-Type": "application/json; charset=utf-8"}

# jwt 密鑰
def generate_random_string(length):
    # 選擇包含的字符集合
    characters = string.ascii_letters + string.digits  # 包含字母和數字
    # 使用隨機函數生成指定長度的隨機字符串
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string
SECRET_KEY = generate_random_string(10)

# Functions
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
	sql_query = """
		INSERT INTO user (name, email, password) 
		SELECT %s, %s, %s 
		FROM user 
		WHERE NOT EXISTS ( 
			SELECT 1 
			FROM user 
			WHERE email = %s
		) 
		LIMIT 1;
		"""
	affected_rows = execute_query(sql_query, (name, email, password, email), commit=True, rowcount=True)
	if affected_rows == 0:
		return False
	else:
		return True

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
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        # Token已過期
        return None
    except jwt.InvalidTokenError:
        # Token無效
        return None

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")
@app.route("/api/attractions")
def api_attractions():
	page_str = request.args.get("page")
	keyword = request.args.get("keyword", None)
	one_page = 12 # 一頁放12個
	if page_str:
		try:
			page = int(page_str)
			if page < 0:
				return api_error("無此頁，頁數小於0", 500)
			try: 
				result = handle_api_attractions(one_page, page, keyword)
				if len(result) > 0:
					for attraction in result:
						attraction["images"] = attraction["images"].split(",")
					if len(result) == 13: 
						return jsonify({
							"nextPage": page+1,
							"data": result[:one_page]
						}), utf8
					else:
						return jsonify({
							"nextPage": None,
							"data": result
						}), utf8
				else:
					return api_error("無此頁，頁數過大", 500)
			except:
				return api_error("伺服器內部錯誤", 500)
		except:
			return api_error("無此頁，頁數需為整數", 500)
	else:
		return api_error("請提供頁數", 500)

@app.route("/api/attraction/<attractionId>")
def api_attraction_attractionId(attractionId):
	try:
		attraction = select_attraction_by_id(attractionId)
		if attraction:
			attraction["images"] = attraction["images"].split(",")
			return jsonify({"data": attraction}), utf8
		else:
			return api_error("景點編號不正確", 400)
	except:
		return api_error("伺服器內部錯誤", 500)

@app.route("/api/mrts")
def api_mrts():
	try:
		result = handle_api_mrts()
		return jsonify({"data": result}), utf8
	except:
		return api_error("伺服器內部錯誤", 500)

@app.route("/api/user", methods=['POST'])
def api_user():
	try:
		data = request.get_json()
		name = data['name']
		email = data['email']
		password = data['password']
		if is_valid_email(email):
			signup_result = check_signup(name, email, password)
			if signup_result:
				return jsonify({"ok": True}), utf8
			else:
				return api_error("註冊失敗，email已存在", 400)
		else:
			return api_error("註冊失敗，email格式錯誤", 400)
	except:
		return api_error("伺服器內部錯誤", 500)

@app.route("/api/user/auth", methods=['PUT', 'GET'])
def api_user_auth():
	try:
		if request.method == 'PUT':
			data = request.get_json()
			email = data['email']
			password = data['password']
			if is_valid_email(email):
				signin_result = check_signin(email, password)
				if signin_result:
					jwt_token = generate_jwt_token(signin_result)
					return jsonify({"token": jwt_token})
				else:
					return api_error("登入失敗，帳號密碼錯誤", 400)
			else:
				return api_error("登入失敗，email格式錯誤", 400)
		if request.method == 'GET':
			authorization_header = request.headers.get('Authorization')
			if authorization_header and authorization_header.startswith('Bearer '):
				token = authorization_header.split(' ')[1]
			decoded_payload = verify_jwt_token(token)
			if decoded_payload:
				return jsonify({"data": decoded_payload})
			else:
				return jsonify(None)
	except:
		return api_error("伺服器內部錯誤", 500)






if __name__ == "__main__":
	app.run(host="0.0.0.0", port=3000, debug=True)