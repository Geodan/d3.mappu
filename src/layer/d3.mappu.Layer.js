/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
};

d3_mappu_Layer = function(name, config){
	config = config || {};
    var layer = {};
    var _map;
    var _id = d3.mappu.util.createID();
    var _name = name;
    //TODO: parse config
    var _opacity = 1;
    _opacity = config.opacity || 1;
    var _visible = true;
    if (typeof(config.visible) == 'boolean' || config.visible == 'true' || config.visible == 'false'){
    	_visible = config.visible;
    }
    
	var _display = 'block';
	var _zindex = 0;
    var refresh = function(){
    };
    var moveUp = function(){
    };
    var moveDown = function(){
    };
    
    var setZIndex = function(i){
    	layer.zindex = i;
    };
    
    var addTo = function(map){
        map.addLayer(layer);
        map.resize();//TODO: is this needed?
        return layer;
    };
    
    Object.defineProperty(layer, 'id', {
        get: function() {return _id;},
        set: function() {console.warn('setting ID not allowed for layer');}
    });
    
    Object.defineProperty(layer, 'name', {
        get: function() {
            return _name;
        },
        set: function(val) {
            _name = val;
        }
    });
    
    Object.defineProperty(layer, 'map', {
        get: function() {
            return _map;
        },
        set: function(val) {
            _map = val;
        }
    });
    
    Object.defineProperty(layer, 'opacity', {
        get: function() {
            return _opacity;
        },
        set: function(val) {
            _opacity = val;
            layer.refresh(0);
        }
    });
    
    
    Object.defineProperty(layer, 'visible', {
        get: function() {
            return _visible;
        },
        set: function(val) {
            _visible = val;
            layer.draw(true);
            layer.refresh(0);
        }
    });
    
    Object.defineProperty(layer, 'zindex', {
        get: function() {
            return _zindex;
        },
        set: function(val) {
            _zindex = val;
            if (layer.map){
            	layer.map.orderLayers();
            }
        }
    });
    
    /* exposed: */
    layer.refresh = refresh;  
    layer.moveUp = moveUp;
    layer.moveDown = moveDown;
    layer.addTo = addTo;
    layer.setZIndex = setZIndex;

    /* private: */
    /* Obsolete?
    layer._instantiate = function(mapdiv){
    	layer.drawboard = d3.select(mapdiv)
				.append( 'svg' )
				.attr( 'id', function( d ) { return d.id;} )
				.style( 'position', 'absolute' )
				.style( 'pointer-events','none') //make svg permeable for events 
				.classed( 'drawboard', true );
			layer.drawboard.append( 'g' );
    }
    */
    layer._onAdd =  function(map){ //Adds the layer to the given map object
        _map = map;
        map.orderLayers();
        layer.draw();
		var event = new CustomEvent("layeradded", { "detail": layer});
			layer.map.mapdiv.dispatchEvent(event);
    };
    layer._onRemove = function(){ //Removes the layer from the map object
    	var event = new CustomEvent("layerremoved");
    	layer.map.mapdiv.dispatchEvent(event);
    };
    
    
    return layer;
};
//                                                                          マップ
