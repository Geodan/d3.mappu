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
      var pi = Math.PI;
      var tau = 2 * pi;
      var _url = config.url;                           
      var _duration = config.duration || 0;
      var _path;
      var _projection;
      var tms = config.tms;
      var layername = config.layername;
      var style = config.style || {};
      var labelStyle = config.labelStyle || {};
      var _events = config.events;
      
	  Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            draw();
        }
      });
      
      Object.defineProperty(layer, 'events', {
        get: function() {
            return _events;
        },
        set: function(array) {
            _events = array;
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
      	  var 	x = d[0],
      	  		y = d[1],
      	  		z = d[2];
      	  if (tms) {
      	  	  y = Math.pow(2, z) - y - 1; //TMS reverse for Y-down
      	  }
          return _url    
				.replace('{s}',["a", "b", "c", "d"][Math.random() * 3 | 0])
				.replace('{z}',z)
				.replace('{x}',x)
				.replace('{y}',y)
				//FIXME: why are these curly brackets killed when used with polymer?                    
				.replace('%7Bs%7D',["a", "b", "c", "d"][Math.random() * 3 | 0])
				.replace('%7Bz%7D',z)
				.replace('%7Bx%7D',x)
				.replace('%7By%7D',y);
      }
      
      //each tile can be considered it's own drawboard, on which we build
      function build(d){
      	var tile = d3.select(this);
		var url = tileurl(d);
		_projection = d3.geoMercator();
		_path = d3.geoPath().projection(_projection);
		
		this._xhr = d3.json(url, function(error, json) {
			if (error) throw error;
			
			var k = Math.pow(2, d[2]) * 256; // size of the world in pixels
			
			_path.projection()
				.translate([k / 2 - d[0] *256, k / 2 - d[1] *256]) // [0°,0°] in pixels
				.scale(k / 2 / Math.PI);
			/* TT: WORK IN PROGRESS FOR ALREADY PROJECTED DATA
			function matrix(a, b, c, d, tx, ty) {
			  return d3.geoTransform({
				point: function(x, y) {
				  this.stream.point(a * x + b * y + tx, c * x + d * y + ty);
				}
			  });
			}
			var tx = 0; //k / 2 - d[0] *256;
			var ty = 0 ; //k / 2 - d[0] *256;
			
			
			var scale = 1/256;
			var path = d3.geoPath()
				.projection(matrix(scale, 0, 0, scale, tx, ty));
			/* END OF WORK IN PROGRESS */
			
			if (json.objects){
				var features = topojson.feature(json,json.objects[layername]).features;	
			} else if (jsonl.features){
				var features = json.features;
			} else {
				throw "Can't work with this vectortile data";
			}
			
			//TT: TODO: add option for topojson input
			//var collection = topojson.feature(json, json.objects.pand);
			
			var entities = tile.selectAll('path').data(features, function(d){
				return d.id;
			});
			var newentity = entities.enter().append('path')
				.attr('id',function(d){
						return 'entity'+ d.id;
				})
				.attr('class',function(d){return d.properties.kind;})
				.attr("d", _path)
				.style('pointer-events','visiblepainted');//make clickable;
			
			entities.exit().remove();
			
			// Add events from config
			  if (_events){
				  _events.forEach(function(d){
					 newentity.each(function(){
						d3.select(this).select('path').on(d.event, d.action);
					 });
				  });
			  }
		});
		
      }
    
      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         var transform = layer.map.transform;
         	
		 
		 var image = drawboard.select('g')
			.attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
			.style("stroke-width",1/ transform.k*100)
			.selectAll(".tile")
			.data(tiles, function(d) { return d; });
		
		image.exit()
		  .each(function(d) { if (this._xhr) this._xhr.abort(); })
		  .remove();
		  
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
  