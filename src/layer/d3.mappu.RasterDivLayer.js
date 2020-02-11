  /**

  **/
  d3.mappu.RasterLayer = function(name, config){
      return d3_mappu_RasterLayer(name, config);
  };

  d3_mappu_RasterLayer = function(name, config) {
      var self = this;
      //d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'raster';
      var _url = config.url;
      var _ogc_type = config.ogc_type || 'tms';
      var _style = config.style || '';
      var _options = config; //Te be leaflet compatible in g-layercatalogus
      layer.options = _options;
      layer.visibility = layer.visible; //leaflet compat
      var _opacity = config.opacity;
      var _layers = config.layers;
      var _duration = 0;
      var _cqlfilter = null;
      var _time = null;

      Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            clear();
            draw();
        }
      });

      Object.defineProperty(layer, 'layers', {
        get: function() {
            return _layers;
        },
        set: function(val) {
            _layers = val;
            clear();
            draw();
        }
      });

      Object.defineProperty(layer, 'cql_filter', {
        get: function() {
            return _cqlfilter;
        },
        set: function(val) {
            _cqlfilter = val;
            clear();
            draw();
        }
      });

      Object.defineProperty(layer, 'time', {
        get: function() {
            return _time;
        },
        set: function(val) {
            _time = val;
            clear();
            draw();
        }
      });

      

      var getbbox = function(d){
        var numtiles = 2 << (d.z-1);
        var tilesize = (20037508.34 * 2) / (numtiles);
        var x = -20037508.34 + (d.x * tilesize);
        var y = 20037508.34 - ((d.y+1) * tilesize);//shift 1 down, because we want LOWER left
        var bbox = x + ","+ y + "," + (x + tilesize) + "," + (y + tilesize);
        return bbox;
      };

      var tileurl = function(d){
          var url;
          if (_ogc_type == 'tms') {
              url = _url
				.replace('{s}',["a", "b", "c", "d"][Math.random() * 3 | 0])
				.replace('{z}',d.z)
				.replace('{x}',d.x)
				.replace('{y}',d.y)
				//FIXME: why are these curly brackets killed when used with polymer?
				.replace('%7Bs%7D',["a", "b", "c", "d"][Math.random() * 3 | 0])
				.replace('%7Bz%7D',d.z)
				.replace('%7Bx%7D',d.x)
				.replace('%7By%7D',d.y);
          }
          else if (_ogc_type == 'wmts'){
          	  //TODO: working on this
          	  /*
          	http://services.geodan.nl/wmts?UID=99c2ec22c262
          		&SERVICE=WMTS
          		&REQUEST=GetTile
          		&VERSION=1.0.0
          		&LAYER=buurtkaart
          		&STYLE=default
          		&TILEMATRIXSET=nltilingschema
          		&TILEMATRIX=04&TILEROW=10&TILECOL=10
          		&FORMAT=image%2Fpng
          	*/
          	if (_url.indexOf('?') < 0){
          		_url+='?';
          	}
          	url = _url +
          		"&layer=" + _layers +
          		"&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=default&TILEMATRIXSET=nltilingschema&TILEMATRIX="+d.z+ "&TILEROW="+d.x+"&TILECOL="+d.y+"&FORMAT=image%2Fpng";
      	  }
          else if (_ogc_type == 'wms'){
          	if (_url.indexOf('?') < 0){
          		_url+='?';
          	}
			//This calculation only works for tiles that are square and always the same size
			var bbox = getbbox(d);
			url =  _url +
				 "&bbox=" + bbox +
				 "&styles=" + _style +
				 "&layers=" + _layers +
				 "&service=WMS&version=1.3.0&request=GetMap&CRS=EPSG:3857&tiled=true&width=256&height=256&srs=EPSG:3857&transparent=TRUE&format=image%2Fpng";
			if (_cqlfilter){
				url += '&cql_filter='+_cqlfilter;
            }
            if (_time){
                url += '&time='+_time;
            }
          }
          else if(_ogc_type == 'esri'){
          	  if (_url.indexOf('?') < 0){
          		_url+='?';
          	  }
          	  var bbox = getbbox(d);
          	  url = _url +
          	  	"f=image" +
          	  	"&transparent=true"+
          	  	"&format=png8" +
          	  	//"&layers=show:1,3" +
          	  	"&bbox=" + bbox +
          	  	"&bboxSR=102100" +
          	  	"&imageSR=102100" +
          	  	"&size=256,256";
          }
          return url;
      };

      var getFeatureInfo = function(d){
          //return; /* WORK IN PROGRESS */
          var loc = d3.mouse(this);
          var loc2 = d3.mouse(map.mapdiv);
          if (_ogc_type == 'wms'){
            //http://pico.geodan.nl/geoserver/pico/wms?
            //REQUEST=GetFeatureInfo
            //&EXCEPTIONS=application%2Fvnd.ogc.se_xml
            //&BBOX=144587.40296%2C458169.888794%2C146661.115594%2C460572.017456
            //&SERVICE=WMS&INFO_FORMAT=text%2Fhtml&QUERY_LAYERS=pico%3Apc6_energieverbruik_alliander&FEATURE_COUNT=50&Layers=pico%3Apc6_energieverbruik_alliander
            //&WIDTH=442&HEIGHT=512&format=image%2Fpng&styles=&srs=EPSG%3A28992&version=1.1.1&x=243&y=190
            //TODO: make this more flexible
            var url = _url +
                "?SRS=EPSG:900913" +
                "&QUERY_LAYERS=" + _layers +
                "&LAYERS=" + _layers +
                "&INFO_FORMAT=application/json" +
                "&REQUEST=GetFeatureInfo" +
                "&FEATURE_COUNT=50" +
                "&EXCEPTIONS=application/vnd.ogc.se_xml" +
                "&SERVICE=WMS" +
                "&VERSION=1.1.0" +
                "&WIDTH=256&HEIGHT=256" +
                "&X="+ Math.round(loc[0]) +
                "&Y="+ Math.round(loc[1]) +
                "&BBOX=" + getbbox(d);
            d3.json(url, function(error,response){
                var feat = response.features[0];
                //TODO: check if there is a response
                //TODO: show more than 1 response
                d3.select('#map').append('div').classed('popover', true)
                    .style('left', loc2[0]+'px')
                    .style('top', loc2[1]+'px')
                    .html(feat.id);
            });

          }
          if (_ogc_type == 'esri'){
          	  //TODO: work in progress
          	  /* Example:
          	  http://myserver/rest/services/StateCityHighway/MapServer/identify?
				geometryType=esriGeometryPoint&geometry={�x�: -
				120,�y�:40}&tolerance=10&mapExtent=-119,38,-
				121,41&imageDisplay=400,300,96&f=json
			  */
			  var url = _url.replace('export','identify') +
			  	"?geometryType=esriGeometryPoint" +
			  	"&geometry={'x': " + Math.round(loc[0]) + ",'y':" + Math.round(loc[1]) + "}" +
			  	"&tolerance=10" +
			  	"&mapExtent=-119,38,-121,41" +
			  	"&imageDisplay=256,256,96&f=json";
			  d3.json(url, function(error,response){
			  	if (error || response.error){
			  		console.warn(error || response.error);
			  	}
			  	console.log(response);
                var feat = response.results[0];
                //TODO: check if there is a response
                //TODO: show more than 1 response
                d3.select('#map').append('div').classed('popover', true)
                    .style('left', loc2[0]+'px')
                    .style('top', loc2[1]+'px')
                    .html(feat.id);
              });
          }
      };
      function matrix3d(scale, translate) {
        var k = scale / 256, r = scale % 1 ? Number : Math.round;
        /*
		return "matrix3d(" + [
            k, 0, 0, 0, 
            0, k, 0, 0, 
            0, 0, k, 0, 
            r(translate[0] * scale), r(translate[1] * scale), 0, 1 
        ] + ")";*/
        return "matrix(" + [k,0,0,k,r(translate[0] * scale), r(translate[1] * scale)]+")";
      }

      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         var image = drawboard
                 .style("transform", matrix3d(tiles.scale, tiles.translate))
         		.selectAll(".tile")
                .data(tiles, function(d) { return [d.tx, d.ty, d.z]; });

         var imageEnter = image.enter();
         if (layer.visible){
         imageEnter.append("img")
              .classed('tile',true)
              .attr("src", tileurl)
              //.style('border','1px solid black')
              .style('width','256px')
              .style('height','256px')
              .style('position','absolute')
              .style('opacity', _opacity)
              .style("left", function(d) {
                  //return (d.x << 8) + "px"; 
                  return d.tx + "px"; 
                })
              .style("top", function(d) { 
                  //return (d.y << 8) + "px"; 
                  return d.ty + "px";
                })
              //TODO: working on this
              .on('click', getFeatureInfo);
         }
         image.exit()
         	.attr('src',null)
         	.remove();

      };

      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', _opacity).style('display',this.visible?'block':'none');
      };
      //Clear all tiles
      var clear = function(){
          layer.drawboard.selectAll('.tile').remove();
      };

      layer.clear = clear;
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };

  d3_mappu_RasterLayer.prototype = Object.create(d3_mappu_Layer.prototype);

  //                                                                          マップ
