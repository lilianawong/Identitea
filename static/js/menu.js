
// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        category: [],
        modalIsActive: false,
        modalname:"", 
        modaldescription:"",
        modalimages:"",

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

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        // Complete.
        goto_page: function (page_name) {

            //pre-init
            if (page_name == "posts") {

            } else if (page_name == "add_post") {
                app.vue.new_post_text = "";
            }

            app.vue.page = page_name
        },
        descrip: function () {

        },
        like: function (post_idx) {
            let post = app.vue.posts[post_idx];
            let url = rating_url + '&post_id=' + post.id
            url = url + "&rating=" + (post.user_rating == 1 ? 3 : 1)
            axios.post(url, {}).then(
                function (res) {
                    post.user_rating = res.data.rating;
                    post.liked = res.data.post.liked;
                    post.disliked = res.data.post.disliked;
                }
            );
        },
        dislike: function (post_idx) {
            let post = app.vue.posts[post_idx];
            let url = rating_url + "&post_id=" + post.id;
            url = url + "&rating=" + (post.user_rating == 0 ? 3 : 0);
            axios.post(url, {}).then(
                function (res) {
                    post.user_rating = res.data.rating;
                    post.disliked = res.data.post.disliked;
                    post.liked = res.data.post.liked;
                }
            );
        },
        hovThumb: function (p, h) {
            p._hover_thumbs = h;
        },
        deleted: function (post_idx) {
            let post = app.vue.posts[post_idx];
            axios.post(delete_url + "&post_id=" + post.id, {}).then(
                function (res) {
                    app.init();
                }
            )
        },
        close:function(){
            app.data.modalIsActive = false;
            
        },
        activatemodal: function (name, description, images) {
            
            app.data.modalIsActive = true;
            app.data.modalname=name
            app.data.modaldescription=description
            app.data.modalimages=images
            
            

        },
        
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
            app.vue.category = app.reindex(result.data.category);

        })
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
