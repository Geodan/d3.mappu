/**
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
