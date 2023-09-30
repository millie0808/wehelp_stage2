from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

# SQLAlchemy
db = SQLAlchemy()

class Mrt(db.Model):
    __tablename__ = 'mrt'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))

class Category(db.Model):
    __tablename__ = 'category'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))

class Attraction(db.Model):
	__tablename__ = 'attraction'
	
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	name = db.Column(db.String(255))
	cat_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
	description = db.Column(db.Text)
	address = db.Column(db.String(255))
	transport = db.Column(db.String(512))
	mrt_id = db.Column(db.Integer, db.ForeignKey('mrt.id'))
	lat = db.Column(db.Float)
	lng = db.Column(db.Float)

class Image(db.Model):
    __tablename__ = 'image'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    url = db.Column(db.String(255))
    attn_id = db.Column(db.Integer, db.ForeignKey('attraction.id'), nullable=False)

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)

    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password

    @classmethod
    def create_user(cls, name, email, password):
        try:
            user = cls(name=name, email=email, password=password)
            db.session.add(user)
            db.session.commit()
            return user
        except:
            db.session.rollback()
            return None

    @classmethod
    def delete(self):
        db.session.delete(self)
        db.session.commit()

 
class BookingTime(db.Model):
    __tablename__ = 'booking_time'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    time = db.Column(db.String(255))
    price = db.Column(db.Integer)

class Booking(db.Model):
    __tablename__ = 'booking'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    attn_id = db.Column(db.Integer, db.ForeignKey('attraction.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_id = db.Column(db.Integer, db.ForeignKey('booking_time.id'), nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, server_default=func.now())