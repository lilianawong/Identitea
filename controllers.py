"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import random
import time
import uuid

from py4web import action, request, abort, redirect, URL, Field, HTTP
from py4web.utils.form import Form, FormStyleBulma
from py4web.utils.url_signer import URLSigner
from py4web.utils.tags import Tags
from yatl.helpers import A
from . common import db, session, T, cache, auth, signed_url
from apps.identitea.fixtures import Admin_Check


url_signer = URLSigner(session)
groups = Tags(db.auth_user)
admin_check = Admin_Check(auth, db, groups)

common_fixtures = [db, session, url_signer]
admin_fixtures = common_fixtures + [admin_check, auth.user]

# The auth.user below forces login.
@action('index')
@action.uses('index.html', *common_fixtures)
def index():
    
    return dict(
     )

@action('menu')
@action.uses('menu.html', *common_fixtures)
def index():
    
    return dict(
     )

@action('quiz')
@action.uses('quiz.html', *common_fixtures)
def index():
    
    return dict(
     )


@action('admin')
@action.uses('admin_panel.html', *common_fixtures)
def admin_panel():
    return dict()

@action('admin_slides', method=['GET'])
@action.uses('admin_slides.html', *common_fixtures)
def admin_slides():
    return dict(
        get_slides=URL("admin_getslides", signer=url_signer),
        delete_slide = URL("admin_delete_slide", signer=url_signer),
        save_slides = URL("admin_save_slides", signer=url_signer)
    )

@action('admin_save_slides', method=['POST'])
@action.uses(*common_fixtures)
def admin_slides():
    return dict(
        get_slides=URL("admin_getslides", signer=url_signer),
        delete_slide = URL("admin_delete_slide", signer=url_signer),
        save_slides = URL("admin_slides", signer=url_signer)
    )

@action('admin_getslides')
@action.uses('admin_getslides.html', *common_fixtures)
def admin_slides():
    data = db(db.slides).select().as_list()
    return dict(slides=data)
