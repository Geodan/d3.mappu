var _id;
var cache = {_db:null};

cache.init = function(){
	return new Promise(function(resolve, reject){
		if (cache._db) {
			resolve();
			return;
		}
		var request = indexedDB.open("test");
		request.onblocked = function(e){
			console.error('Blocked!',e);
			reject();
		}
		request.onerror = function(event) {
			console.error("Why didn't you allow my web app to use IndexedDB?!");
			reject();
		};
		request.onsuccess = function(event) {
			cache._db = event.target.result;
			cache._db.onerror = function(event) {
				console.error("Database error: " + event.target.error);
			};

			resolve();
		};
		request.onupgradeneeded = function(event) {
			console.error('No upgrade should be needed here');
			reject();
		};
	});
};

cache.add = function(key,data){
	return new Promise(function(resolve, reject){
			cache.init().then(function(){
				var req = cache._db.transaction(_id,"readwrite").objectStore(_id).put({key: key,data: data});
				req.onsuccess = function(){
					cache._db.close();
					resolve();
					
				};
				req.onerror = function(e){
					console.error(e);
					reject();
				};
			});
	});
}
cache.get = function(key,data){
	return new Promise(function(resolve, reject){
			var request = cache._db.transaction(_id).objectStore(_id).get(key);
			request.onsuccess = function(event){
				if (event.target.result){
					resolve(event.target.result.data);
				}
				else {
					reject();
				}
			};
			request.onerror = function(){
				reject();
			}
	});
}
cache.delete = function(key){
	return new Promise(function(resolve, reject){
			cache._db.transaction(_id,"readwrite").objectStore(_id).delete(key).onsucces = function(){
				resolve();
			};
	});
}

onmessage = function(e) {
	//var json = e.data.json;
	_id = e.data.layerid;
	var url = e.data.url;
	var tile = e.data.tile;
	var attributes = e.data.attributes;
	console.log('doiing init for ',_id);	
	cache.init().then(function(){
			console.log('adding to ',_id);
			cache.add('1',{data:'flups'}).then(function(){
					console.log('added to store ', _id);
			});
	}, function(error){
		console.warn(error);
	});
  
};