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

db.define_table("post",
                Field('email', default=get_user_email),
                Field('content', 'text'),
                Field('post_date', 'datetime', default=get_time),
                Field('is_reply', 'reference post'),
                )

db.commit()
