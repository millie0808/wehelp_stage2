from flask import *
from models import db
from api.attraction import attraction_bp
from api.booking import booking_bp
from api.user import user_bp
from api.order import order_bp

app = Flask(
    __name__,
    static_folder = "static",
    static_url_path = "/"
)
# 加載config文件
app.config.from_object("config")

# SQLAlchemy connection
db.init_app(app)

# Blueprint
app.register_blueprint(attraction_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(user_bp)
app.register_blueprint(order_bp)

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
@app.route("/member")
def member():
	return render_template("member.html")

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=3000, debug=True)