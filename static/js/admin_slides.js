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
        slides: [], // See initialization.

        //globals
        global_time_per_slide: "--",

        //preview controls
        preview_hold_slide: true,
        preview_slide_number: 0,
        preview_slide_interval: 0, //reference to timer object   
        //preview data
        preview_content: {
            image: "",
            title: "",
            description: "",
            price: ""
        }

    };

    app.index = (a) => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;
        for (let p of a) {
            //transform all slide data into content and original content, so we 
            //can check if modifications have been made
            p.slide_number = i;
            p.original_content = deepCopy(p)
            p.content = deepCopy(p.original_content);
            _.pick(p, ['original_content', 'content'])

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


    /**
     * helper function that enforces the hold_slide control
     */
    function timer_next_slide() {
        if (!app.data.preview_hold_slide)
            app.preview_next()
    }

    //preview controls
    app.preview_next = function () {
        slide_idx = app.data.preview_slide_number;
        slide_idx = ++slide_idx >= app.data.slides.length ? 0 : slide_idx;
        slide = app.data.slides[slide_idx];
        if (!slide) return;
        app.data.preview_slide_number = slide_idx;
        clearInterval(app.data.preview_slide_interval);
        app.data.preview_slide_interval = setInterval(timer_next_slide, slide.content.time);
    }

    app.preview_previous = function () {
        slide_idx = app.data.preview_slide_number;
        slide_idx = --slide_idx <= 0 ? app.data.slides.length - 1 : slide_idx;
        slide = app.data.slides[slide_idx];
        if (!slide) return;
        app.data.preview_slide_number = slide_idx;
        clearInterval(app.data.preview_slide_interval);
        app.data.preview_slide_interval = setInterval(timer_next_slide, slide.content.time);
    }

    app.preview_goto = function (slide_idx) {
        slide = app.data.slides[slide_idx];
        if (!slide) return;
        app.data.preview_slide_number = slide_idx;
        clearInterval(app.data.preview_slide_interval);
        app.data.preview_slide_interval = setInterval(timer_next_slide, slide.content.time);
    }


    app.preview_hold_slide_toggle = function () {
        if (app.data.preview_hold_slide) {
            slide = app.data.slides[app.data.preview_slide_number];
            app.data.preview_slide_interval = setInterval(timer_next_slide, slide.content.time)
            return;
        }
        clearInterval(app.data.preview_slide_interval);

    }

    //slide controls
    app.add_slide = function () {
        var content = {
            type: "product",
            layout: "left portrait",
            time: 5000,
            slide_number: 0,
            visible: true,
            deleted: false,
            title: "",
            description: "",
            price: "",
            image: ""
        }
        var slide = {
            content: content,
            original_content: {}
        };

        app.data.slides.unshift(slide);
        app.reindex();
    }

    app.set_slide_type = function (slide_idx) {

    }

    app.set_slide_layout = function (slide_idx) {

    }

    app.set_time = function (slide_idx) {
        slide = app.data.slides[slide_idx];
        //this is done automatically :)
    }

    app.set_slide_position = function (slide_idx) {
        slide = app.data.slides[slide_idx];
        let new_pos = slide.content.slide_number;
        if (new_pos >= app.data.slides.length) new_pos = app.data.slides.length - 1;
        if (new_post < 0) new_pos = 0;

    }

    app.set_slide_visible = function (slide_idx, visible) {
        slide = app.data.slides[slide_idx].content;
        slide.visible = visible;
    }

    app.set_slide_deleted = function (slide_idx, isDeleted) {
        slide = app.data.slides[slide_idx].content;
        slide.deleted = isDeleted;
    }

    app.set_slide_text = function (slide_idx) {
        //auto
    }

    app.set_slide_title = function (slide_idx) {
        //auto
    }

    app.set_slide_price = function (slide_idx) {
        //auto
    }

    app.set_slide_image = function (slide_idx) {
        //harder! .. need to upload image from client
        //then set the url to the resulting position in the server
    }

    app.delete_all_slides = function () {
        //all trash
        app.data.slides.forEach(function (slide) {
            slide.content.deleted = true;
        });
    }

    app.save_all_slides = function () {
        slides = (app.data.slides.filter(function (a) { return !_.isEqual(a.content, a.original_content) }).map(function (s) { return s.content }))
        axios.post(post_slides_url, {
            slides: slides
        }).then(function (res) {
            app.data.slides.forEach(function (s) {
                s.original_content = deepCopy(s.content)
            });
        }).catch(function () {

        });

    }




    /**
     * true if any slide has been modified
     */
    app.isModified = function () {
        //find the first element whose content doesnt equal the original content
        return app.data.slides.some(function (element) { return !_.isEqual(element.content, element.original_content) })
    }


    app.do_edit = (slide_idx) => {
        // Handler for button that starts the edit.
        // TODO: make sure that no OTHER post is being edited.
        // If so, do nothing.  Otherwise, proceed as below.
        let p = app.data.slides[slide_idx];
        //if (app.isEditing() || user_email != p.email) return;
        p.edit = true;
        p.is_pending = false;
    };

    app.do_cancel = (slide_idx) => {
        // Handler for button that cancels the edit.
        let p = app.data.slides[slide_idx];
        p.error = "";
        if (p.id === null) {
            // If the post has not been saved yet, we delete it.
            app.vue.slides.splice(slide_idx, 1);
            app.reindex();
        } else {
            // We go back to before the edit.
            p.edit = false;
            p.is_pending = false;
            p.content = p.original_content;
        }
    }

    app.do_save = (slide_idx) => {
        // Handler for "Save edit" button.
        let p = app.vue.slides[slide_idx];
        if (p.content == "") {
            p.error = "Post cannot be empty."
            return;
        }
        p.error = "";
        if (p.content !== p.server_content) {
            p.is_pending = true;
            axios.post(posts_url, {
                content: p.content,
                id: p.id,
                is_reply: p.is_reply,
            }).then((result) => {
                console.log("Received:", result.data);

                p.edit = false;
                p.content = result.data.content;
                p.id = result.data.id;
                p.server_content = p.content;
                p.original_content = p.content;
                // TODO: You are receiving the post id (in case it was inserted),
                // and the content.  You need to set both, and to say that
                // the editing has terminated.
            }).catch(() => {
                p.is_pending = false;
                console.log("Caught error");
                p.error = "Problem while posting, please try again."
                // We stay in edit mode.
            });
        } else {
            // No need to save.
            p.edit = false;
            p.original_content = p.content;
        }
    }

    app.add_post = () => {
        // TODO: this is the new post we are inserting.
        // You need to initialize it properly, completing below, and ...

        //if (app.isEditing()) return;

        let q = {
            id: null,
            edit: true,
            editable: true,
            content: "",
            server_content: null,
            original_content: "",
            author: author_name,
            email: user_email,
            is_reply: null,
            children: 0,
            error: false
        };
        // TODO:
        // ... you need to insert it at the top of the post list.
        app.vue.posts.splice(0, 0, q);
        app.reindex();
    };

    app.reply = (slide_idx) => {
        //if (app.isEditing()) return;
        let p = app.vue.posts[slide_idx];
        if (p.id !== null) {
            // TODO: this is the new reply.  You need to initialize it properly...
            let q = {
                id: null,
                edit: true,
                editable: true,
                content: "",
                server_content: null,
                original_content: "",
                author: author_name,
                email: user_email,
                is_reply: p.id,
                error: false,
            };

            q.parent = p;
            app.vue.posts.splice(slide_idx + 1, 0, q);
            p.children++;
            app.reindex();
            // TODO: and you need to insert it in the right place, and reindex
            // the posts.  Look at the code for app.add_post; it is similar.
        }
    };

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

    app.uploadedimage = function(slide_idx, filename){
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

        uploadedimage:app.uploadedimage,

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
