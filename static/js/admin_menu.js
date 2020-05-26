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
                return d.isEditing();
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
                name: "",
                description: "",
                image: ""
            };
            category.drinks.push(drink);
            app.reindex_drinks(cat_idx);
        } else {
            if (app.isEditing()) return;
            category = {
                image: "",
                name: ""
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
        }
    }

    app.index_drinks = function (category_idx) {
        let category = app.data.categories[category_idx];
        let drinks = category.drinks;
        let i = 0;
        for (d of drinks) {
            d.content = deepCopy(d)
            d.original_content = deepCopy(d)
            d = _.pick(d, ['original_content', 'content'])
            d.drink_idx = i++;
        }
    }


    app.index = (a) => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;

        for (let c of a) {
            c.content = deepCopy(c);
            c.original_content = deepCopy(c);
            c = _.pick(c, ['original_content', 'content'])
            c.slide_idx = i++;
            app.index_drinks(c.slide_idx);
        }



        for (let p of a) {
            //transform all slide data into content and original content, so we 
            //can check if modifications have been made
            p.slide_number = i;
            p.original_content = deepCopy(p)
            p.content = deepCopy(p.original_content);
            p = _.pick(p, ['original_content', 'content'])

            //add id after transform so that it doesn't exist in content
            p.slide_idx = i++;
        }
        return a;
    };

    app.reindex = () => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;
        for (let p of app.data.slides) {
            p.slide_idx = i++;
            p.content.slide_number = p.slide_idx;
        }
    };

    app.save_item = function (cat_idx, drink_idx) {
        let category = app.data.categories[cat_idx];
        if (drink_idx != null) {
            let drink = category.drinks[drink_idx];
            axios.post(save_drink_url, drink).then(function () {
                drink.isEditing = false;
            }).catch(function () { });
        } else {
            axios.post(save_category_url, category).then(function () {
                category.isEditing = false;
            }).catch(function () { })
        }
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
            
            if(category.content.id != null){
                category.isEditing = false;
            }else{
                category.pop();
            }
            
            
        }
    }

    app.do_delete = (slide_idx) => {
        let p = app.vue.posts[slide_idx];
        if (p.id === null) {
            // TODO:
            // If the post has never been added to the server, simply deletes it.
            p.parent.children--;
            app.vue.posts.splice(slide_idx, 1);
            app.reindex();
        } else {
            axios.post(delete_url, { id: p.id }).then(function () {
                p.parent.children--;
                app.vue.posts.splice(slide_idx, 1);
                app.reindex();
            });
            // TODO: Deletes it on the server.
        }

    };

    app.uploadedimage = function (slide_idx, filename) {
        slide = app.data.slides[slide_idx];
        slide.content.image = filename;
    }

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        do_edit: app.do_edit,
        do_cancel: app.do_cancel,
        do_save: app.do_save,
        add_post: app.add_post,
        reply: app.reply,
        do_delete: app.do_delete,

        add_slide: app.add_slide,
        isModified: app.isModified,
        save_all_slides: app.save_all_slides,
        set_slide_visible: app.set_slide_visible,
        set_slide_deleted: app.set_slide_deleted,

        preview_next: app.preview_next,
        preview_previous: app.preview_previous,
        preview_goto: app.preview_goto,
        preview_hold_slide_toggle: app.preview_hold_slide_toggle,

        uploadedimage: app.uploadedimage,

        //isEditing: app.isEditing
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
        app.preview_goto(0);

        axios.get(get_slides_url).then(function (res) {
            app.vue.slides = app.index(res.data.slides);
        });
    };

    // Call to the initializer.
    app.init();
};

init(app);
