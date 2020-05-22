// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        posts: [], // See initialization.
        new_post_content: "",
        user_email: user_email
    };

    app.index = (a) => {
        // Adds to the posts all the fields on which the UI relies.
        var parent = {};
        let i = 0;
        for (let p of a) {
            p._idx = i++;
            // TODO: Only make the user's own posts editable.
            if (!p.is_reply) {
                parent = p;
            } else {
                p.parent = parent;
            }

            //p.editable = true;
            p.edit = false;
            p.is_pending = false;
            p.error = false;
            p.original_content = p.content; // Content before an edit.
            p.server_content = p.content; // Content on the server.
        }
        return a;
    };

    app.reindex = () => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;
        for (let p of app.vue.posts) {
            p._idx = i++;
        }
    };


    app.isEditing = function () {
        return app.data.posts.some(function (element) { return element.edit; });
    }


    app.do_edit = (post_idx) => {
        // Handler for button that starts the edit.
        // TODO: make sure that no OTHER post is being edited.
        // If so, do nothing.  Otherwise, proceed as below.
        let p = app.vue.posts[post_idx];
        if (app.isEditing() || user_email != p.email) return;
        p.edit = true;
        p.is_pending = false;
    };

    app.do_cancel = (post_idx) => {
        // Handler for button that cancels the edit.
        let p = app.vue.posts[post_idx];
        p.error = "";
        if (p.id === null) {
            // If the post has not been saved yet, we delete it.
            app.vue.posts.splice(post_idx, 1);
            app.reindex();
        } else {
            // We go back to before the edit.
            p.edit = false;
            p.is_pending = false;
            p.content = p.original_content;
        }
    }

    app.do_save = (post_idx) => {
        // Handler for "Save edit" button.
        let p = app.vue.posts[post_idx];
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

        if (app.isEditing()) return;

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

    app.reply = (post_idx) => {
        if (app.isEditing()) return;
        let p = app.vue.posts[post_idx];
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
                error:false,
            };

            q.parent = p;
            app.vue.posts.splice(post_idx + 1, 0, q);
            p.children++;
            app.reindex();
            // TODO: and you need to insert it in the right place, and reindex
            // the posts.  Look at the code for app.add_post; it is similar.
        }
    };

    app.do_delete = (post_idx) => {
        let p = app.vue.posts[post_idx];
        if (p.id === null) {
            // TODO:
            // If the post has never been added to the server, simply deletes it.
            p.parent.children--;
            app.vue.posts.splice(post_idx, 1);
            app.reindex();
        } else {
            axios.post(delete_url, { id: p.id }).then(function () {
                p.parent.children--;
                app.vue.posts.splice(post_idx, 1);
                app.reindex();
            });
            // TODO: Deletes it on the server.
        }

    };

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        do_edit: app.do_edit,
        do_cancel: app.do_cancel,
        do_save: app.do_save,
        add_post: app.add_post,
        reply: app.reply,
        do_delete: app.do_delete,
        isEditing: app.isEditing
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
        // You should load the posts from the server.
        // This is purely debugging code.
        /*
        posts = [
            // This is a post.
            {
                id: 1,
                content: "I love apples",
                author: "Joe Smith",
                email: "joe@ucsc.edu",
                is_reply: null, // Main post.  Followed by its replies if any.
            },
            {
                id: 2,
                content: "I prefer bananas",
                author: "Elena Degiorgi",
                email: "elena@ucsc.edu",
                is_reply: 1, // This is a reply.
            },
            {
                id: 3,
                content: "I prefer bananas",
                author: "Elena Degiorgi",
                email: "elena@ucsc.edu",
                is_reply: 1, // This is a reply.
            },
        ];
        */
        // We set the posts. This is how it is done in reality. 


        axios.get(posts_url).then(function (res) {
            app.vue.posts = app.index(res.data.posts);
        });

        //app.vue.posts = app.index(posts);
        // TODO: Load the posts from the server instead.
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
