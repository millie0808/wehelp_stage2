from flask import *
from mysql.connector.pooling import MySQLConnectionPool


app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config['JSON_SORT_KEYS'] = False

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

def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
	connection = connection_pool.get_connection()
	cursor = connection.cursor(dictionary=True)
	cursor.execute(query, params)
	if commit:
		connection.commit()
		connection.close()
	else:
		result = None
		if fetch_one:
			result = cursor.fetchone()
		elif fetch_all:
			result = cursor.fetchall()
		cursor.close()
		connection.close()
		return result

def api_error(message,code):
	return make_response(jsonify({
		"error": True,
		"message": message
	}), code)

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
	query_result = execute_query(sql_query, (attractionId,), fetch_one=True)
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
		query_result = execute_query(sql_query, (keyword, keyword, one_page*page, one_page), fetch_all=True)
		return query_result
	else:
		sql_query = """
		SELECT * 
		FROM attraction_data
		ORDER BY id
		LIMIT %s, %s;
		"""
		query_result = execute_query(sql_query, (one_page*page, one_page), fetch_all=True)
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
	one_page = 12
	if page_str:
		page = int(page_str)
		if page < 0:
			return api_error("無此頁，頁數小於0", 500)
		try: 
			result = handle_api_attractions(one_page, page, keyword)
			# 計算最大頁數
			if keyword:
				max_page = len(result)/one_page
			else:
				num_of_attractions = count_attraction_rows()
				max_page = num_of_attractions/one_page

			if page > max_page:
				return api_error("無此頁，頁數過大", 500)
			else:
				for attraction in result:
					attraction["images"] = attraction["images"].split(",")
				return jsonify({
					"nextPage": page+1,
					"data": result
				})
		except:
			return api_error("伺服器內部錯誤", 500)
	else:
		return api_error("請提供頁數", 500)

@app.route("/api/attraction/<attractionId>")
def api_attraction_attractionId(attractionId):
	try:
		attraction = select_attraction_by_id(attractionId)
		if attraction:
			attraction["images"] = attraction["images"].split(",")
			return jsonify({"data": attraction})
		else:
			return api_error("景點編號不正確", 400)
	except:
		return api_error("伺服器內部錯誤", 500)

@app.route("/api/mrts")
def api_mrts():
	try:
		result = handle_api_mrts()
		return jsonify({"data": result})
	except:
		return api_error("伺服器內部錯誤", 500)


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=3000, debug=True)