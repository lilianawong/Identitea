"""
This file defines the database models
"""
import datetime

from . common import db, Field, auth
from pydal.validators import *

### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later
#
# db.commit()
#

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


db.define_table("admins",
                Field("user_id","integer"),
                Field("level", "integer", default=0)
)

db.define_table("menu_categories",
                Field("name", "text"),
                Field("image","text"))

db.define_table("drinks",
                Field('name', 'text'),
                Field('description', 'text'),
                Field('image', 'text'),
                Field('categoryId', 'integer'), #menu category
                Field('price', 'integer')
                )

db.define_table("drink_toppings",
                Field('name', 'text'),
                Field('description', 'text'),
                Field('image', 'text')
                )


db.define_table("slides",
                Field('type', 'text'),
                Field('layout', 'text'),
                Field('time', 'integer'), #ms
                Field('slide_number', 'integer'),
                Field('visible', 'boolean'), 
                Field('deleted', 'boolean'),
                Field('title', 'text'),
                Field('description', 'text'),
                Field('price', 'text'),
                Field('image', 'text') #network only?, upload to static/assets
                )


db.define_table("questions",
                Field('prompt', 'text'),
                )

db.define_table("answers",
                Field('qid', 'integer'),
                Field('text', 'text'),
                Field('image', 'text'),
                )

db.define_table("answer_implications",
                Field('qaid', 'integer'), #question answer id
                Field('tag_id', 'integer'),
                Field('consumable_id', 'integer')
                )

db.define_table("drink_attr", 
                Field("drink_id", 'integer'),
                Field("consumable_id", 'integer')
                )

db.define_table("consumable",
                Field('name', 'text'),
                Field('description', 'text'),
                Field('image', 'text')
                )

db.define_table("consumable_to_tag", 
                Field('consumable_id', 'integer'),
                Field('tag_id', 'integer')
                )

db.define_table("tags", 
                Field('name', 'text'),
                Field('description', 'text'),
                Field('image', 'text')
                )


db.commit()
