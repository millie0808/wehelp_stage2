from flask import Blueprint, request
from utils.func import *

booking_bp = Blueprint('booking', __name__)

@booking_bp.route("/api/booking", methods=['GET'])
def get_booking():
    user_data = get_decoded_user_data()
    if user_data:
        user_id = str(user_data['id'])
        # booking_data = get_booking_data(user_id)
        booking_data = get_cart(user_id)
        return jsonify({"data": booking_data})
    else:
        return api_error("未登入系統", 403)


@booking_bp.route("/api/booking", methods=['POST'])
def create_new_booking():
    try:
        user_data = get_decoded_user_data()
        if user_data:
            user_id = str(user_data['id'])
            new_booking_data = request.get_json()
            try:
                add_to_cart(user_id, new_booking_data)
                return jsonify({"ok": True})
            except:
                return api_error("建立失敗", 400)
        else:
            return api_error("未登入系統", 403)
    except:
        return api_error("伺服器內部錯誤", 500)

@booking_bp.route("/api/booking", methods=['DELETE'])
def delete_booking():
    user_data = get_decoded_user_data()
    if user_data:
        user_id = str(user_data['id'])
		# delete_booking(user_id)
        remove_from_cart(user_id)
        return jsonify({"ok": True})
    else:
        return api_error("未登入系統", 403)