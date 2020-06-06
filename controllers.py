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
from .components.fileupload import FileUpload


url_signer = URLSigner(session)
groups = Tags(db.auth_user)
admin_check = Admin_Check(auth, db, groups)

common_fixtures = [session, db, url_signer]
admin_fixtures = common_fixtures + [auth.user, admin_check]

user = None

# The auth.user below forces login.
@action('index')
@action.uses('index.html', *common_fixtures)
def index():    
    return dict(
        get_slides=URL("admin_getslides", signer=url_signer),
     )

@action('menu')
@action.uses('menu.html', *common_fixtures)
def index():
       
    return dict( get_category= URL("get_menu_items"),
                place_order=URL("place_order", signer=url_signer))

@action('quiz')
@action.uses('quiz.html', *common_fixtures)
def index():
    
    return dict(
     )


@action('admin')
@action.uses(*admin_fixtures, 'admin_panel.html')
def admin_panel():
    return dict()


file_uploader = FileUpload('up', session)
@action('admin_menu', method=['GET'])
@action.uses(*admin_fixtures, file_uploader, 'admin_menu.html')
def admin_menu():
    return dict(
        get_menu_items=URL("get_menu_items", signer=url_signer),
        delete_category = URL("admin_delete_category", signer=url_signer),
        delete_drink = URL("admin_delete_drink", signer=url_signer),
        delete_topping = URL("admin_delete_topping", signer=url_signer),
        save_category = URL("admin_save_category", signer=url_signer),
        save_categories = URL("admin_save_categories", signer=url_signer),
        save_drink = URL("admin_save_drink", signer=url_signer),
        save_toppings = URL("admin_save_toppings", signer=url_signer),
        drink_uploader=file_uploader(bindCb="drink_image_uploaded", emitid="d.o"),
        category_uploader = file_uploader(bindCb="category_image_uploaded", emitid="c.cat_idx")
    )

@action('get_menu_items', method=['GET'])
@action.uses(*common_fixtures)
def get_menu_items():
    #need to get all the categories, then all drinks belonging to each category
    cats = db(db.menu_categories).select()
    cats = cats.as_list()
    for c in cats:
        drinks = db(db.drinks.categoryId == c.get('id')).select(orderby=db.drinks.sort)
        c['drinks'] = drinks.as_list()
        pass
    toppings = db(db.drink_toppings).select().as_list()
    
    return dict(categories=cats, drink_toppings=toppings)

@action('place_order', method=['POST'])
@action.uses(*common_fixtures)
def place_order():
    order = request.json.get('order')

    #check each item and verify the price
    #never trust the user!

    db.orders.insert(
        order_json=order,
        user_id=None,
        first_name=None,
        last_name=None,
        fulfilled=False,
        sub_total=0,
        tax=0
    )

    pass


@action('admin_save_categories', method=['POST'])
@action.uses(*admin_fixtures)
def admin_save_categories():
    categories = request.json.get('categories')
    update_categories =  [i for i in request.json.get('categories') if i.get('id') != None ] 
    
    for s in update_categories:
        db(db.menu_categories.id == s.get('id')).update(sort = s['cat_idx'])
        for d in s['drinks']:
            db(db.drinks.id == d['id']).update(sort=d['drink_idx'], categoryId=d['categoryId'])
    return



    

@action('admin_save_category', method=['POST'])
@action.uses(*admin_fixtures)
def admin_save_category():
   
   #need way to save many in the event of a reorder
   
    category = request.json
    if category.get('id') != None:
        db.menu_categories[category.get('id')] = category
    else:
        id = db.menu_categories.insert(
            name=category.get('name'),
            image=category.get('image')
            )
        return dict(id=id)
    
    
@action('admin_save_drink', method=['POST'])
@action.uses(*admin_fixtures)
def admin_save_drink():
    
    #need way to save many in the even of a reorder
    
    drink = request.json
    if drink.get('id') != None:
        db.drinks[drink.get('id')] = drink
    else:
        id = db.drinks.insert(
            name=drink.get('name'),
            description=drink.get('description'),
            image=drink.get('image'),
            categoryId=drink.get('categoryId'),
            price=drink.get('price')
        )
        return dict( id=id)

@action('admin_save_toppings', method=['POST'])
@action.uses(*admin_fixtures)
def admin_save_toppings():
    if random.random() < 0.5:
        raise HTTP(500)
    insert_toppings = [i for i in request.json.get('toppings') if i.get('id') == None]
    update_toppings =  [i for i in request.json.get('toppings') if i.get('id') != None ] 
    a = db.drink_toppings.bulk_insert(insert_toppings)
    
    for s in update_toppings:
        db.drink_toppings[s.get('id')] = s
    
    #db.slides.bulk_update(update_slides)
    redirect(URL('get_drink_toppings'))
    return

@action('get_drink_toppings', method=['GET'])
@action.uses(*common_fixtures)
def get_menu_toppings():
    #need to get all the categories, then all drinks belonging to each category
    toppings = db(db.drink_toppings).select().as_list()
    return dict(drink_toppings=toppings)




@action('admin_delete_drink', method=['POST'])
@action.uses(*admin_fixtures)
def admin_delete_drink():
    db(db.drinks.id == request.json.get('id')).delete()
    pass

@action('admin_delete_category', method=['POST'])
@action.uses(*common_fixtures)
def admin_delete_category():
    #remove all associated drinks as well
    c_id = request.json.get('id')
    db(db.menu_categories.id == c_id).delete()
    db(db.drinks.categoryId == c_id).delete()
    pass


@action('admin_orders', method=['GET'])
@action.uses(*admin_fixtures, file_uploader, 'admin_orders.html')
def admin_slides():
    
    orders = db(db.orders).select(orderby=~db.orders.opened_date)
    return dict(
        orders = orders
    )



@action('admin_slides', method=['GET'])
@action.uses(*admin_fixtures, file_uploader, 'admin_slides.html')
def admin_slides():
    
    return dict(
        get_slides=URL("admin_getslides", signer=url_signer),
        delete_slide = URL("admin_delete_slide", signer=url_signer),
        save_slides = URL("admin_save_slides", signer=url_signer),
        uploader=file_uploader(emitid="slide.slide_idx")
    )


@action('admin_save_slides', method=['POST'])
@action.uses(*admin_fixtures)
def admin_save_slides():
    if random.random() < 0.5:
        raise HTTP(500)
    insert_slides = [i for i in request.json.get('slides') if i.get('id') == None]
    update_slides =  [i for i in request.json.get('slides') if i.get('id') != None ] 
    a = db.slides.bulk_insert(insert_slides)
    
    for s in update_slides:
        db.slides[s.get('id')] = s
    
    #db.slides.bulk_update(update_slides)
    redirect(URL('admin_getslides'))
    return

@action('admin_getslides', method=['GET'])
@action.uses(*common_fixtures)
def admin_slides():
    data = db(db.slides.deleted != True).select(orderby=db.slides.slide_number).as_list()
    return dict(slides=data)

@action('get_menu_drinks')
@action.uses(*common_fixtures)
def get_menu_drinks():
    

    return dict(category=[
        {
        "category":"milktea",
        "image":"images/milktea.png",
        "drinks":[
            {"name":"Jasmine Milk Tea",
            "images":"images/jasminemilk.jpg",
            "description":"Fresh Green Tea"},
            
            {"name":"Jasmine Milk Tea",
            "images":"images/jasminemilk.jpg",
            "description":"Fresh Green Tea"}] 
        },
        {
        "category":"creamseries",
        "image":"images/creamseries.png",
        "drinks":[
            {"name":"Jasmine Milk Tea (with cream)",
            "images":"images/greencream.jpg",
            "description":"Fresh Green Tea with cream"},
            
            {"name":"Black Milk Tea (with cream)",
            "images":"images/blackcream.jpg",
            "description":"Fresh Black Tea with cream"},
            {"name":"Matcha Tea (with cream)",
            "images":"images/matchalatte.jpg",
            "description":"Match green tea hand frothed"}]
            
        },
        {
        "category":"Signiture drinks",
        "image":"images/signature.png",
        "drinks":[
            {"name":"Strawberry Mint Refreshes",
            "images":"images/strawgreentea.jpg",
            "description":"Refreshing green tea "},
            
            {"name":"Mango Milk Bar",
            "images":"images/mangomilk.jpg",
            "description":"Sweet mango with milk"},
            {"name":"Mango match",
            "images":"images/matchalatte.jpg",
            "description":"Match green tea hand frothed sweetened with mango"},
            {"name":"Dulce De Leche",
            "images":"images/dulcedeleche.jpg",
            "description":"sweet caramel drink "},
             {"name":"Strawberry Milk Bar",
            "images":"images/strawmilk.jpg",
            "description":"sweet strawberry milk boba"},
            {"name":"Jasmine Milk Tea (with cream)",
            "images":"images/greencream.jpg",
            "description":"Fresh Green Tea with cream"},
            
            {"name":"Black Milk Tea (with cream)",
            "images":"images/blackcream.jpg",
            "description":"Fresh Black Tea with cream"},
            {"name":"Matcha Tea (with cream)",
            "images":"images/matchalatte.jpg",
            "description":"Match green tea hand frothed"}

            ]
            
        }
        ])
