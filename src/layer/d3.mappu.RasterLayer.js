  /**
	 
  **/
  d3.mappu.RasterLayer = function(name, config){
      return d3_mappu_RasterLayer(name, config);
  };
  
  d3_mappu_RasterLayer = function(name, config) {
      var self = this;
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      var layertype = 'raster';
      var drawboard;
      var _url = config.url;
      
      Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            draw();
        }
      });
      
      
      //Clear all tiles
      layer.clear = function(){
      };
      
      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = self.map.tiles;
         drawboard.attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")");
         var image = drawboard.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         imageEnter.append("image")
              .classed('tile',true)
              .attr("xlink:href", function(d) {
                var url = "";
                url = _url    
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
      
      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', this.opacity).style('display',this._display);
      };
      
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_RasterLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  