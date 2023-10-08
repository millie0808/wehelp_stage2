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
    
    @classmethod
    def get(cls, attraction_id):
        attraction = db.session.query(
            cls.id, cls.name, cls.description,
            cls.address, cls.transport,
            cls.lat, cls.lng,
            Category.name.label('category'),
            Mrt.name.label('mrt'),
            func.group_concat(Image.url).label('images')
        ).outerjoin(Category, cls.cat_id == Category.id)\
        .outerjoin(Mrt, cls.mrt_id == Mrt.id)\
        .outerjoin(Image, cls.id == Image.attn_id)\
        .filter(cls.id == attraction_id).first()
        attraction_dict = attraction._asdict()
        attraction_dict['images'] = attraction_dict['images'].split(",")
        return attraction_dict

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

class Cart(db.Model):
    __tablename__ = 'cart'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    attn_id = db.Column(db.Integer, db.ForeignKey('attraction.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(20), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, server_default=func.now())
    __table_args__ = (
        db.CheckConstraint(time.in_(['morning', 'afternoon'])),
    )

    @classmethod
    def get(cls, user_id):
        cart = db.session.query(
            cls.date, cls.time, cls.price,
            Attraction.id.label('attn_id'),
            Attraction.name.label('attn_name'),
            Attraction.address.label('attn_address'),
            Image.url.label('attn_image')
        ).outerjoin(Attraction, cls.attn_id == Attraction.id)\
        .outerjoin(Image, cls.attn_id == Image.attn_id)\
        .filter(cls.user_id == user_id).first()
        return cart

    @classmethod
    def delete(cls, user_id):
        try:
            delete_query = db.session.query(cls).filter(cls.user_id == user_id)
            cart_to_be_deleted = delete_query.first()
            if cart_to_be_deleted:
                delete_query.delete()
                db.session.commit()
        except:
            db.session.rollback()

class Orders(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    SN = db.Column(db.String(255), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    is_paid = db.Column(db.BOOLEAN, nullable=False, default=False)
    rec_trade_id = db.Column(db.String(20))
    contact_name = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(255), nullable=False)
    contact_phone = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, server_default=func.now())
    modified_at = db.Column(db.TIMESTAMP)

    @classmethod
    def get(cls, user_id):
        order = db.session.query(
            cls.SN, cls.amount, cls.is_paid,
        ).filter(cls.user_id == user_id).all()
        return order

    @classmethod
    def get_by_SN(cls, user_id, SN):
        order = db.session.query(cls)\
        .filter((cls.user_id == user_id) & (cls.SN == SN)).first()
        return order

    @classmethod
    def new(cls, user_id, SN, amount, contact):
        try:
            order = cls(
                user_id = user_id, 
                SN = SN, 
                amount = amount,
                contact_name = contact['name'],
                contact_email = contact['email'],
                contact_phone = contact['phone']
            )
            db.session.add(order)
            db.session.commit()
            return order
        except:
            db.session.rollback()
            return None

    @classmethod
    def update_payment_status(cls, order_id, rec_trade_id):
        order_to_update = db.session.query(cls).filter_by(id=order_id).first()
        order_to_update.is_paid = True
        order_to_update.rec_trade_id = rec_trade_id
        order_to_update.modified_at = func.now()
        db.session.commit()
        return order_to_update


class OrderItem(db.Model):
    __tablename__ = 'order_item'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    attn_id = db.Column(db.Integer, db.ForeignKey('attraction.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(20), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    __table_args__ = (
        db.CheckConstraint(time.in_(['morning', 'afternoon'])),
    )

    @classmethod
    def get(cls, order_id):
        order_item = db.session.query(
            cls.date, cls.time, 
            Attraction.id.label('attn_id'),
            Attraction.name.label('attn_name'),
            Attraction.address.label('attn_address'),
            Image.url.label('attn_image')
        ).outerjoin(Attraction, cls.attn_id == Attraction.id)\
        .outerjoin(Image, cls.attn_id == Image.attn_id)\
        .filter(cls.order_id == order_id).first()
        return order_item

    @classmethod
    def new(cls, order_id, trip, price):
        try:
            order_item = cls(
                order_id = order_id, 
                attn_id = trip['attraction']['id'],
                date = trip['date'],
                time = trip['time'],
                price = price
            )
            db.session.add(order_item)
            db.session.commit()
        except:
            db.session.rollback()