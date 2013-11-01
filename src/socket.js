(function() {

	'use strict';

	var SocketService = function($q, $rootScope) {

		var create = function(config) {
			var deferred = $q.defer();

			if (typeof config === 'undefined') {
				return $q.reject('Socket config is undefined');
			}

			if (typeof config.url === 'undefined') {
				return $q.reject('URL is undefined');
			}

			if (typeof config.url !== 'string') {
				return $q.reject('Unsupported URL type');
			}

			try {
				var socket = io.connect( config.url, config.opts );

				socket.on('connect', function() {
					$rootScope.$apply(function() {
						deferred.resolve(socket);
					});
				});

				socket.on('error', function() {
					$rootScope.$apply(function() {
						deferred.reject('CONNECTION ERROR');
					});
				});
			} catch ( err ) {
				return $q.reject( err );
			}

			return deferred.promise;
		};

		this.create = function(config) {
			var chain = [create, undefined];
			var deferred = $q.defer();
			var promise = deferred.promise;

			while(chain.length) {
				var thenFn = chain.shift();
				var rejectFn = chain.shift();

				promise = promise.then(thenFn, rejectFn);
			}

			deferred.resolve(config);

			promise.success = function(fn) {
				promise.then(function(response) {
					fn(response);
				});
				return promise;
			};

			promise.error = function(fn) {
				promise.then(null, function(response) {
					fn(response);
				});
				return promise;
			};

			return promise;
		};
	};

	var SocketFactory = function($rootScope, $q, SocketService) {
		// Item in list: 'name': { socket: socket instance, on: {}, emit: {}, once: {} }
		var socketList = {};
		var defListeners = ['connect', 'error'];

		var add = function(obj) {
			var deferred = $q.defer();
			var promise = deferred.promise;

			SocketService.create(obj.config)
				.success(function(data) {
					deferred.resolve({name: obj.name, socket: data});
				})
				.error(function(error){
					deferred.reject(error);
				});

			return promise;
		};

		var addToList = function(data) {
			if (typeof data !== 'undefined') {
				if (typeof data.name !== 'undefined') {
					socketList[ data.name ] = {};
					socketList[ data.name ][ 'socket' ] = data.socket;
					socketList[ data.name ][ 'on' ]	    = (typeof data.on === 'undefined') ? {} : data.on;
					socketList[ data.name ][ 'emit' ]   = (typeof data.emit === 'undefined') ? {} : data.emit;
					socketList[ data.name ][ 'once' ]   = (typeof data.once === 'undefined') ? {} : data.once;
					return socketList[ data.name ];
				}
			}
		};

		var hasSocket = function(name) {
			return (typeof socketList[ name ] !== 'undefined');
		};

		var getBcName = function(name, event_name, bc_name) {
			if (typeof bc_name === 'string' && bc_name.length > 0) {
				return bc_name;
			}

			return name + ':' + event_name;
		};

		return {
			add: function(name, config) {
				var deferred = $q.defer();
				var promise = deferred.promise;

				if (!hasSocket(name)) {
					var chain = [add, undefined, addToList, undefined];
					while(chain.length) {
						var thenFn = chain.shift();
						var rejectFn = chain.shift();

						promise = promise.then(thenFn, rejectFn);
					}

					deferred.resolve({name: name, config: config});
				} else {
					deferred.resolve(socketList[ name ]);
				}

				promise.success = function(fn) {
					promise.then(function(response) {
						fn(response);
					});
					return promise;
				};

				promise.error = function(fn) {
					promise.then(null, function(response) {
						fn(response);
					});
					return promise;
				};

				return promise;
			},
			push: function(name, socket) {
				if (typeof name !== 'string') {
					return null;
				}

				if (typeof socket === 'undefined') {
					return null;
				}

				if ( hasSocket(name) ) {
					return null;
				}

				socketList[ name ] = {};
				socketList[ name ][ 'socket' ] 	= socket;
				socketList[ name ][ 'on' ]		= {};
				socketList[ name ][ 'emit' ]   	= {};
				socketList[ name ][ 'once' ]   	= {};

				for (var evnt in socket.$events) {
					if ( defListeners.indexOf( evnt ) == -1 ) {
						socketList[ name ][ 'on' ][ evnt ] = {
							event_name: evnt,
							bc_name: name + ':' + evnt,
							callback: socket.$events[ evnt ]
						};
					}
				}

				return socketList[ name ];
			},
			remove: function(name) {
				if (hasSocket(name)) {
					socketList[ name ].socket.on('disconnect', function() {						
						socketList[ name ].socket.removeAllListeners();

						delete socketList[ name ];
					});

					socketList[ name ].socket.disconnect();
				}

				return true;
			},
			hasSocket: function(name) {
				return hasSocket(name);
			},
			get: function(name) {
				if (!hasSocket(name)) {
					return null;
				}

				return socketList[ name ];
			},
			socket: function(name) {
				if (!hasSocket(name)) {
					return null;
				}

				return socketList[ name ].socket;
			},
			addOn: function(name, event_name, callback) {
				// Returns null if no socket with name, or on event
				if (!hasSocket(name)) {
					return null;
				}

				if (typeof socketList[ name ].on === 'undefined') {
					socketList[ name ].on = {};
				}

				if (typeof socketList[ name ].on[ event_name ] !== 'undefined') {
					socketList[ name ].on[ event_name ].bc_name.push( getBcName(name, event_name, callback) );
					socketList[ name ].on[ event_name ].callback.push( callback );

					socketList[ name ].socket.on(event_name, function(data) {
						switch(typeof callback){
							case 'function':
								callback(data);
								break;

							default:
								$rootScope.$broadcast(obj.bc_name, data);
								break;
						}
					});

					return socketList[ name ].on[ event_name ];
				}

				var obj = {
					event_name: event_name,
					bc_name: [ getBcName(name, event_name, callback) ],
					callback: [ callback ]
					};

				socketList[ name ].on[ event_name ] = obj;

				socketList[ name ].socket.on(event_name, function(data) {
					switch(typeof callback){
						case 'function':
							callback(data);
							break;

						default:
							$rootScope.$broadcast(obj.bc_name, data);
							break;
					}
				});

				return socketList[ name ].on[ event_name ];
			},
			addEmit: function(name, event_name, data, callback) {
				// Returns null if no socket with name, or on event
				if (!hasSocket(name)) {
					return null;
				}

				if (typeof socketList[ name ].emit === 'undefined') {
					socketList[ name ].emit = {};
				}

				if (typeof socketList[ name ].emit[ event_name ] !== 'undefined') {
					return socketList[ name ].emit[ event_name ];
				}

				var obj = {
					event_name: event_name,
					bc_name: getBcName(name, event_name, callback),
					callback: callback,
					emited: false
					};

				socketList[ name ].emit[ event_name ] = obj;

				socketList[ name ].socket.emit(event_name, data, function(response) {

					switch(typeof callback){
						case 'function':
							callback(response);
							break;

						default:
							$rootScope.$broadcast(obj.bc_name, response);
							break;
					}

					socketList[ name ].emit[ event_name ].emited = true;
				});

				return socketList[ name ].emit[ event_name ];
			},
			addOnce: function(name, event_name, callback) {
				// Returns null if no socket with name, or on event
				if (!hasSocket(name)) {
					return null;
				}

				if (typeof socketList[ name ].once === 'undefined') {
					socketList[ name ].once = {};
				}

				if (typeof socketList[ name ].once[ event_name ] !== 'undefined') {
					return socketList[ name ].once[ event_name ];
				}

				var obj = {
					event_name: event_name,
					bc_name: getBcName(name, event_name, callback),
					callback: callback,
					executed: false
					};

				socketList[ name ].once[ event_name ] = obj;

				socketList[ name ].socket.once(event_name, function(data) {
					switch(typeof callback){
						case 'function':
							callback(data);
							break;

						default:
							$rootScope.$broadcast(obj.bc_name, data);
							break;
					}

					socketList[ name ].once[ event_name ].executed = true;
				});

				return socketList[ name ].once[ event_name ];
			},
			getOn: function(name, event_name) {
				if (!hasSocket(name)) {
					return null;
				}

				if (typeof socketList[ name ].on === 'undefined') {
					return null;
				}

				if (typeof socketList[ name ].on[ event_name ] === 'undefined') {
					return null;
				}

				return socketList[ name ].on[ event_name ];
			},
			getEmit: function(name, event_name) {
				if (!hasSocket(name)) {
					return null;
				}

				if (typeof socketList[ name ].emit === 'undefined') {
					return null;
				}

				if (typeof socketList[ name ].emit[ event_name ] === 'undefined') {
					return null;
				}

				return socketList[ name ].emit[ event_name ];
			},
			getOnce: function(name, event_name) {
				if (!hasSocket(name)) {
					return null;
				}

				if (typeof socketList[ name ].once === 'undefined') {
					return null;
				}

				if (typeof socketList[ name ].once[ event_name ] === 'undefined') {
					return null;
				}

				return socketList[ name ].once[ event_name ];
			},
			getList: function() {
				return socketList;
			}
		};
	};

	angular.module('Socket', [])
		.service( 'SocketService', SocketService )
		.factory( 'SocketFactory', SocketFactory );

})();
