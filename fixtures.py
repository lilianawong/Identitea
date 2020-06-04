from py4web.core import Fixture
from . common import db, session, T, cache, auth, signed_url
from py4web import action, request, abort, redirect, URL, Field, HTTP

class Admin_Check(Fixture):
    def __init__(self, auth, db, groups):
        super().__init__()
        self.auth = auth
        self.db = db
        return
    def on_request(self):

        if auth.get_user() == {} or auth.get_user()['id'] == None:
            redirect('index')
        if  len(db(db.admins.user_id == auth.get_user()['id']).select().as_list()) <= 0:
            redirect('index') 
    def on_success(self): pass
    def on_error(self): pass
    
