/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
};

d3_mappu_Layer = function(name, config){
    var layer = {};
    var map;
    var _id = new Date().getTime();//TODO: automatic ID gen
    var _name = name;
    var opacity = 1;
    var  visible = true;  
    this._display = 'block';
    
    var refresh = function(){
    };
    var moveUp = function(){
    };
    var moveDown = function(){
    };
    var addTo = function(map){
        map = map;
        layer.drawboard = map.svg.append('g');
        map.addLayer(layer);
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
    
    Object.defineProperty(layer, 'opacity', {
        get: function() {
            return opacity;
        },
        set: function(val) {
            opacity = val;
            layer.refresh();
        }
    });
    
    Object.defineProperty(layer, 'visible', {
        get: function() {
            return visible;
        },
        set: function(val) {
            if (val){
                this._display = 'block';
            }
            else {
                this._display = 'none';
            }
            visible = val;
            layer.refresh();
        }
    });
    
    /* exposed: */
    layer.refresh = refresh;  
    layer.moveUp = moveUp;
    layer.moveDown = moveDown;
    layer.addTo = addTo;

    /* private: */
    layer._onAdd =  function(map){ //Adds the layer to the given map object
        map = map;
        drawboard = map.svg.append('g');
    };
    layer._onRemove = function(){ //Removes the layer from the map object
    };
    
    return layer;
};
