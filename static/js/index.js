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

    app.attachCarousel = function(){
        var carousels = bulmaCarousel.attach('.carousel', {

            navigationSwipe:true,
            pagination:true,
            //loop:true,
            infinite:true,
            //effect:'fade',
            duration:300,
            autoplay:true,
            autoplaySpeed:app.data.slides[0] ? app.data.slides[0].content.time : 3000,
        });

            // Loop on each carousel initialized
            for (var i = 0; i < carousels.length; i++) {
                // Add listener to  event
                carousels[i].on('before:show', state => {
                    console.log(state);
                });
            }

            // Access to bulmaCarousel instance of an element
            var element = document.querySelector('#my-element');
            if (element && element.bulmaCarousel) {
                // bulmaCarousel instance is available as element.bulmaCarousel
                element.bulmaCarousel.on('before-show', function (state) {
                    console.log(state);
                });
            }
    }



    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {


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
        mounted: function () {
            
        }
    });

    // And this initializes it.
    app.init = () => {
        axios.get(get_slides_url).then(function (res) {
            app.vue.slides = app.index(res.data.slides);
            setTimeout(function(){
                app.attachCarousel();
            }, 0)
        });
    };

    // Call to the initializer.
    app.init();
};

init(app);





