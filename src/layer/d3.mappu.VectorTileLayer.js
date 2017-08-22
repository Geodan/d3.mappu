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
      var _filter = config.filter;
      
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
      	  	  	  if (key == 'fill' && d.geometry.type.indexOf('Polygon') == -1){
      	  	  	  	  entity.style(key, 'none');
      	  	  	  }
      	  	  	  entity.style(key, style[key]);
      	  	  }
      	  }
      	  
      	  //Now use per-feature styling
      	  if (d.style){
      	  	  for (var key in d.style) {
      	  	  	  if (key == 'fill' && d.geometry.type.indexOf('Polygon') == -1){
      	  	  	  	  entity.style(key, 'none');
      	  	  	  }
      	  	  	  entity.style(key, d.style[key]);
      	  	  }
      	  }
      }
      
      function tileurl(d){
      	  var 	x = d.x,
      	  		y = d.y,
      	  		z = d.z;
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
		
		/* Test with MVT */
		if (url.indexOf('.mvt') > -1){
			this._xhr = d3.request(url).responseType('arraybuffer').get(function(error, json) {
				var layers = [layername];
				var vtile = new VectorTile( new pbf( new Uint8Array(json.response) ) );
				var extents = 4096;
				var data = {};
				
				for (var key in vtile.layers) {
					data[key] = vtile.layers[layername].toGeoJSON();
				}
				if (!data[layername]){return;}
				var features = data[layername].features;
				var entities = tile.selectAll('path').data(features, function(d){
					return d.id;
				});
				var tile_projection = d3.geoTransform({
					point: function(x, y) {
					  // Sometimes PBF points in a mixed-geometry layer are corrupted
					  if(!isNaN(y)){
						x = x/extents*256;
						y = y/extents*256;
					  } else {
						y = x[0][1]/extents * 256;
						x = x[0][0]/extents * 256;
					  }
					  this.stream.point(x, y);
					}
				});
				var tilePath = d3.geoPath()
					.projection(tile_projection)
				var newentity = entities.enter().append('path')
					.attr('id',function(d){
							return 'entity'+ d.properties.id;
					})
					.attr('class',function(d){return d.properties.kind;})
					.attr("d", tilePath)
					.style('pointer-events','visiblepainted');//make clickable;
				newentity.each(setStyle);
				entities.exit().remove();
				
				// Add events from config
				  if (_events){
					  _events.forEach(function(d){
						 newentity.each(function(){
							d3.select(this).on(d.event, d.action);
						 });
					  });
				  }
			});
		}
	  
		  
		/* END of test with mvt */
		else {
		
			this._xhr = d3.json(url, function(error, json) {
				if (error) throw error;
				
				var k = Math.pow(2, d[2]) * 256; // size of the world in pixels
				
				_path.projection()
					.translate([k / 2 - d[0] *256, k / 2 - d[1] *256]) // [0�,0�] in pixels
					.scale(k / 2 / Math.PI);
				
				if (json.objects){
					var features = topojson.feature(json,json.objects[layername]).features;	
				} else if (json.features){
					var features = json.features;
				} else {
					throw "Can't work with this vectortile data";
				}
				
				if (typeof _filter === 'function'){
					features = features.filter(_filter);
				}
				
				var entities = tile.selectAll('path').data(features, function(d){
					return d.id;
				});
				
				var newentity = entities.enter().append('path')
					.attr('id',function(d){
							return 'entity'+ d.properties.id;
					})
					.attr('class',function(d){return d.properties.kind;})
					.attr("d", _path)
					.style('pointer-events','visiblepainted');//make clickable;
				newentity.each(setStyle);
				entities.exit().remove();
				
				// Add events from config
				  if (_events){
					  _events.forEach(function(d){
						 newentity.each(function(){
							d3.select(this).on(d.event, d.action);
						 });
					  });
				  }
			});
		}
		
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
  
  //                                                                          マップ
  