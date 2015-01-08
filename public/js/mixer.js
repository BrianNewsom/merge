function load(){
    // TODO: There's gotta be a way to do this w/o loading all the data twice!
    $(document).ready(function(){
        $.getJSON(document.URL + "/get")
            .done(function(data){
                console.log(data);
                loadBuffers(data.stems);
                // Initialize all buffers
                var inits = [];
                for (var i = 0 ; i < data.stems.length ; i++){
                    var name = data.stems[i]['name'];
                    inits.push(name);
                }
                Mixer.init(inits);
            });
    });
}

load();
