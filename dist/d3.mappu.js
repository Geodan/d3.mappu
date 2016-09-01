!function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a="function"==typeof require&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}for(var i="function"==typeof require&&require,o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){exports.POINT=1,exports.LINESTRING=2,exports.POLYGON=3,exports.MULTIPOINT=4,exports.MULTILINESTRING=5,exports.MULTIPOLYGON=6,exports.COLLECTION=7},{}],2:[function(require,module,exports){function ReadVarInt64(ta_struct){for(var nByte,cursor=ta_struct.cursor,nVal=0,nShift=0;;){if(nByte=ta_struct.buffer[cursor],0===(128&nByte))return cursor++,ta_struct.cursor=cursor,nVal|nByte<<nShift;nVal|=(127&nByte)<<nShift,cursor++,nShift+=7}}function ReadVarSInt64(ta_struct){var nVal=ReadVarInt64(ta_struct);return unzigzag(nVal)}function unzigzag(nVal){return 0===(1&nVal)?nVal>>1:-(nVal>>1)-1}exports.ReadVarInt64=ReadVarInt64,exports.ReadVarSInt64=ReadVarSInt64,exports.unzigzag=unzigzag},{}],3:[function(require,module,exports){function read(buffer,offset,limit){limit=limit||Number.MAX_VALUE;for(var ta_struct={buffer:buffer,cursor:void 0===offset?0:offset,bufferLength:buffer.byteLength||buffer.length,refpoint:new Int32Array(4)},data=[],c=0;ta_struct.cursor<ta_struct.bufferLength&&limit>c;){var res=readBuffer(ta_struct,limit);res.length>0?data.push({type:ta_struct.type,offset:limit<Number.MAX_VALUE?ta_struct.cursor:void 0,bbox:ta_struct.has_bbox?ta_struct.bbox:void 0,coordinates:res}):(res.bbox=ta_struct.has_bbox?ta_struct.bbox:void 0,data.push(res)),c++}return data}var readBuffer=require("./readBuffer");module.exports=read},{"./readBuffer":4}],4:[function(require,module,exports){function readBuffer(ta_struct,howMany){var flag,has_z=0,has_m=0;flag=ta_struct.buffer[ta_struct.cursor],ta_struct.cursor++;var precision_xy=unzigzag((240&flag)>>4);ta_struct.type=15&flag,ta_struct.factors=[],ta_struct.factors[0]=ta_struct.factors[1]=Math.pow(10,precision_xy),flag=ta_struct.buffer[ta_struct.cursor],ta_struct.cursor++,ta_struct.has_bbox=1&flag,ta_struct.has_size=(2&flag)>>1,ta_struct.has_idlist=(4&flag)>>2,ta_struct.is_empty=(16&flag)>>4;var extended_dims=(8&flag)>>3;if(extended_dims){var extended_dims_flag=ta_struct.buffer[ta_struct.cursor];ta_struct.cursor++,has_z=1&extended_dims_flag,has_m=(2&extended_dims_flag)>>1;var precision_z=(28&extended_dims_flag)>>2,precision_m=(224&extended_dims_flag)>>5;has_z&&(ta_struct.factors[2]=Math.pow(10,precision_z)),has_m&&(ta_struct.factors[2+has_z]=Math.pow(10,precision_m)),ta_struct.has_z=has_z,ta_struct.has_m=has_m}var ndims=2+has_z+has_m;if(ta_struct.ndims=ndims,ta_struct.has_size&&(ta_struct.size=ReadVarInt64(ta_struct)),ta_struct.has_bbox){for(var bbox=[],i=0;ndims-1>=i;i++){var min=ReadVarSInt64(ta_struct),max=min+ReadVarSInt64(ta_struct);bbox[i]=min,bbox[i+ndims]=max}ta_struct.bbox=bbox}return readObjects(ta_struct,howMany)}function readObjects(ta_struct,howMany){for(var type=ta_struct.type,i=0;i<ta_struct.ndims;i++)ta_struct.refpoint[i]=0;if(type===constants.POINT)return parse_point(ta_struct);if(type===constants.LINESTRING)return parse_line(ta_struct);if(type===constants.POLYGON)return parse_polygon(ta_struct);if(type===constants.MULTIPOINT)return parse_multi(ta_struct,parse_point);if(type===constants.MULTILINESTRING)return parse_multi(ta_struct,parse_line);if(type===constants.MULTIPOLYGON)return parse_multi(ta_struct,parse_polygon);if(type===constants.COLLECTION)return parse_collection(ta_struct,howMany);throw new Error("Unknown type: "+type)}function parse_point(ta_struct){return read_pa(ta_struct,1)}function parse_line(ta_struct){const npoints=ReadVarInt64(ta_struct);return read_pa(ta_struct,npoints)}function parse_polygon(ta_struct){for(var coordinates=[],nrings=ReadVarInt64(ta_struct),ring=0;nrings>ring;++ring)coordinates[ring]=parse_line(ta_struct);return coordinates}function parse_multi(ta_struct,parser){var type=ta_struct.type,ngeoms=ReadVarInt64(ta_struct),geoms=[],IDlist=[];ta_struct.has_idlist&&(IDlist=readIDlist(ta_struct,ngeoms));for(var i=0;ngeoms>i;i++){var geo=parser(ta_struct);geoms.push(geo)}return{type:type,ids:IDlist,geoms:geoms}}function parse_collection(ta_struct,howMany){var type=ta_struct.type,ngeoms=ReadVarInt64(ta_struct),geoms=[],IDlist=[];ta_struct.has_idlist&&(IDlist=readIDlist(ta_struct,ngeoms));for(var i=0;ngeoms>i&&howMany>i;i++){var geo=readBuffer(ta_struct);geoms.push({type:ta_struct.type,coordinates:geo})}return{type:type,ids:IDlist,ndims:ta_struct.ndims,offset:howMany<Number.MAX_VALUE?ta_struct.cursor:void 0,geoms:geoms}}function read_pa(ta_struct,npoints){var i,j,ndims=ta_struct.ndims,factors=ta_struct.factors,coords=new Array(npoints*ndims);for(i=0;npoints>i;i++)for(j=0;ndims>j;j++)ta_struct.refpoint[j]+=ReadVarSInt64(ta_struct),coords[ndims*i+j]=ta_struct.refpoint[j]/factors[j];if(ta_struct.include_bbox&&!ta_struct.has_bbox)for(i=0;npoints>i;i++)for(j=0;ndims>j;j++){const c=coords[j*ndims+i];c<ta_struct.bbox.min[j]&&(ta_struct.bbox.min[j]=c),c>ta_struct.bbox.max[j]&&(ta_struct.bbox.max[j]=c)}return coords}function readIDlist(ta_struct,n){const idList=[];for(var i=0;n>i;i++)idList.push(ReadVarSInt64(ta_struct));return idList}var constants=require("./constants"),ReadVarInt64=require("./protobuf").ReadVarInt64,ReadVarSInt64=require("./protobuf").ReadVarSInt64,unzigzag=require("./protobuf").unzigzag;module.exports=readBuffer},{"./constants":1,"./protobuf":2}],5:[function(require,module,exports){function createGeometry(type,coordinates){return{type:typeMap[type],coordinates:coordinates}}function createFeature(type,coordinates,id,ndims){return{type:"Feature",id:id,geometry:transforms[type](coordinates,ndims)}}function createFeaturesFromMulti(type,geoms,ids,ndims){return geoms.map(function(coordinates,i){return createFeature(type,coordinates,ids?ids[i]:void 0,ndims)})}function createFeaturesFromCollection(geoms,ids,ndims){return geoms.map(function(g,i){return createFeature(g.type,g.coordinates,ids?ids[i]:void 0,ndims)})}function toCoords(coordinates,ndims){for(var coords=[],i=0,len=coordinates.length;len>i;i+=ndims){for(var pos=[],c=0;ndims>c;++c)pos.push(coordinates[i+c]);coords.push(pos)}return coords}function toGeoJSON(buffer){for(var ta_struct={buffer:buffer,cursor:0,bufferLength:buffer.byteLength||buffer.length,refpoint:new Int32Array(4)},features=[];ta_struct.cursor<ta_struct.bufferLength;){var res=readBuffer(ta_struct,Number.MAX_VALUE);res.geoms?features=features.concat(transforms[res.type](res.geoms,res.ids,ta_struct.ndims)):features.push({type:"Feature",geometry:transforms[ta_struct.type](res,ta_struct.ndims)})}return{type:"FeatureCollection",features:features}}var constants=require("./constants"),readBuffer=require("./readBuffer"),typeMap={};typeMap[constants.POINT]="Point",typeMap[constants.LINESTRING]="LineString",typeMap[constants.POLYGON]="Polygon";var transforms={};transforms[constants.POINT]=function(coordinates,ndims){return createGeometry(constants.POINT,toCoords(coordinates,ndims)[0])},transforms[constants.LINESTRING]=function(coordinates,ndims){return createGeometry(constants.LINESTRING,toCoords(coordinates,ndims))},transforms[constants.POLYGON]=function(coordinates,ndims){return createGeometry(constants.POLYGON,coordinates.map(function(c){return toCoords(c,ndims)}))},transforms[constants.MULTIPOINT]=function(geoms,ids,ndims){return createFeaturesFromMulti(constants.POINT,geoms,ids,ndims)},transforms[constants.MULTILINESTRING]=function(geoms,ids,ndims){return createFeaturesFromMulti(constants.LINESTRING,geoms,ids,ndims)},transforms[constants.MULTIPOLYGON]=function(geoms,ids,ndims){return createFeaturesFromMulti(constants.POLYGON,geoms,ids,ndims)},transforms[constants.COLLECTION]=function(geoms,ids,ndims){return createFeaturesFromCollection(geoms,ids,ndims)},module.exports=toGeoJSON},{"./constants":1,"./readBuffer":4}],6:[function(require,module,exports){(function(global){var constants=require("./constants"),toGeoJSON=require("./toGeoJSON"),read=require("./read"),twkb={toGeoJSON:toGeoJSON,read:read};for(var key in constants)twkb[key]=constants[key];module.exports=twkb,global.twkb=twkb}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./constants":1,"./read":3,"./toGeoJSON":5}]},{},[6]);;d3.mappu = d3.mappu || {};
d3.mappu.util = {};

//create a uniqueID for layers etc.
var _ctr = 0;   
d3.mappu.util.createID = function(){
    var id = "ッ-"+_ctr;
    _ctr++;
    return id;
};

//                                                                          マップ
;/**
 Singleton for indexeddb cache
**/


"use strict";
d3.mappu.Cache = (function() {
	if (window.d3.mappu._cache){
		return window.d3.mappu._cache;
	}
	var cache = {};
	var runningtasks = [];
	
	var delPromise = new Promise(function(resolve, reject){
		var req = indexedDB.deleteDatabase('d3.mappu');
		req.onsuccess = function () {
				console.log("Deleted database successfully");
				resolve();
		};
		req.onerror = function () {
				console.log("Couldn't delete database");
				reject();
		};
		req.onblocked = function () {
				console.log("Couldn't delete database due to the operation being blocked");
				reject();
		};
	});
	runningtasks.push(delPromise);
	delPromise.then(function(){
			var req = indexedDB.open('d3.mappu',1);
			req.onupgradeneeded = function (e) {
					database = e.target.result;
					database.createObjectStore('ッ-0', {keyPath: 'key'});
					database.createObjectStore('ッ-1', {keyPath: 'key'});
					database.createObjectStore('ッ-2', {keyPath: 'key'});
					database.createObjectStore('ッ-3', {keyPath: 'key'});
					database.createObjectStore('ッ-4', {keyPath: 'key'});
					database.createObjectStore('ッ-5', {keyPath: 'key'});
					database.createObjectStore('ッ-6', {keyPath: 'key'});
					database.createObjectStore('ッ-7', {keyPath: 'key'});
					
			};
			req.onsuccess = function (e) {
					cache.database = e.target.result;
					
			};
			req.onerror = function (e) {
				
			}
	});
	
	cache.runningtasks = runningtasks;
	window.d3.mappu._cache = cache;
	return cache;
})();
;d3.mappu = d3.mappu || {};
/**
* d3.mappu.Map is the central class of the API - it is used to create a map.
**/

/** d3.mappu.Map(element, config)

element = dom object
options:
center: [long,lat]                  default = [0,0]
zoom: zoomlevel                     default = 0.0
layers: [layer]                     default = null
minZoom: zoomlevel                  default = 0.0
maxZoom: zoomlevel                  default = 13.0
maxView: [[long,lat],[long,lat]]    default = [[-180,90],[180,-90]]
projection: projection              default = d3.geo.mercator()
**/


d3.mappu.Map = function( id, config ) {
	return d3_mappu_Map( id, config );
};
d3_mappu_Map = function( id, config ) {
	var map = {};
	var _layers = [ ];
	var _mapdiv;
	//check if elem is a dom-element or an identifier
	if( typeof( id ) == 'object' ) {
		_mapdiv = id;
	}
	else {
		_mapdiv = document.getElementById( id );
	}
	window.onresize = function( ) {
		resize( );
	};
	//TODO: how to get the size of the map
	var _width = _mapdiv.clientWidth || 2024;
	var _height = _mapdiv.clientHeight || window.innerHeight || 768;
	var _ratio = 1;

	var _extent = [ [ 0, 0 ],[ 1, 1 ] ];
	var _center = config.center || [ 0, 0 ];
	var _projection = config.projection || d3.geo.mercator( );
	var _zoom = config.zoom || 22;
	var _maxZoom = config.maxZoom || 24;
	var _minZoom = config.minZoom || 15;
	var _maxView = config.maxView || [ [- 180, 90 ],[ 180,- 90 ] ];
	var dispatch = d3.dispatch( "loaded", "zoomend" );
	var redraw = function( ) {
		//Calculate tile set
		_tiles = _tile
			.scale( _zoombehaviour.scale( ))
			.translate( _zoombehaviour.translate( ))( );

		//Calculate projection, so we can find out coordinates
		_projection
			.scale( _zoombehaviour.scale( ) / 2 / Math.PI )
			.translate( _zoombehaviour.translate( ));

		_layers.forEach( function( d ) {
				d.refresh( 0 );
		} );
		//Set internal zoom
		_zoom = Math.log( _zoombehaviour.scale( ))/ Math.log( 2 );
		//Set internal center
		var pixcenter = [ _width / 2, _height / 2 ];
		_center =  _projection.invert( pixcenter );


		//Update extent value
		
		var lb = _projection.invert( [ 0, _height] );
		var rt = _projection.invert( [ _width, 0 ] );
		map.extent = [ lb, rt ];

		dispatch.zoomend( );
	};
	var resize = function( ) {
		_width = _mapdiv.clientWidth;
		_height = _mapdiv.clientHeight;
		d3.select( _mapdiv ).selectAll( '.drawboard' )
			.attr( "width", _width )
			.attr( "height", _height );

		_tile.size( [ _width, _height ] );
		redraw( );
	};
	var _zooming;
	function zoomcenter( zoomval, centerval ) {
		var scale =( 1 << zoomval );
		_zoombehaviour.scale( scale );
		_projection.scale( _zoombehaviour.scale( ) / 2 / Math.PI ).translate( _zoombehaviour.translate( ));
		//Adapt projection based on new zoomlevel
		var pixcenter = _projection( centerval );
		var curtranslate = _zoombehaviour.translate( );
		var translate = [
			curtranslate [ 0 ] +( _width - pixcenter [ 0 ] ) -( _width / 2 ),
			curtranslate [ 1 ] +( _height - pixcenter [ 1 ] ) -( _height / 2 )
		];
		_zoombehaviour.translate( translate );
		//Disabled transition because it gives problems when zooming and centering directly after eachother
		//_zoombehaviour.event(_mapdiv);
	}

	_projection
		.scale(( 1 << _zoom || 1 << 12 ) / 2 / Math.PI )
		.translate( [ _width / 2, _height / 2 ] );
	//.center(_center)

	var _projcenter = _projection( _center );
	var _zoombehaviour = d3.behavior.zoom( )
		.scale( _projection.scale( ) * 2 * Math.PI )
		.scaleExtent( [ 1 << _minZoom, 1 << _maxZoom ] )
		//.translate( [ _width - _projcenter [ 0 ], _height - _projcenter [ 1 ] ] ) //obs?
		.translate( [ _width /2, _height /2 ] )
		.on( "zoom", redraw );
	d3.select( _mapdiv ).call( _zoombehaviour );

	var _tile = d3.geo.tile( ).size( [ _width, _height ] );
	var _tiles = _tile.scale( _zoombehaviour.scale( )).translate( _zoombehaviour.translate( ))( );
	//Do an initial zoomcenter
	zoomcenter( _zoom, _center );
	resize( );

	////getter/setter functions

	Object.defineProperty( map, 'mapdiv', {
			get : function( ) {
				return _mapdiv;
			},
			set : function( ) {
				console.log( "do not touch the mapdiv" );
			}
	} );

	// .center : ([long,lat])
	Object.defineProperty( map, 'center', {
			get : function( ) {
				return _center;
			},
			set : function( val ) {
				//zoomcenter will move to and set the center in some steps
   			zoomcenter( _zoom, val );
   		}
  } );
  // .zoom : (zoomlevel)
  //http://truongtx.me/2014/03/13/working-with-zoom-behavior-in-d3js-and-some-notes/
  Object.defineProperty( map, 'zoom', {
  		get : function( ) {
  			return _zoom;
  		},
  		set : function( val ) {
  			if( val <= _maxZoom && val >= _minZoom ) {
  				//zoomcenter will move to and set the zoomlevel in some steps
  				zoomcenter( val, _center );
  			}
  			else {
  				console.log( 'Zoomlevel exceeded', val, 'Min:', _minZoom, 'Max:', _maxZoom );
  			}
  		}
  } );
  // .minZoom : (zoomlevel)
  Object.defineProperty( map, 'minZoom', {
  		get : function( ) {
  			return _minZoom;
  		},
  		set : function( val ) {
  			_minZoom = val;
  			this.zoombehaviour.scaleExtent( [ 1 << _minZoom, 1 << _maxZoom ] );
  		}
  } );
  // .maxZoom : (zoomlevel)
  Object.defineProperty( map, 'maxZoom', {
  		get : function( ) {
  			return _maxZoom;
  		},
  		set : function( val ) {
  			_maxZoom = val;
  			this.zoombehaviour.scaleExtent( [ 1 << _minZoom, 1 << _maxZoom ] );
  		}
  } );
  // .maxView : ([[long,lat],[long,lat]])
  Object.defineProperty( map, 'maxView', {
  		get : function( ) {
  			return _maxView;
  		},
  		set : function( val ) {
  			_maxView = val;
  		}
  } );
  // .projection : ({projection})
  Object.defineProperty( map, 'projection', {
  		get : function( ) {
  			return _projection;
  		},
  		set : function( obj ) {
  			_projection = obj;
  			//TODO: redraw
  		}
  } );
  // .extent : returns current map extent in latlon
  Object.defineProperty( map, 'extent', {
  		get : function( ) {
  			return _extent;
  		},
  		set : function( value ) {
  			_extent = value;
  		}
  } );
  Object.defineProperty( map, 'tiles', {
  		get : function( ) { return _tiles;},
  		set : function( ) { console.warn( 'No setting allowed for tile' );}
  } );
  Object.defineProperty( map, 'zoombehaviour', {
  		get : function( ) { return _zoombehaviour;},
  		set : function( ) { console.warn( 'No setting allowed for zoombehaviour' );}
  } );
  Object.defineProperty( map, 'layers', {
  		get : function( ) { return _layers;},
  		set : function( ) { console.warn( 'No setting allowed for layers' );}
  } );
  ////singular functions

	var zoomToFeature = function( d ) {
		//TODO
		//see: http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
		console.warn( 'Not implemented yet' );
	};
	var zoomToExtent = function( bbox ) {
		var bounds = [ ];
		bounds [ 0 ] = _projection( [ bbox [ 0 ], bbox [ 1 ] ] );
		bounds [ 1 ] = _projection( [ bbox [ 2 ], bbox [ 3 ] ] );
		var dx = bounds [ 1 ][ 0 ] - bounds [ 0 ][ 0 ],
		dy = bounds [ 1 ][ 1 ] - bounds [ 0 ][ 1 ],
		x =( bounds [ 0 ][ 0 ] + bounds [ 1 ][ 0 ] ) / 2,
		y =( bounds [ 0 ][ 1 ] + bounds [ 1 ][ 1 ] ) / 2,
		scale =.9 / Math.max( dx / _width, dy / _height ),
		translate = [ _width / 2 - scale * x, _height / 2 - scale * y ];
		_zoom = 22; //FIXME
		_center = [ bbox [ 0 ] +( bbox [ 2 ]- bbox [ 0 ] ) / 2, bbox [ 1 ] +( bbox [ 3 ]- bbox [ 1 ] ) / 2 ];
		zoomcenter( _zoom, _center )
	}
	var addLayer = function( layer ) {
		if( ! layer.id ) {
			console.warn( 'Not a valid layer. (No ID)' );
			return false;
		}
		//Replace existing ID
		/*
		_layers.forEach(function(d){
		if (d.id == layer.id){
		console.log('Replacing ',d.id);
		d = layer; //TODO: can you replace an array item like this?
		return map;
		}
		});*/
		var idx = _layers.indexOf( layer );
		if( idx > - 1 ) {
			//Remove if it already existed
			_layers.splice( idx, 1 );
		}
		_layers.push( layer );
		layer._onAdd( map );
		return map;
	};
	var removeLayer = function( layer ) {
		var idx = _layers.indexOf( layer );
		if( idx > - 1 ) {
			//remove layer
			_layers.splice( idx, 1 );
		}
		orderLayers( );
		layer._onRemove( map );
		return map;
	};
	//Arrange the drawboards
	var orderLayers = function( ) {
		var drawboards = d3.select( _mapdiv )
			.selectAll( '.drawboard' )
			.data( _layers, function( d ) { return d.id;} );
		drawboards.enter( ).append( function(d){
				if (d.type == 'raster'){
					return document.createElement('div');
				}
				else if (d.type == 'vector' || d.type == 'vectortile'){
					return document.createElementNS("http://www.w3.org/2000/svg", 'svg');
				}
				else throw 'No valid type (' + d.type + ' )specified for layer';
			})
			.attr( 'id', function( d ) { return d.id;} )
			.style( 'position', 'absolute' )
			.style( 'pointer-events','none' ) //make svg permeable for events
			.classed( 'drawboard', true )
			.each( function( d ) {
				d.drawboard = d3.select( this );
				if (d.type == 'vector' || d.type == 'vectortile'){
					d.drawboard.append('g');
				}
			});
		drawboards.exit( ).remove( );
		drawboards.sort( function( a, b ) {
				return a.zindex - b.zindex;
		} );

	};
	// .removeLayers([{layer}])

	// .refresh()

	map.zoomToFeature = zoomToFeature;
	map.zoomToExtent = zoomToExtent;
	map.addLayer = addLayer;
	map.removeLayer = removeLayer;
	map.orderLayers = orderLayers;
	//map.getLayersByName = getLayersByName;
	map.redraw = redraw;
	map.resize = resize;
	map.dispatch = dispatch;



	return map;
};
//                                                                          マップ
;d3.mappu = d3.mappu || {};

d3.mappu.Sketch = function(id, config) {
    return d3_mappu_Sketch(id, config);
};

d3_mappu_Sketch = function(id, config) {
	var sketch = {};
	var map = null;
	var svg = null;
	var path = null;
	var project = null;
	var coords = [];
	var type = null;
	var activeFeature = null;
	var selection = null;
	var presstimer;
	var clickCount = 0;
	
	/* NEW DRAWING */
	function build(){
		
		svg.selectAll('.sketch').remove();
		svg.append('path').attr("d", function(){
				return path(activeFeature);
		}).classed('sketch', true)
		.style('stroke', 'blue')
		.style('fill', function(){
				if (type == 'LineString'){
					return 'none';
				}
				else {
					return 'blue';
				}
		})
		.style('fill-opacity', 0.4);
		
	}
	
	function addPoint(e){
		var m = d3.mouse(this);
		coords.push(map.projection.invert(m));
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		build();
	}
	
	function finishPoint(){
		var m = d3.mouse(this);
		coords = project.invert(m);
		//stamp out new id for feature
		activeFeature.id = new Date().getTime().toString();
		activeFeature.geometry.coordinates = coords;
		build();
		featureCreated();
	}
	
	function finishLineString(){
		//addPoint();
		coords.pop();
		coords.pop();//FIXME ..ugly
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		//stamp out new id for feature
		activeFeature.id = new Date().getTime().toString();
		build();
		featureCreated();
	}
	
	function finishPolygon(){
		//addPoint();
		activeFeature.geometry.type = 'Polygon';
		coords.pop();
		coords.pop();//FIXME ..ugly
		coords.push(coords[0]);
		activeFeature.geometry.coordinates = [coords];
		//stamp out new id for feature
		activeFeature.id = new Date().getTime().toString();
		build();
		featureCreated();
	}
	
	function movePointer(){
		var i = activeFeature.geometry.coordinates.length;
		var m = d3.mouse(this);
		var newpoint = map.projection.invert(m);
		if (i >= 1){          
			if (i == 1){
				coords[i] = newpoint;
			}
			else {
				coords[i-1] = newpoint;
			}
			activeFeature.geometry.coordinates = coords;
			build();
		}
	}
	
	var draw = function(geomtype){
		svg = d3.select(map.mapdiv).append('svg')
			.attr( 'id', 'sketch' )
			.style( 'position', 'absolute' )
			.attr('width',map.mapdiv.clientWidth)
			.attr('height',map.mapdiv.clientHeight)
			.append('g');
			
		return new Promise(function(resolve, reject){
			this.resolve = resolve;
			activeFeature = {
				id: null,
				type: "Feature",
				geometry: {
					type: geomtype,
					coordinates: []
				},
				style: {opacity: 0.7},
				properties: {}
			};
			type = geomtype;
			if (type == 'Point'){
				d3.select(map.mapdiv).on('click',finishPoint);
			}
			else if (type == 'LineString'){
				//some defaults
				activeFeature.style.fill = 'none';
				activeFeature.style.stroke = 'blue';
				activeFeature.style['stroke-width'] = "4";
				activeFeature.style['stroke-linecap'] = "round";
				d3.select(map.mapdiv).on('mousedown', addPoint);
				d3.select(map.mapdiv).on('mousemove',movePointer);
				d3.select(map.mapdiv).on('mousedown.doublemousedown',function(e){
					clickCount++;
					if (clickCount >1){
						finishLineString(e);
					}
					window.setTimeout(function() {
						clickCount = 0;
					},300);
				});
			}
			else if (type == 'Polygon'){
				//some defaults
				activeFeature.style.fill = 'blue';
				activeFeature.style.stroke = 'blue';
				d3.select(map.mapdiv).on('mousedown',addPoint); 
				d3.select(map.mapdiv).on('mousemove',movePointer);
				d3.select(map.mapdiv).on('mousedown.doublemousedown',function(e){
					clickCount++;
					if (clickCount >1){
						finishPolygon(e);
					}
					window.setTimeout(function() {
						clickCount = 0;
					},300);
				});
				d3.select(map.mapdiv).on('touchstart', function(e){
					pressTimer = window.setTimeout(function() {
						finishPolygon();
					},500);
				})
				.on('touchmove',function(e,d){
					console.log(e,d);
				})
				.on('touchend', function(){
					clearTimeout(pressTimer);
				});
			}
		});
	};
	
	/**	featureCreated emits the newly created feature **/
	var featureCreated = function(){
		self.resolve(activeFeature);
		//_layer.addFeature(activeFeature);
		//var event = new CustomEvent('featureCreated', {detail: activeFeature});
		//map.mapdiv.dispatchEvent(event);
		finish();
		
	};
	
	
/** EDIT EXISTING FEATURE */
	function dragstarted(d) {
	  d3.event.sourceEvent.stopPropagation();
	  d3.select(this).classed("dragging", true);
	}
	
	function dragged(d) {
	  var loc = d3.mouse(map.mapdiv);	
	  d3.select(this).attr("cx", loc[0]).attr("cy", loc[1]);
	  if (type == 'Polygon'){
	  	  //Check if we have to add this point to the geometry
	  	  if (d3.select(this).classed('sketchPointInter')){
	  	  	  	d3.select(this).classed('sketchPointInter',false).classed('sketchPoint',true);
	  	  	  	//add extra vertice
				if (d.index +1 == activeFeature.geometry.coordinates[0].length){
					activeFeature.geometry.coordinates[0].splice(1,0,d);
				}
				else {
					activeFeature.geometry.coordinates[0].splice(d.index +1,0,d);
				}
	  	  }
	  	  else {
			  activeFeature.geometry.coordinates[0][d.index] = project.invert(loc);
			  //When dragging the closing point of the polygon, there's a twin point that should be dragged as well
			  if (d.index === 0){
				  activeFeature.geometry.coordinates[0].pop();
				  activeFeature.geometry.coordinates[0].push(project.invert(loc));
			  }
			  if (d.index + 1 == activeFeature.geometry.coordinates[0].length){
				  activeFeature.geometry.coordinates[0][0] = project.invert(loc);
			  }
		  }
	  }
	  else if (type == 'LineString'){
	  	  //Check if we have to add this point to the geometry
	  	  if (d3.select(this).classed('sketchPointInter')){
	  	  	  d3.select(this).classed('sketchPointInter',false).classed('sketchPoint',true);
	  	  	  activeFeature.geometry.coordinates.splice(d.index +1,0,d);
	  	  }
	  	  else {
	  	  	  activeFeature.geometry.coordinates[d.index] = project.invert(loc);
	  	  }
	  }
	  else if (type == 'Point'){
	  	  activeFeature.geometry.coordinates = project.invert(loc);
	  }
	  buildEdit();
	}
	
	function dragended(d) {
	  d3.select(this).classed("dragging", false);
	  buildEdit();
	}
	
	var drag = d3.behavior.drag()
		.origin(function(d) { return d; })
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended);
	
		
	function buildEdit(){
		//Remove existing sketch features
		svg.selectAll('.sketch').remove();
		//Build feature in sketch
		svg.append('path').attr("d", function(){
				return path(activeFeature);
		}).classed('sketch', true)
		.style('stroke', 'red')
		.style('fill', function(){
				if (type == 'LineString'){
					return 'none';
				}
				else {
					return 'red';
				}
		})
		.style('fill-opacity', 0.4);
		//Prepare points to add vertices (interdata)
		if (type == 'Point'){
				var data = [activeFeature.geometry.coordinates];
				var interdata = [];
		}
		else {
			switch (type){
			case 'Polygon':
				var data = activeFeature.geometry.coordinates[0];
				break;
			case 'LineString':
				var data = activeFeature.geometry.coordinates;
				break;
			default:
				console.warn(type,' not supported');
			}
			data.forEach(function(d,i){
				d.index = i;
				d.fid = d.id;
			});
			//TODO: this may be written shorter, interdata can be part of data and d3 can draw every even point as an interPoint
			var interdata = data.map(function(d,i){
				if (i+1 < data.length){
					var obj = [];
					obj[0] = (d[0] + data[i+1][0])/2;
					obj[1] = (d[1] + data[i+1][1])/2;
					obj.index = d.index;
					return obj;
				}
			});
			interdata.pop();
		}
		
		svg.selectAll('.sketchPointInter').remove();
		svg.selectAll('.sketchPointInter').data(interdata).enter().append('circle')
			.classed('sketchPointInter',true)
			.attr('cx', function(d){return project(d)[0];})
			.attr('cy', function(d){return project(d)[1];})
			.attr('r', 10)
			.style('stroke', 'steelBlue')
			.style('fill', 'steelBlue')
			.style('opacity', 0.5)
			.call(drag);

		svg.selectAll('.sketchPoint').remove();
		svg.selectAll('.sketchPoint').data(data).enter().append('circle')
			.classed('sketchPoint',true)
			.attr('cx', function(d){return project(d)[0];})
			.attr('cy', function(d){return project(d)[1];})
			.attr('r', 10)
			.style('stroke', 'steelBlue')
			.style('fill', 'steelBlue')
			.style('fillOpacity', 0.5)
			.call(drag);
	}
	
	/**
		edit()
		Start editing a specific feature
	**/
	var edit = function(feature){
		svg = d3.select(map.mapdiv).append('svg')
			.attr( 'id', 'sketch' )
			.style( 'position', 'absolute' )
			.attr('width',map.mapdiv.clientWidth)
			.attr('height',map.mapdiv.clientHeight)
			.append('g');
		return new Promise(function(resolve, reject){
			self.resolve = resolve;
			event.stopPropagation();
			d3.select(map.mapdiv).on('click', function(){
				buildEdit();
				featureChanged();
			});
			activeFeature = feature;
			type = feature.geometry.type;
			buildEdit();
		});
	};
	
	/**
		startEdit()
		adds a listener to the entities to edit them
	**/
	var startEdit = function(){
		//_layer.drawboard.selectAll('.entity').select('path').on('click', edit);
	};
	
	/**	featureChanged emits the newly created feature **/
	var featureChanged = function(){
		self.resolve(activeFeature);
		//_layer.addFeature(activeFeature);
		//var event = new CustomEvent('featureChanged', {detail: activeFeature});
		//map.mapdiv.dispatchEvent(event);
		finish();
	};

	
	
	/** REMOVE FEATURE **/
	var remove = function(feature){
		return new Promise(function(resolve, reject){
			resolve(feature);
			finish();
		});
		//_layer.removeFeature(feature);
		//var event = new CustomEvent('featureRemoved', {detail: feature});
		//map.mapdiv.dispatchEvent(event);
		
	};
	/**
		startRemove()
		adds a listener to the entities to remove them
	**/
	var startRemove = function(){
		//_layer.drawboard.selectAll('.entity').select('path').on('click', remove);
	};

	
	/** FINISH **/	
	/** 
		finish()
		finish puts an end to the drawing or editing mode and removes listeners 
	**/
	
	var finish = function(){
		if (svg){
			svg.selectAll('.sketch').remove();
			svg.selectAll('.sketchPoint').remove();
			svg.selectAll('.sketchPointInter').remove();
			d3.select(map.mapdiv).select('#sketch').remove();
			//_layer.drawboard.selectAll('.entity').select('path').on('click', null);
			activeFeature = null;
			coords = [];
			d3.select(map.mapdiv).on('mousemove',null);
			d3.select(map.mapdiv).on('click', null);
			d3.select(map.mapdiv).on('mousedown',null);
			d3.select(map.mapdiv).on('doublemousedown',null);
			d3.select(map.mapdiv).on('touchstart',null);
			d3.select(map.mapdiv).on('touchend',null);
			//_layer.draw(true);
		}
	};
	
	/**
		addTo(mapObject)
		Attach a map to the sketch object
	**/
	function addTo(m){
		map = m;
		map.sketch = sketch;
		
		project = map.projection;
		path = d3.geo.path()
			.projection(map.projection)
			.pointRadius(4.5);
		return sketch;
	}
	
	//Export functions
	sketch.draw  = draw;
	sketch.startEdit = startEdit;
	sketch.startRemove = startRemove;
	sketch.remove = remove;
	sketch.finish = finish;
	sketch.edit = edit;
	sketch.addTo = addTo;
	return sketch;
};

//                                                                          マップ
;/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
};

d3_mappu_Layer = function(name, config){
	config = config || {};
    var layer = {};
    var _map;
    var _id = d3.mappu.util.createID();
    var _name = name;
    //TODO: parse config
    var _opacity = 1;
    _opacity = config.opacity || 1;
    var _visible = true;
    if (typeof(config.visible) == 'boolean' || config.visible == 'true' || config.visible == 'false'){
    	_visible = config.visible;
    }
    
	var _display = 'block';
	var _zindex = 0;
    var refresh = function(){
    };
    var moveUp = function(){
    };
    var moveDown = function(){
    };
    
    var setZIndex = function(i){
    	layer.zindex = i;
    };
    
    var addTo = function(map){
        map.addLayer(layer);
        map.resize();//TODO: is this needed?
        return layer;
    };
    
    Object.defineProperty(layer, 'id', {
        get: function() {return _id;},
        set: function() {console.warn('setting ID not allowed for layer');}
    });
    
    Object.defineProperty(layer, 'name', {
        get: function() {
            return _name;
        },
        set: function(val) {
            _name = val;
        }
    });
    
    Object.defineProperty(layer, 'map', {
        get: function() {
            return _map;
        },
        set: function(val) {
            _map = val;
        }
    });
    
    Object.defineProperty(layer, 'opacity', {
        get: function() {
            return _opacity;
        },
        set: function(val) {
            _opacity = val;
            layer.refresh(0);
        }
    });
    
    
    Object.defineProperty(layer, 'visible', {
        get: function() {
            return _visible;
        },
        set: function(val) {
            _visible = val;
            layer.draw(true);
            layer.refresh(0);
        }
    });
    
    Object.defineProperty(layer, 'zindex', {
        get: function() {
            return _zindex;
        },
        set: function(val) {
            _zindex = val;
            if (layer.map){
            	layer.map.orderLayers();
            }
        }
    });
    
    /* exposed: */
    layer.refresh = refresh;  
    layer.moveUp = moveUp;
    layer.moveDown = moveDown;
    layer.addTo = addTo;
    layer.setZIndex = setZIndex;

    /* private: */
    /* Obsolete?
    layer._instantiate = function(mapdiv){
    	layer.drawboard = d3.select(mapdiv)
				.append( 'svg' )
				.attr( 'id', function( d ) { return d.id;} )
				.style( 'position', 'absolute' )
				.style( 'pointer-events','none') //make svg permeable for events 
				.classed( 'drawboard', true );
			layer.drawboard.append( 'g' );
    }
    */
    layer._onAdd =  function(map){ //Adds the layer to the given map object
        _map = map;
        map.orderLayers();
        layer.draw();
		var event = new CustomEvent("layeradded", { "detail": layer});
			layer.map.mapdiv.dispatchEvent(event);
    };
    layer._onRemove = function(){ //Removes the layer from the map object
    	var event = new CustomEvent("layerremoved");
    	layer.map.mapdiv.dispatchEvent(event);
    };
    
    
    return layer;
};
//                                                                          マップ
;  /**

  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };

  d3_mappu_VectorLayer = function(name, config) {
  	  /*Work in progress for webworker
  	  var builder = new Worker("../src/layer/builder.js");
  	  builder.onmessage = function(e) {
		  console.log('Message received from worker', e.data.aap);
	  };
	  var obj = {project:'noot'};
  	  builder.postMessage(obj);
  	  console.log('Message posted to worker');
  	  */
  	  config = config || {};
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vector';
      var _data = [];
	  layer.zindex = 100; //vectors always on top
	  var _duration = config.duration || 0;
	  var _path;
	  var _projection;
	  var style = config.style || {};
	  var labelStyle = config.labelStyle || {};
	  var _events = config.events;

      /* exposed properties*/
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data;
        },
        set: function(array) {
        	_data = array;
            draw(false);
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

      function setStyle(d){
          var self = this;
      	  var entity = d3.select(this);
      	  //Do generic layer style
      	  if (style){
      	  	  for (var key in style) {
      	  	  	  entity.select('path').style(key, style[key]);
      	  	  }
      	  }

      	  //Now use per-feature styling
      	  if (d.style){
      	  	  for (var key in d.style) {
      	  	  	  entity.select('path').style(key, d.style[key]);
      	  	  }
      	  }



      	  if (d._selected){
      	  	  //make halo around entity to show as selected
      	  	  entity
      	  	  	.append('path').attr("d", _path)
      	  	  	.style('stroke', 'none')
      	  	  	.style('fill', 'red')
      	  	  	.classed('halo', true);
      	  }
      	  else {
      	  	  entity.selectAll('.halo').remove();
      	  }
      }
      //Build is only called on entry
      function build(d){
      	  var project = _projection;

      	  if (d.geometry.type == 'Point' && d.style){
      	      var x = project(d.geometry.coordinates)[0];
              var y = project(d.geometry.coordinates)[1];
              var width = d.style && d.style.width ? d.style.width :
                           (style.width ? style.width : 32);
              var height = d.style && d.style.height ? d.style.height :
                           (style.height ? style.height : 37);
              var img = d3.select(this).append('g').append("image")
                .attr("width", width)
                .attr("height", height)
                //.attr("x",x-12.5) //No need setting x and y, since it's reset later
                //.attr("y",y-25)
                .style('pointer-events','visiblepainted')
                .attr("xlink:href", function(d){
                    if (d.style['iconimg']){
					    return 'data:image/' + d.style['iconimg_encoding'] +','+ d.style['iconimg_bytearray'];
                    }
                    else if (d.style['marker-url']){
    					return d.style['marker-url'];
                    };
				});
  	      }
      	  else {
			  if (d.geometry.type == 'Polygon' && !ringIsClockwise(d.geometry.coordinates[0])){
				  d.geometry.coordinates[0].reverse();
			  }
			  d3.select(this).append('path').attr("d", _path)
				.classed(name, true)
        .style('pointer-events','visiblepainted');//make clickable
		  }
		  d3.select(this).append('text')
		  	.classed('shadowtext',true)
		  	.attr('text-anchor',"middle");
		  d3.select(this).append('text')
		  	.classed('vectorLabel',true)
		  	.attr('text-anchor',"middle");

      }

      var draw = function(rebuild){
      	  if (config.reproject){
				_projection = layer.map.projection;
				_path = d3.geo.path()
					.projection(_projection)
					.pointRadius(function(d) {
						if (d.style && d.style.radius){
							return d.style.radius;
						}
						else {
							return 4.5;
						}
					});
		  }
		  else {
				_projection = d3.geo.mercator()
					.scale(1 / 2 / Math.PI)
					.translate([0, 0]);
				_path = d3.geo.path()
					.projection(_projection);
		  }
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.select('g').selectAll('.entity').data(_data, function(d){
          	return d.id;
          });

          var newentity = entities.enter().append('g')
          	.classed('entity',true)
          	.attr('id',function(d){
                    return 'entity'+ d.id;
            })

          newentity.each(build);
          newentity.each(setStyle);

          entities.exit().remove();

          // Add events from config
          if (_events){
              _events.forEach(function(d){
                 entities.each(function(){
                 	d3.select(this).select('path').on(d.event, d.action);
                 	d3.select(this).select('image').on(d.event, d.action);
                 });
              });
          }
          layer.refresh(rebuild?0:_duration);
      };

      var calcwidth = d3.scale.linear().range([20,20,32,32]).domain([0,21,24,30]);
      var calcheight = d3.scale.linear().range([20,20,37,37]).domain([0,21,24,30]);

      var refresh = function(duration){
          var drawboard = layer.drawboard;
          drawboard.select('g').style('opacity', this.opacity).style('display',this.visible ? 'block':'none');
          if (layer.visible){
          	  var entities = drawboard.select('g').selectAll('.entity');
			  if (config.reproject){//the slow way
			  	  var project = layer.map.projection;
				  entities.select('path').transition().duration(duration).attr("d", _path);
				  entities.select('image').transition().duration(duration).each(function(d){
                    //TODO: create something nice customizable for widh-height calculations
                    var width = d.style && d.style.width ? d.style.width :
                                 (style.width ? style.width : 32); //calcwidth(layer.map.zoom);
                    var height = d.style && d.style.height ? d.style.height :
                                 (style.height ? style.height : 37); //calcheight(layer.map.zoom);
				  	var x = project(d.geometry.coordinates)[0];
				  	var y = project(d.geometry.coordinates)[1];
				  	var offsetx = width/2;
				  	var offsety = height/2;
				  	d3.select(this).attr('x',x).attr('y',y)
				  		//Smaller markers when zooming out
				  		.attr("width", width)
				  		.attr("height", height);
				  	//Rotation has to be done seperately
					if (d.style && d.style.rotate){
						  //TODO: still experimental, rotate +90 should be fixed
						  d3.select(this.parentElement).attr("transform", "translate("+ -offsetx+" "+ -offsety+") rotate("+ d.style.rotate +" " + Math.round(x + offsetx) +"  "+  Math.round(y + offsety) +")");
						  //d3.select(this.parentElement).attr("transform", "translate("+ -offsetx+" "+ -offsety+")");
					  }
					  else {
					  	  d3.select(this.parentElement).attr("transform", "translate("+ -offsetx+" "+ -offsety+")");
					  }
				  });


				  if (config.labelfield){
				  	  //TODO: add option to only show layer from certain zoomlevel
					  entities.each(function(d){
						var loc = _path.centroid(d);
						var text = d.properties[config.labelfield];
						d3.select(this).selectAll('text')
							.attr('x',loc[0])
							.attr('y', loc[1] -20)
							.text(text);

                        //Add shadow text for halo
                        d3.select(this).select('.shadowtext')
                                .style('stroke-width','2.5px')
                                .style('stroke','white')
                                .style('opacity', 0.8);

						//Style text
                        if (labelStyle){
    						for (var key in labelStyle) {
    							d3.select(this).selectAll('.vectorLabel').style(key, labelStyle[key]);
                                //shadowtext only sensitive to the opacity style
                                if (key == 'opacity'){
                                    d3.select(this).select('.shadowtext').style('opacity', labelStyle[key]);
                                }
    						}
                        }

					  });
				  }
				  entities.each(setStyle);
			  }
			  else {
				//based on: http://bl.ocks.org/mbostock/5914438
				var zoombehaviour = layer.map.zoombehaviour;
				//FIXME: bug in chrome? When zoomed in too much, browser tab stalls on zooming. Probably to do with rounding floats or something..
				drawboard.select('g')
				  .attr("transform", "translate(" + zoombehaviour.translate() + ")scale(" + zoombehaviour.scale() + ")")
				  .style("stroke-width", 1 / zoombehaviour.scale());
			  }
          }
          else {
          	  drawboard.selectAll('.entity').remove();
          }
      };

      var addFeature = function(feature){
      	  //var replaced = false;
		  //Testing with d3.map to make it faster
      	  var _datamap = d3.map(_data, function(d) { return d.id; });
      	  _datamap.set(feature.id, feature);
      	  _data = _datamap.values();
      	  //TODO: this is an expensive iteration when the amount of data increases
      	  //Make it cheaper.
      	  /*
      	  _data.forEach(function(d){
			  if (d.id == feature.id){
				  d = feature;
				  layer.draw();
				  replaced = true;
				  return;
			  }
      	  });
      	  if (!replaced){
      	  	  _data.push(feature);
      	  }*/
      	  layer.draw(true);
      };

      var removeFeature = function(feature){
      	  var idx = null;
      	  _data.forEach(function(d,i){
			  if (d.id == feature.id){
				  idx = i;
			  }
      	  });
      	  _data.splice(idx,1);
      	  layer.draw();
      };

      var zoomToFeature = function(feature){
      	  var loc = _projection.invert(_path.centroid(feature));
      	  layer.map.center = loc;
          layer.map.redraw();
      }

      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      layer.addFeature = addFeature;
      layer.removeFeature = removeFeature;
      layer.zoomToFeature = zoomToFeature;
      return layer;
  };

  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);

  //                                                                          マップ
;  /**
	 
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
			  	.translate([k / 2 - d[0] *256, k / 2 - d[1] *256]) // [0�,0�] in pixels
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
  
  //                                                                          マップ
  ;  /**

  **/
  d3.mappu.TWKBLayer = function(name, config){
      return d3_mappu_TWKBLayer(name, config);
  };

  d3_mappu_TWKBLayer = function(name, config) {
      var self = this;
      config = config || {};
      //d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'raster';
      var _url = config.url;
      var _options = config; //Te be leaflet compatible in g-layercatalogus
      layer.options = _options;
      layer.visibility = layer.visible; //leaflet compat
      var _layers = config.layers;
      var _classproperty = config.classproperty;
      var _id_column = config.id_column;
      var _geom_column = config.geom_column;
      var _srid = config.srid;
      var _attributes = config.attributes;
      var _style = config.style;
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

      Object.defineProperty(layer, 'style', {
        get: function() {
            return _style;
        },
        set: function(val) {
            _style = val;
         		layer.drawboard.selectAll('.tile').remove();
            layer.refresh(0);
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
							 "&request=getData" +
							 "&bbox=" + bbox +
							 "&table=" + _layers +
							 "&id_column=" + _id_column +
							 "&geom_column=" + _geom_column +
							 "&srid=" + _srid +
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
			var renders = [];
			renders.push(new Worker("twkb_processor.js"));
			
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			renders.forEach(function(renderer){
				renderer.onmessage = function (e) {
					if (e.data.layerid == layer.id){
						var data = e.data.data;
						var d = e.data.d;
						build(d,data);
					}
				}
			});
      //each tile can be considered it's own drawboard, on which we build
      function build(d,data){
				var counter = 0;
				var tile = d3.select('#T'+layer.id+'_'+d[0]+'_'+d[1]+'_'+d[2]);
				if (tile[0][0]){
					_projection = d3.geo.mercator();
					_path = d3.geo.path().projection(_projection);
					var tiles = layer.map.tiles;
					var k = Math.pow(2, d[2]) * 256; // size of the world in pixels
					
					_path.projection()
							.translate([k / 2 - d[0] *256, k / 2 - d[1] *256]) // [0�,0�] in pixels
							.scale(k / 2 / Math.PI);
					
					var canvas = tile.append("canvas")
						.attr("width", 256)
						.attr("height", 256);
					
					var context = canvas.node().getContext("2d");
					_path.context(context);
					context.save();
					
					data.forEach(function(d){
							context.beginPath();
							_path(d);
							//context.strokeStyle = typeof(_style.stroke)=='function'?_style.stroke(d.properties[_style.column]):_style.stroke;
							context.fillStyle = typeof(_style.fill)=='function'?_style.fill(d.properties[_style.column]):_style.fill;
							//context.stroke();
							context.fill();
							context.closePath();
					});
					context.lineWidth   = 1;
					context.restore();
				}
      }
      function matrix3d(scale, translate) {
				var k = scale / 256, r = scale % 1 ? Number : Math.round;
				return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
			}
			
      //Draw the tiles (based on data-update)
      var draw = function(){
      	//Wait for cache to be settled
      	Promise.all(d3.mappu.Cache.runningtasks).then(function(){
      		 var rand = 0;
					 var drawboard = layer.drawboard;
					 var tiles = layer.map.tiles;
					 _xhrqueue = [];
					 var image = drawboard
							.style("transform", matrix3d(tiles.scale, tiles.translate))
							.selectAll(".tile")
							.data(tiles, function(d) { 
								return d; 
							});
	
					 var imageEnter = image.enter();
					 if (layer.visible){
					 	 var tile = imageEnter.append("div")
								.classed("tile",true)
								.attr('id',function(d){
										return 'T'+layer.id+'_'+d[0]+'_'+d[1]+'_'+d[2];
								})
								//.style('border','1px solid black')
								.style('position','absolute')
								.style('width','256px')
								.style('height','256px')
								.style("left", function(d) { return (d[0] << 8) + "px"; })
								.style("top", function(d) { return (d[1] << 8) + "px"; })
						
						//Delegate the xhr and twkb work to a webworker
						tile.each(function(d){
								var url = tileurl(d);
								//var rand = Math.round(Math.random() * 3);
								//rand>2?rand=0:rand++;
								renders[0].postMessage({layerid: layer.id, url: url,tile:d,attributes: _attributes });
						});
						//tile.each(setStyle);
					 }
					 image.exit()
						.each(function(d){
								//d3.select(this)[0][0].xhr.abort();//yuck
						})
						.remove();
				});
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

  //                                                                          マップ
;  /**

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
      var _layers = config.layers;
      var _duration = 0;
      var _cqlfilter = null;

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

      Object.defineProperty(layer, 'cql_filter', {
        get: function() {
            return _cqlfilter;
        },
        set: function(val) {
            _cqlfilter = val;
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
          if (_ogc_type == 'tms') {
              url = _url
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
          		"&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=default&TILEMATRIXSET=nltilingschema&TILEMATRIX="+d[2]+ "&TILEROW="+d[1]+"&TILECOL="+d[0]+"&FORMAT=image%2Fpng";
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
				 "&service=WMS&version=1.1.0&request=GetMap&tiled=true&width=256&height=256&srs=EPSG:3857&transparent=TRUE&format=image%2Fpng";
			if (_cqlfilter){
				url += '&cql_filter='+_cqlfilter;
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
				return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
			}


      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         var image = drawboard
         		.style("transform", matrix3d(tiles.scale, tiles.translate))
         		.selectAll(".tile")
            .data(tiles, function(d) { return d; });

         var imageEnter = image.enter();
         if (layer.visible){
         imageEnter.append("img")
              .classed('tile',true)
              .attr("src", tileurl)
              //.style('border','1px solid black')
              .style('width','256px')
              .style('height','256px')
              .style('position','absolute')
              .attr('opacity', this.opacity)
              .style("left", function(d) { return (d[0] << 8) + "px"; })
              .style("top", function(d) { return (d[1] << 8) + "px"; })
              //TODO: working on this
              .on('click', getFeatureInfo);
         }
         image.exit()
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

  d3_mappu_RasterLayer.prototype = Object.create(d3_mappu_Layer.prototype);

  //                                                                          マップ
;"use strict";
d3.mappu.Controllers = function(map) {
    return d3_mappu_Controllers(map);
};

d3_mappu_Controllers = function(map){
    var drag = d3.behavior.drag()
        .on('drag',function(e){
            console.log('Drag', d3.mouse(this));
        })
        .on('dragend',function(e,d){
            console.log('Dragend',d3.mouse(this)); 
        });
        
    map.svg.call(drag);
};;/**
 //TODO: write doc
**/


"use strict";
d3.mappu.Coordinates = function(config) {
    return d3_mappu_Coordinates(config);
};

d3_mappu_Coordinates = function(config){
    var tool = {};
    
    tool.addTo = function(map){
        var coordsdiv = d3.select(map.mapdiv).append('div').classed('coordinates',true);

        map.svg.on('mousemove', function(e){
            var loc = d3.mouse(this);
            var crds = map.projection.invert(loc);
            coordsdiv.html('lat: ' + Math.round(crds[0] * 100) / 100 + '| lon: ' + Math.round(crds[1] * 100) / 100);
        });
    };
    return tool;
};