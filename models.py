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

""" 
                order_json:
                    {
                        items:[
                            {
                                item:"MilkTea",
                                extras:["Boba", "jello"],
                                special_request:"please put the jello on the side"
                                qty:1
                                price:10
                                sweet:30
                            }
                        ]
                        sub_total:990,
                        tax:10,
                        total:1000, 
                    }
                """

db.define_table("orders", 
                Field("user_id", "integer"),
                Field("first_name", "text"),
                Field("last_name", "text"),
                Field("fulfilled", "boolean"),
                Field("opened_date", 'datetime', default=get_time),
                Field("closed_date", 'datetime', default=get_time),
                Field("sub_total", "integer"), #cents
                Field("tax", "integer"),
                Field("order_json", "text")
                )

db.define_table("menu_categories",
                Field("name", "text"),
                Field("image","text"),
                Field('sort', 'integer', default=0))

db.define_table("drinks",
                Field('name', 'text'),
                Field('description', 'text'),
                Field('image', 'text'),
                Field('categoryId', 'integer'), #menu category
                Field('price', 'integer', default=0),
                Field('sort', 'integer', default=0)
                )

db.define_table("drink_toppings",
                Field('name', 'text'),
                Field('description', 'text'),
                Field('price', "integer"), #cents
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
                Field('image', 'text')
                )

#the folowing tables are for the quiz
#the quiz does not work yet... so these tables are not used for now


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
