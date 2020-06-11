
// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        category: [],
        drink_toppings: [],
        modalIsActive: false,
        modalname: "",
        modaldescription: "",
        modalimages: "",
        modal_price: 0,
        modal_qty: 1,
        modal_toppings: [],
        modal_sweet:"100",
        modal_ice:"Yes",
        modal_size:"Medium",

        cart: [],
        cart_visible: false
    };

    // Add here the various functions you need.


    // Use this function to reindex the posts, when you get them, and when
    // you add / delete one of them.
    app.reindex = (a) => {
        let idx = 0;
        for (p of a) {
            p._idx = idx++;

            // Add here whatever other attributes should be part of a post.
        }
        return a;
    };

    app.reindex_toppings = function(a){
        i = 0;
        for(p of a){
            p.topping_idx = i++;
        }
        return a;
    }


    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.

    app.total_item = function (cart_item) {
        c = cart_item;
        total = c.price_one;
        total += c.extras.reduce(function (acc, e) {
            return acc + e.price
        },0);

        return total * c.qty;

    }

    app.show_cart = function (show) {
        app.data.cart_visible = show
    }

    app.activatemodal = function (name, description, images, price) {
        //init and reset
        app.data.modalIsActive = true;
        app.data.modalname = name;
        app.data.modaldescription = description;
        app.data.modalimages = images;
        app.data.modal_price = price;
        app.data.modal_qty = 1;
        app.data.modal_toppings = [];
        app.data.modal_sweet="100";
    }

    app.close = function () {
        app.data.modalIsActive = false;
    };

    app.place_order = function(){

        axios.post(place_order_url, {order:app.data.cart}).then(function(res){
            app.data.cart = [];
            app.data.cart_visible = false;
        }).catch(function(){
            //do nothing
        })
    }


    app.methods = {
        // Complete.
        place_order:app.place_order,
        isNumber: function(evt) {
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode === 46 || charCode === 45){
              evt.preventDefault();;
            } else {
              return true;
            }
          },
        goto_page: function (page_name) {

            //pre-init
            if (page_name == "posts") {

            } else if (page_name == "add_post") {
                app.vue.new_post_text = "";
            }

            app.vue.page = page_name
        },
        close: app.close,
        activatemodal: app.activatemodal,
        add_to_cart: function () {
            //get all the values from the modal and topping.idx

            let cart_item = {
                item: app.data.modalname,
                description: app.data.modaldescription,
                image: app.data.modalimages,
                price_one: app.data.modal_price,
                qty: app.data.modal_qty,
                extras: app.data.modal_toppings,
                sweet:app.data.modal_sweet,
                ice:app.data.modal_ice,
                size:app.data.modal_size
            }

            //resolve toppings data
            cart_item.extras = cart_item.extras.map(function (idx) {
                t = app.data.drink_toppings[idx];
                return { name: t.name, price: t.price, image: t.image, description: t.description }
            });

            //give the cart_item a unique id and save it
            cart_item._idx = app.data.cart.length;
            app.data.cart.push(cart_item);
            app.close();
            
        },

        remove_from_cart: function(idx){
            app.data.cart.splice(idx,1);
            let i = 0;
            for(a in app.data.cart){
                a._idx = i++; 
            }
        },

        show_cart: app.show_cart,

        dollars: function (cents) {
            return "$" + (cents / 100).toFixed(2);
        },

        total_item: app.total_item,

        total_cart: function (cart) {
            return cart.reduce(function (acc, c) {
                return acc + app.total_item(c);
            },0);
        }

    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });


    // And this initializes it.
    //Generally thus will be a network call to the server to load the data 
    // For the moment, we 'load' the data from a string
    app.init = () => {
        // We load the posts from the server using axios library
        //result.data contains the response result,data.posts contains the attribute
        axios.get(get_category_url).then((result) => {
            app.vue.category = app.reindex(result.data.categories);
            app.vue.drink_toppings = app.reindex_toppings(result.data.drink_toppings)

        })
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
