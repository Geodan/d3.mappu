/**
 Generic layer object, to be extended.
**/

(function(){
  "use strict";
  d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
  };
  
  d3_mappu_Layer = function(name, config){
      var layer = {};  
      this.name = name;
      this.config = config;
      this.id = null;//TODO: automatic ID gen
      
      
      Object.defineProperty(layer, 'name', {
        value: '',
        get: function() {
            return this.name;
        },
        set: function(name) {
            this.name = name;
        }
      });
      
      //TODO: Move to vectorlayer
      Object.defineProperty(layer, 'features', {
        value: [],
        get: function() {
            return this.features;
        },
        set: function(data) {
            this.features = features;
            //redraw
        }
      });
      
      Object.defineProperty(layer, 'opacity', {
        value: 1,
        get: function() {
            return this.opacity;
        },
        set: function(data) {
            this.opacity = opacity;
            //redraw
        }
      });
      
      Object.defineProperty(layer, 'visible', {
        value: true,
        get: function() {
            return this.visible;
        },
        set: function(data) {
            this.visible = visible;
            //redraw
        }
      });
      
      
      
        /*
         exposed:
        */
    
        layer.refresh =  function(){
        };
        layer.moveUp = function(){
        };
        layer.moveDown = function(){
        };
    
        /*    
         private:
        */
        this._onAdd =  function(map){ //Adds the layer to the given map object
        };
        this._onRemove = function(){ //Removes the layer from the map object
        };
        this._draw = function(){
        };
        
        return layer;
    };
})();