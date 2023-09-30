from flask import Blueprint, request
from utils.func import *

user_bp = Blueprint('user', __name__)

@user_bp.route("/api/user", methods=['POST'])
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

@user_bp.route("/api/user/auth", methods=['PUT'])
def login():
	try:
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
	except:
		return api_error("伺服器內部錯誤", 500)

@user_bp.route("/api/user/auth", methods=['GET'])
def check_authorization():
	user_data = get_decoded_user_data()
	if user_data:
		return jsonify({"data": user_data})
	else:
		return jsonify(None)