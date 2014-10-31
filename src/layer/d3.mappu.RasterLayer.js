  /**
	 
  **/
  d3.mappu.RasterLayer = function(name, config){
      return d3_mappu_RasterLayer(name, config);
  };
  
  d3_mappu_RasterLayer = function(name, config) {
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      this._layertype = 'raster';
      
      //Clear all tiles
      layer.clear = function(){
      };
      
      //Draw the tiles (based on data-update)
      layer.draw = function(){
          
      };
      
      //Refresh the tiles (no data-update involved)
      layer.refresh = function(){
          //apply opacity
          
      };
      
      return layer;
  };
  
  d3_mappu_RasterLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  