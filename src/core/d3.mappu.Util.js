import "../d3.mappu";

(function(){
    "use strict";
    
    var _ctr = 0;
    
    
    d3.mappu.createID = function(){
        var id = "MAPPU-"+_ctr;
        _ctr++
        return id;
    }

})

//                                                                          マップ