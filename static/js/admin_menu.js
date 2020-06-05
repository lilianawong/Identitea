// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

function deepCopy(object) {
    return JSON.parse(JSON.stringify(object))
}


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {


    // This is the Vue data.
    app.data = {
        categories: [],
        toppings: [],
        topping_error: false,
        temp_sq_img: "images/128x128.png"
    };


    /**
     * checks every drink/category for a true is editing tag
     * if it finds one, then this function returns true
     * 
     * mainly used to make sure the user cannot edit two things at the same time without saving one of them.
     */
    app.isEditing = function () {
        return app.data.categories.some(function (c) {
            return c.isEditing || c.drinks.some(function (d) {
                return d.isEditing;
            });
        });
    }


    /**
     * edit either a drink or category, depends on the num of args
     */
    app.edit_item = function (cat_idx, drink_idx) {
        if (app.isEditing()) return;
        if (drink_idx != null) {
            let drink = app.data.categories[cat_idx].drinks[drink_idx];
            drink.isEditing = true;
        } else {

            let cat = app.data.categories[cat_idx];
            cat.isEditing = true;
        }
    }

    /**
     * add either a drink or category, depends on the num of args
     */
    app.add_item = function (cat_idx) {
        if (app.isEditing()) return;
        if (cat_idx != null) {
            let category = app.data.categories[cat_idx];
            drink = {
                content: {
                    name: "",
                    description: "",
                    image: "",
                    categoryId: category.content.id,
                    price: 0
                },
                original_content: {},
                isEditing: true,
                show_modal: false,
            };
            category.drinks.push(drink);
            app.reindex_drinks(cat_idx);
        } else {
            if (app.isEditing()) return;
            category = {
                content: {
                    image: "",
                    name: "",

                },
                original_content: {},
                drinks: [],
                isEditing: true
            };
            app.data.categories.push(category);
            app.reindex();
        }
    }



    app.reindex_drinks = function (category_idx) {
        let category = app.data.categories[category_idx];
        let drinks = category.drinks;
        let i = 0;
        for (d of drinks) {
            d.drink_idx = i++;
            d.o = { drink_idx: d.drink_idx, cat_idx: category_idx }
        }
    }

    app.index_drinks = function (category_idx, drinks) {
        let category = app.data.categories[category_idx];
        //let drinks = category.drinks;
        let i = 0;
        for (let i = 0; i < drinks.length; i++) {
            drinks[i].price = app.dollars(drinks[i].price)
            drinks[i].content = deepCopy(drinks[i])
            drinks[i].original_content = deepCopy(drinks[i].content)
            drinks[i] = _.pick(drinks[i], ['original_content', 'content'])
            drinks[i].drink_idx = i;
            drinks[i].o = { drink_idx: drinks[i].drink_idx, cat_idx: category_idx }
            drinks[i].isEditing = false;
            drinks[i].show_modal = false;
        }
        return drinks
    }


    app.index = (a) => {
        // Adds to the posts all the fields on which the UI relies.

        for (let i = 0; i < a.length; i++) {
            a[i].content = deepCopy(a[i]);
            a[i].original_content = deepCopy(a[i].content);
            a[i] = _.pick(a[i], ['original_content', 'content', 'drinks'])
            a[i].cat_idx = i;
            a[i].drinks = app.index_drinks(a[i].cat_idx, a[i].drinks);
            a[i].isEditing = false;
        }



        /*
        for (let p of a) {
            //transform all slide data into content and original content, so we 
            //can check if modifications have been made
            p.slide_number = i;
            p.original_content = deepCopy(p)
            p.content = deepCopy(p.original_content);
            p = _.pick(p, ['original_content', 'content'])

            //add id after transform so that it doesn't exist in content
            p.slide_idx = i++;
        }*/
        return a;
    };

    app.dollars = function (cents) {
        cents = cents.toString();
        cents = cents.length < 3 ? "0".repeat(3 - cents.length) + cents : cents;
        cents = cents.slice(0, cents.length - 2) + "." + cents.slice(cents.length - 2, cents.length);
        return cents;
    }

    app.index_toppings = function (toppings) {

        let i = 0;
        for (t of toppings) {
            t.topping_idx = i++;

            //convert cents to dollars
            t.price = app.dollars(t.price)
            t.isEditing = false;
        }
        return toppings;
    }

    app.reindex_toppings = function (toppings) {
        let i = 0;
        for (t of app.data.toppings) {
            t.topping_idx = i++;
        }
    }

    app.reindex = () => {
        // Adds to the posts all the fields on which the UI relies.

        let i = 0;
        for (let c of app.data.categories) {
            c.cat_idx = i++;
            app.reindex_drinks(c.cat_idx);
        }

        /*
        let i = 0;
        for (let p of app.data.slides) {
            p.slide_idx = i++;
            p.content.slide_number = p.slide_idx;
        }*/
    };

    app.cents = function (dollars) {
        dollars = dollars.toString();
        if (dollars.indexOf('.') < 0) return dollars;

        return Number.parseInt(dollars.split(".").join(""));
    }

    app.save_item = function (cat_idx, drink_idx) {
        let category = app.data.categories[cat_idx];
        if (drink_idx != null) {
            //is drink
            let drink = category.drinks[drink_idx];

            if (_.isEqual(drink.content, drink.original_content)) {
                drink.isEditing = false;
                return;
            }

            //make sure the server get the currency in terms of pennies.
            let data = deepCopy(drink.content);
            data.price = app.cents(data.price);

            axios.post(save_drink_url, data).then(function (res) {
                drink.content.id = res.data.id;
                drink.original_content = deepCopy(drink.content);
                
                drink.isEditing = false;
            }).catch(function () { });
        } else {
            //is category
            if (_.isEqual(category.content, category.original_content)) {
                category.isEditing = false;
                return;
            }
            axios.post(save_category_url, category.content).then(function (res) {
                category.content.id = res.data.id;
                category.original_content = deepCopy(category.content);
                category.isEditing = false;
            }).catch(function () { })
        }
    }

    app.save_toppings = function () {
        toppings = app.data.toppings.map(function (t) {
            t = deepCopy(t);
            t.price = app.cents(t.price);
            return t;
        });

        axios.post(save_topping_url, { toppings: toppings }).then(function (res) {
            app.vue.toppings = app.index_toppings(res.data.drink_toppings)
            app.data.topping_error = false;
        }).catch(function () {
            app.data.topping_error = true;
        });

    }


    app.cancel_edit = (cat_idx, drink_idx) => {
        let category = app.data.categories[cat_idx];
        if (drink_idx != null) {
            let drink = category.drinks[drink_idx];
            drink.content = deepCopy(drink.original_content);
            if (drink.content.id != null) {
                drink.isEditing = false;
            } else {
                //remove the new drink from the list!
                category.drinks.pop()
            }
        } else {
            category.content = deepCopy(category.original_content);

            if (category.content.id != null) {
                category.isEditing = false;
            } else {
                category.pop();
            }


        }
    }

    app.show_drink_modal = function (cat_idx, drink_idx, show) {
        app.data.categories[cat_idx].drinks[drink_idx].show_modal = show;
    }



    app.delete_item = function (cat_idx, drink_idx) {
        let category = app.data.categories[cat_idx];
        if (drink_idx != null) {
            drink = category.drinks[drink_idx];
            if (drink.content.id != null) {
                axios.post(delete_drink_url, drink.content).then(function (res) {
                    category.drinks.splice(drink_idx, 1)
                    app.reindex_drinks(cat_idx);
                }).catch(function () {

                });
            } else {
                category.drinks.splice(drink_idx, 1);
                app.reindex_drinks(cat_idx);
            }
        } else {
            if (category.content.id != null) {
                axios.post(delete_category_url, category.content).then(function (res) {
                    app.data.categories.splice(cat_idx, 1);
                    app.reindex();
                }).catch(function () {

                });
            } else {
                app.data.categories.splice(cat_idx, 1);
                app.reindex();
            }


        }


    }


    app.isEditing_toppings = function () {
        return app.data.toppings.some(function (t) { return t.isEditing });
    }

    app.add_topping = function () {
        app.data.toppings.unshift({
            name: "",
            description: "",
            price: "0.00",
            image: "",
            isEditing: true
        })
        app.reindex_toppings(app.data.toppings);
    }

    app.delete_topping = function (topping_idx) {
        app.data.toppings.splice(topping_idx, 1);
        app.reindex_toppings(app.data.toppings)
    }

    app.uploadedimage = function (slide_idx, filename) {
        slide = app.data.slides[slide_idx];
        slide.content.image = filename;
    }

    app.drink_image_uploaded = function (o, path) {
        let cat = app.data.categories[o.cat_idx];
        drink = cat.drinks[o.drink_idx];
        drink.content.image = path
    }

    app.category_image_uploaded = function (cat_idx, path) {
        let cat = app.data.categories[cat_idx];
        cat.content.image = path;
    }



    // We form the dictionary of all methods, so we can assign them


    // to the Vue app in a single blow.
    app.methods = {
        drink_image_uploaded: app.drink_image_uploaded,
        category_image_uploaded: app.category_image_uploaded,
        add_item: app.add_item,
        edit_item: app.edit_item,
        save_item: app.save_item,
        delete_item: app.delete_item,
        cancel_edit: app.cancel_edit,
        show_drink_modal: app.show_drink_modal,
        isEditing: app.isEditing,
        add_topping: app.add_topping,
        delete_topping: app.delete_topping,
        save_toppings: app.save_toppings,
    };

    app.computed = {
        //isEditing:app.isEditing()
    }

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods,
        computed: app.computed,
    });

    // And this initializes it.
    app.init = () => {

        //start carousel timer
        //app.preview_goto(0);

        axios.get(get_menu_url).then(function (res) {
            app.vue.categories = app.index(res.data.categories);
            app.vue.toppings = app.index_toppings(res.data.drink_toppings);
        });
    };

    // Call to the initializer.
    app.init();
};

init(app);
