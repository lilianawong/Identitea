from py4web.core import Fixture
from . common import db, session, T, cache, auth, signed_url
from py4web import action, request, abort, redirect, URL, Field, HTTP

class Admin_Check(Fixture):
    def __init__(self, auth, db, groups):
        super().__init__()
        self.auth = auth
        self.groups = groups
        return
    def on_request(self):
        if not 'admin' in groups.get(auth.get_user()['id']):
            redirect('index')
    def on_success(self): pass
    def on_error(self): pass
    def transform(self, data): return data