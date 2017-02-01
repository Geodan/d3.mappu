d3.mappu = d3.mappu || {};
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
	var pi = Math.PI,
    	tau = 2 * pi;
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
	var _projection = config.projection || d3.geoMercator( );
	var _zoom = config.zoom || 22;
	var _transform;
	var _maxZoom = config.maxZoom || 24;
	var _minZoom = config.minZoom || 15;
	var _maxView = config.maxView || [ [- 180, 90 ],[ 180,- 90 ] ];
	//var dispatch = d3.dispatch( "loaded", "zoomend" );
	var redraw = function( ) {
		_transform = d3.event.transform;

		_tiles = _tile
			.scale( _transform.k)
			.translate( [_transform.x, _transform.y])
			( );
		_projection
			.scale( _transform.k / tau )
			.translate( [_transform.x,_transform.y]);
		_layers.forEach( function( d ) {
				d.refresh( 0 );
		} );
		
		
		//Set internal zoom
		_zoom = Math.log( _transform.k) / Math.log( 2 );
		
		
		
		//Set internal center
		var pixcenter = [ _width / 2, _height / 2 ];
		_center =  _projection.invert( pixcenter );

		//Update extent value
		var lb = _projection.invert( [ 0, _height] );
		var rt = _projection.invert( [ _width, 0 ] );
		map.extent = [ lb, rt ];

		//dispatch.zoomend( );
	};
	var resize = function( ) {
		
		_width = _mapdiv.clientWidth;
		_height = _mapdiv.clientHeight;
		d3.select( _mapdiv ).selectAll( '.drawboard' )
			.attr( "width", _width )
			.attr( "height", _height );

		_tile.size( [ _width, _height ] );
		//redraw( );

	};

	_projection
		.scale(1 / tau)
		.translate([0,0]);

	var _tile = d3.tile( )
		.size( [ _width, _height ] );
	
	var _zoombehaviour = d3.zoom( )
		.scaleExtent( [ 1 << _minZoom, 1 << _maxZoom ] )
		.on("zoom", redraw );

	var _projcenter = _projection( _center );
	
	d3.select( _mapdiv )
		.call( _zoombehaviour )
		.call(_zoombehaviour.transform, d3.zoomIdentity
			.translate(_width / 2, _height / 2)
			.scale(1 << _zoom)
			.translate(-_projcenter[0], - _projcenter[1])
		);

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
   			//zoomcenter( _zoom, val );
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
  				//zoomcenter( val, _center );
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
  			//this.zoombehaviour.scaleExtent( [ 1 << _minZoom, 1 << _maxZoom ] );
  		}
  } );
  // .maxZoom : (zoomlevel)
  Object.defineProperty( map, 'maxZoom', {
  		get : function( ) {
  			return _maxZoom;
  		},
  		set : function( val ) {
  			_maxZoom = val;
  			//this.zoombehaviour.scaleExtent( [ 1 << _minZoom, 1 << _maxZoom ] );
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
  
  Object.defineProperty( map, 'transform', {
  		get : function( ) { return _transform;},
  		set : function( ) { console.warn( 'No setting allowed for transform' );}
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

	map.addLayer = addLayer;
	map.removeLayer = removeLayer;
	map.orderLayers = orderLayers;
	map.redraw = redraw;
	map.resize = resize;

	return map;
};
//                                                                          マップ
