  /**
	 
  **/
  d3.mappu.VectorTileLayer = function(name, config){
      return d3_mappu_VectorTileLayer(name, config);
  };
  
  d3_mappu_VectorTileLayer = function(name, config) {
  	  var self = this;
  	  config = config || {};
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vectortile';
			var _url = config.url;                           
			var _duration = config.duration || 0;
			var _path;
			var _projection;
			var style = config.style || {};
      
	  Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            draw();
        }
      });
      	
      function setStyle(d){
      	  var entity = d3.select(this);
      	  //Do generic layer style
      	  if (style){
      	  	  for (var key in style) { 
      	  	  	  entity.style(key, style[key]);
      	  	  }
      	  }
      	  
      	  //Now use per-feature styling
      	  if (d.style){
      	  	  for (var key in d.style) { 
      	  	  	  entity.style(key, d.style[key]);
      	  	  }
      	  }
      }
      
      function tileurl(d){
          return _url    
				.replace('{s}',["a", "b", "c", "d"][Math.random() * 3 | 0])
				.replace('{z}',d[2])
				.replace('{x}',d[0])
				.replace('{y}',d[1])
				//FIXME: why are these curly brackets killed when used with polymer?                    
				.replace('%7Bs%7D',["a", "b", "c", "d"][Math.random() * 3 | 0])
				.replace('%7Bz%7D',d[2])
				.replace('%7Bx%7D',d[0])
				.replace('%7By%7D',d[1]);
      }
      
      //each tile can be considered it's own drawboard, on which we build
      function build(d){
      	var tile = d3.select(this);
		var url = tileurl(d);
		_projection = d3.geo.mercator();
		_path = d3.geo.path().projection(_projection);
		this._xhr = d3.json(url, function(error, json) {
			var k = Math.pow(2, d[2]) * 256; // size of the world in pixels
			_path.projection()
			  	.translate([k / 2 - d[0] *256, k / 2 - d[1] *256]) // [0°,0°] in pixels
				.scale(k / 2 / Math.PI);
			
			var features = json.features;
			var entities = tile.selectAll('path').data(features, function(d){
				return d.id;
			});
			var newentity = entities.enter().append('path')
				.attr('id',function(d){
						return 'entity'+ d.id;
				})
				//.attr('class',function(d){return d.properties.kind;})
				.attr("d", _path);
			entities.exit().remove();
		});
      }
    
      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         var zoombehaviour = layer.map.zoombehaviour;
         
         drawboard.transition().duration(_duration)
         	.attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
         	.style("stroke-width",1/ zoombehaviour.scale()*100);
         	
         
         var image = drawboard
         	//.style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))//?? Is this needed?
         	.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         if (layer.visible){
         	 var scale = 1/256;
         	 var tile = imageEnter.append("g")
				  .attr("class", "tile")
				  .attr("transform", function(d){
		 			return "translate(" + d[0] + " " +d[1]+")scale("+scale+")"
		 		  });
			 tile.each(build);
			 tile.each(setStyle);
         }
         image.exit()
         	.remove();
      };
      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', this.opacity).style('display',this.visible?'block':'none');
      };
      
      
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_VectorTileLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  //                                                                          ãƒžãƒƒãƒ—
  