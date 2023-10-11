from flask import Blueprint, request
from utils.func import *
from models import *

order_bp = Blueprint('order', __name__)

@order_bp.route("/api/orders", methods=['POST'])
def new_order():
    try:
        user_data = get_decoded_user_data()
        if user_data:
            try:
                user_id = str(user_data['id'])
                new_order_data = request.get_json()
                new_order = create_new_order(user_id, new_order_data)
                tappay_response = to_tappay(new_order_data)
                if tappay_response['status'] == 0:
                    tappay_refund_id = tappay_response['rec_trade_id']
                    new_order = Orders.update_payment_status(new_order.id, tappay_refund_id)
                return jsonify({"data": {
                    "number": new_order.SN,
                    "payment": {
                        "status": 0 if new_order.is_paid else 1,
                        "message": "付款成功" if new_order.is_paid else "尚未付款"
                    }
                }})
            except:
                return api_error("訂單建立失敗", 400)
        else:
            return api_error("未登入系統", 403)
    except:
        return api_error("伺服器內部錯誤", 500)

@order_bp.route("/api/order/<orderNumber>", methods=['GET'])
def get_order(orderNumber):
    user_data = get_decoded_user_data()
    if user_data:
        user_id = str(user_data['id'])
        order = Orders.get_by_SN(user_id, orderNumber)
        if order:
            order_item = OrderItem.get(order.id)
            return jsonify({
                "data": {
                    "number": order.SN,
                    "price": order.amount,
                    "trip": {
                        "attraction": {
                            "id": order_item.attn_id,
                            "name": order_item.attn_name,
                            "address": order_item.attn_address,
                            "image": order_item.attn_image
                        },
                        "date": order_item.date,
                        "time": order_item.time
                    },
                    "contact": {
                        "name": order.contact_name,
                        "email": order.contact_email,
                        "phone": order.contact_phone
                    },
                    "status": 0 if order.is_paid else 1,
                }
            })
        else:
            return api_error("訂單編號不正確", 400)
    else:
        return api_error("未登入系統", 403)

@order_bp.route("/api/orders", methods=['GET'])
def get_orders():
    user_data = get_decoded_user_data()
    if user_data:
        user_id = str(user_data['id'])
        order = Orders.get(user_id)
        order_dict =  [{'SN': item[0], 'amount': item[1], 'status': item[2]} for item in order]
        return jsonify({"data":order_dict})
    else:
        return api_error("未登入系統", 403)