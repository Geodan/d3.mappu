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
      var _ogc_type = config.ogc_type || 'tms';
      var _layers = config.layers;
      
      Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            draw();
        }
      });
      
      Object.defineProperty(layer, 'layers', {
        get: function() {
            return _layers;
        },
        set: function(val) {
            _layers = val;
            draw();
        }
      });
      
      
      //Clear all tiles
      layer.clear = function(){
      };
      
      var tileurl = function(d){
          var url;
          if (_ogc_type == 'tms') {
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
          }
          else if (_ogc_type == 'wms'){
                //This calculation only works for tiles that are square and always the same size
                var numtiles = 2 << (d[2]-1);
                var tilesize = (20037508.34 * 2) / (numtiles);
                var x = -20037508.34 + (d[0] * tilesize);
                var y = 20037508.34 - ((d[1]+1) * tilesize);//shift 1 down, because we want LOWER left
                var bbox = x + ", "+ y + "," + (x + tilesize) + "," + (y + tilesize);
                url =  _url + 
                     "&bbox=" + bbox + 
                     "&layers=" + _layers + 
                     "&service=WMS&version=1.1.0&request=GetMap&tiled=true&styles=&width=256&height=256&srs=EPSG:900913&transparent=TRUE&format=image%2Fpng";
          }
          return url;
      };
      
      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         drawboard.attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")");
         var image = drawboard.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         imageEnter.append("image")
              .classed('tile',true)
              .attr("xlink:href", tileurl)
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
  
  