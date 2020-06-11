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
        orders: [], // See initialization.
    };

    app.index = (a) => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;
        for (let p of a) {
            p._idx = i++;
            p = app.parseOrder(p);
        }
        return a;
    };

    app.parseOrder = function (p) {
        p.order_json = JSON.parse(p.order_json);
        p.order_items = p.order_json.map(function (i) {
            return {
                item: i.item + " x " + i.qty,
                details: [
                    "size: " + i.size,
                    "sweetness: " + i.sweet + "%",
                    "Ice:" + i.ice,
                    "extras: " + i.extras.reduce(function(acc,e){return acc + e.name + ", "},""),
                    "sp: " + i.special_request ? i.special_request : "None"
                ]
            }
        });
        return p;
    }

    app.reindex = () => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;
        for (let p of app.data.slides) {
            p._idx = i++;

        }
    };

    app.fulfill = function (_idx) {
        let order = app.data.orders[_idx]
        axios.post(fulfil_order_url, {
            id:order.id
        }).then(function(res){
            order.fulfilled = true;
        }).catch(function(){

        })

    }

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        fulfill: app.fulfill

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

    setInterval(function(){
        axios.get(get_orders_url).then(function (res) {
            app.vue.orders = app.index(res.data.orders);
        });
    }, 5000);


    // And this initializes it.
    app.init = () => {
        axios.get(get_orders_url).then(function (res) {
            app.vue.orders = app.index(res.data.orders);
        });
    };

    // Call to the initializer.
    app.init();
};

init(app);




