from flask import Blueprint, request, jsonify
from utils.func import *

attraction_bp = Blueprint('attraction', __name__)

@attraction_bp.route("/api/attractions")
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

@attraction_bp.route("/api/attraction/<attractionId>")
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

@attraction_bp.route("/api/mrts")
def api_mrts():
    try:
        result = handle_api_mrts()
        return jsonify({"data": result}), utf8
    except:
        return api_error("伺服器內部錯誤", 500)