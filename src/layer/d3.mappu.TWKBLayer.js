  /**

  **/
  d3.mappu.TWKBLayer = function(name, config){
      return d3_mappu_TWKBLayer(name, config);
  };

  d3_mappu_TWKBLayer = function(name, config) {
      var self = this;
      config = config || {};
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vector';
      var _url = config.url;
      var _options = config; //Te be leaflet compatible in g-layercatalogus
      layer.options = _options;
      layer.visibility = layer.visible; //leaflet compat
      var _layers = config.layers;
      var _classproperty = config.classproperty;
      var _id_column = config.id_column;
      var _attributes = config.attributes;
      var _duration = config.duration || 0;
			var _path;
			var _projection;
			var style = config.style || {};
			var _xhrqueue = [];
			
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

      var getbbox = function(d){
        var numtiles = 2 << (d[2]-1);
        var tilesize = (20037508.34 * 2) / (numtiles);
        var x = -20037508.34 + (d[0] * tilesize);
        var y = 20037508.34 - ((d[1]+1) * tilesize);//shift 1 down, because we want LOWER left
        var bbox = x + ","+ y + "," + (x + tilesize) + "," + (y + tilesize);
        return bbox;
      };

      var tileurl = function(d){
          var url;
         	if (_url.indexOf('?') < 0){
          		_url+='?';
          	}
						//This calculation only works for tiles that are square and always the same size
						var bbox = getbbox(d);
						url =  _url +
							 "&bbox=" + bbox +
							 "&table=" + _layers +
							 "&id_column=" + _id_column + 
							 "&attributes=" + _attributes +
							 "&srs=EPSG:3857";
          return url;
      };

      //Function taken from terraformer
      function ringIsClockwise(ringToTest) {
				var total = 0,i = 0;
				var rLength = ringToTest.length;
				var pt1 = ringToTest[i];
				var pt2;
				for (i; i < rLength - 1; i++) {
					pt2 = ringToTest[i + 1];
					total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
					pt1 = pt2;
				}
				return (total >= 0);
			}

      
      //each tile can be considered it's own drawboard, on which we build
      function build(d){
      	var counter = 0;
      	var tile = d3.select(this);
      	
				var url = tileurl(d);
				_projection = d3.geo.mercator();
				_path = d3.geo.path().projection(_projection);
				var xhr = d3.json(url, function(error, json) {
						
					var tiles = layer.map.tiles;
					var k = Math.pow(2, d[2]) * 256; // size of the world in pixels
					var x = (d[0] + tiles.translate[0]) * tiles.scale;
					var y = (d[1] + tiles.translate[1]) * tiles.scale;
					var s = tiles.scale / 256;
					
					_path.projection()
							.translate([k / 2 - d[0] *256, k / 2 - d[1] *256]) // [0°,0°] in pixels
							.scale(k / 2 / Math.PI);
					
					var features = [];
					json.data.forEach(function(twkbdata){
							if (!twkbdata.geom){
								console.warn('no data',twkbdata);
								return; 
							}
							var arr = new Uint8Array(twkbdata.geom.data);
							var collection = new twkb.toGeoJSON(arr);
							collection.features.forEach(function(f){
									f.id = twkbdata.id;
									f.properties = {};
									_attributes.forEach(function(a){
											f.properties[a] = twkbdata[a];
									});
									if (f.geometry.type == 'Polygon' && !ringIsClockwise(f.geometry.coordinates[0])){
										f.geometry.coordinates[0].reverse();
									}
							});
							features = features.concat(collection.features);
					});
					//TODO: FROM HERE START MAKING CANVAS
					var canvas = tile.append("xhtml:canvas")
						.attr("width", 1)
						.attr("height", 1)
						.style("border","1px solid #c3c3c3");
					var context = canvas.node().getContext("2d");
					_path.context(context);
					context.save();
					//context.translate(x, y);
					//context.scale(s, s);
					//context.beginPath();
					//features.forEach(_path);
					//context.closePath();
					//context.strokeStyle = 'black';
					//context.lineWidth   = 1;
					//context.stroke();
					//context.fill();
					context.fillStyle = "#FF0000";
					context.fillRect(0,0,150,75);
					context.stroke();
					context.restore();
					/*
					var entities = tile.selectAll('path').data(features, function(d){
						return d.id;
					});
					var newentity = entities.enter().append('path')
						.attr('id',function(d){
								return 'entity'+ d.id;
						})
						.attr('class',function(d){
							var classname = d.properties?d.properties[_classproperty]:'unknown';
							return _layers + " " + classname.replace(' ','_').replace(',','_');
						})
						.attr("d", _path);
					entities.exit().remove();
					*/
				});
				tile[0][0].xhr = xhr;
				_xhrqueue.push(xhr);
      }

            //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         _xhrqueue = [];
         var translate = tiles.translate.map(function(d){return Math.round(d*100)/100;});
         drawboard.attr("transform", "scale(" + Math.round(tiles.scale*100)/100 + ") translate(" + translate + ")");
         var image = drawboard
         	//.style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))//?? Is this needed?
         	.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         if (layer.visible){
         	 var tile = imageEnter.append("foreignObject")
         	 		.classed("tile",true)   
         	 		.attr("width", 1)
              .attr("height", 1)
              .attr('opacity', this.opacity)
              .attr("x", function(d) { return d[0]; })
              .attr("y", function(d) { return d[1]; })
		 		  tile.each(build);
		 		  //tile.each(setStyle);
         }
         image.exit()
         	.each(function(d){
         			d3.select(this)[0][0].xhr.abort();//yuck
         	})
         	.remove();
      };

      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', this.opacity).style('display',this.visible?'block':'none');
      };

      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };

  d3_mappu_TWKBLayer.prototype = Object.create(d3_mappu_Layer.prototype);

  //                                                                          ãƒžãƒƒãƒ—
