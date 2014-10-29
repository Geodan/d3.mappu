  /**
	 
  **/
  d3.mappu.RasterLayer = function(name, config){
      return d3_mappu_RasterLayer(name, config);
  };
  
  d3_mappu_RasterLayer = function(name, config) {
      var self = this;
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      this._layertype = 'raster';
      this.drawboard = map.svg.append('g');
      this._url = config.url;
      this._type = config.type;
      this._name = name;
      
      Object.defineProperty(this, 'url', {
        get: function() {
            return this._url;
        },
        set: function(url) {
            this._url = url;
            this.draw();
        }
      });
      
      
      //Clear all tiles
      layer.clear = function(){
      };
      
      //Draw the tiles (based on data-update)
      layer.draw = function(){
         var image = self.drawboard.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         imageEnter.append("image")
              .classed('tile',true)
              .attr("xlink:href", function(d) {
                var url = "";
                url = self._url    
                    .replace('{s}',["a", "b", "c", "d"][Math.random() * 4 | 0])
                    .replace('{z}',d[2])
                    .replace('{x}',d[0])
                    .replace('{y}',d[1])
                    //FIXME: why are these curly brackets killed when used with polymer?
                    .replace('%7Bs%7D',["a", "b", "c", "d"][Math.random() * 4 | 0])
                    .replace('%7Bz%7D',d[2])
                    .replace('%7Bx%7D',d[0])
                    .replace('%7By%7D',d[1]);
                return url;
              })
              .attr("width", 1)
              .attr("height", 1)
              .attr('opacity', self._opacity)
              .attr("x", function(d) { return d[0]; })
              .attr("y", function(d) { return d[1]; });
         image.exit().remove();
      };
      
      //Refresh the tiles (no data-update involved)
      layer.refresh = function(){
          //apply opacity
          
      };
      
      return layer;
  };
  
  d3_mappu_RasterLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  