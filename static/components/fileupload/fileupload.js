(function(){

    var uploader = {
        props: ['url', 'emitid'],
        data: null,
        methods: {
            uploaded(emitid, data){
                this.$emit('uploaded', emitid, data)
            }

        }
    };

    uploader.data = function() {
        var data = {
            server_url: this.url,
        };
        return data;
    };

    uploader.enumerate = function (a) {
        // Adds an _idx attribute to each element of array a.
        let k=0;
        a.map(function(e) {e._idx = k++;});
    };

    uploader.methods.upload_file = function (event) {
        let self = this;
        // Reads the file.
        let input = event.target;
        let file = input.files[0];
        
        if (file) {
            let formData = new FormData();
            formData.append('file', file);
            axios.post(self.server_url, formData,
                {headers: {'Content-Type': 'multipart/form-data'}})
                .then(function (res) {
                    var filename = res.data;
                    self.uploaded(self.emitid, filename);
                    //get the file name assigned by server
                    //send the filename to parent vue
                    console.log("Uploaded " + filename);
                })
                .catch(function () {
                    console.log("Failed to upload");
                });
        }
    };

    utils.register_vue_component('fileupload', 'components/fileupload/fileupload.html', function(template) {
            uploader.template = template.data;
            return uploader;
        });
})();
