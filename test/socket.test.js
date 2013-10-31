'use strict';

/* jasmine specs for services go here */

describe('Socket: ', function() {

	var socketService, socketFactory;
	var options = {'force new connection': true};

	beforeEach( module( 'Socket' ) );
	beforeEach(inject(function ( SocketService, SocketFactory ) {
		socketService = SocketService;
		socketFactory = SocketFactory;
	}));

	describe('SocketService: ', function() {

		it('Config is undefined', inject(function($rootScope){
			var promise = socketService.create();
			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();
			expect(successValue).toBeUndefined();
			expect(errorValue).toEqual('Socket config is undefined');
		}));

		it('Config URL is undefined', inject(function($rootScope){
			var promise = socketService.create({});
			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();
			expect(successValue).toBeUndefined();
			expect(errorValue).toBe('URL is undefined');
		}));

		it('URL type is unsupportes', inject(function($rootScope){
			var promise = socketService.create({url: 1});
			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();
			expect(successValue).toBeUndefined();
			expect(errorValue).toBe('Unsupported URL type');
		}));

		it('Should connect', inject(function($rootScope){
			var flag;
			var promise = socketService.create({url: 'http://localhost:9999', opts: options});
			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();

			// Waiting for connection for 3 seconds
			runs(function() {
				flag = false;
				setTimeout(function() {	
					flag = true;					
				}, 3000);
			});

			waitsFor(function() {
				return flag;
			}, "It must connect or return error in 3 sec", 3001);

			runs(function(){
				expect(successValue).not.toBeUndefined();
				expect(errorValue).toBeUndefined();
				expect(successValue != null).toBe(true);
				//console.log(successValue);
				successValue.socket.disconnect();
			});
		}));

		it('Should not connect', inject(function($q, $rootScope) {
			var flag;
			var promise = socketService.create({url: 'http://localhost:9900'});
			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();

			// Waiting for connection for 4 seconds
			runs(function() {
				flag = false;
				setTimeout(function() {	
					flag = true;
				}, 4000);
			});

			waitsFor(function() {
				return flag;
			}, "It must connect or return error in 4 sec", 4001);

			runs(function(){
				expect(successValue).toBeUndefined();
				expect(errorValue).toBe('CONNECTION ERROR');
			});
		}));
	});

	describe('SocketFactory', function() {
		
		it('Dont have any socket', function() {
			expect(Object.keys(socketFactory.getList()).length).toBe(0);
		});

		it('Should add new socket', inject(function($rootScope) {
			expect(socketFactory.hasSocket('socket1')).toBe(false);
  
			var flag;
			var promise = socketFactory.add('socket1', {url: 'http://localhost:9999', opts: options});
			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();

			// Waiting for connection for 3 seconds
			runs(function() {
				flag = false;
				setTimeout(function() {	
					flag = true;
				}, 3000);
			});

			waitsFor(function() {
				return flag;
			}, "It must connect or return error in 3 sec", 3001);

			runs(function(){
				expect(successValue).not.toBeUndefined();
				expect(errorValue).toBeUndefined();
				expect(successValue != null).toBe(true);

				expect(Object.keys(socketFactory.getList()).length).toBe(1);
				expect(socketFactory.hasSocket('socket1')).toBe(true);

				expect(socketFactory.get('XXX')).toBe(null);
				expect(socketFactory.socket('XXX')).toBe(null);

				expect(socketFactory.get('socket1')).toEqual(successValue);
				expect(socketFactory.socket('socket1')).toEqual(successValue.socket);
			});
		}));

		it('Should check and add events', inject(function($rootScope) {
			var flag;
			var promise = socketFactory.add('socket1', {url: 'http://localhost:9999', opts: options});
			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();

			// Waiting for connection for 3 seconds
			runs(function() {
				flag = false;
				setTimeout(function() {	
					flag = true;
				}, 3000);
			});

			waitsFor(function() {
				return flag;
			}, "It must connect or return error in 3 sec", 3001);

			runs(function(){
				expect(socketFactory.getOn('XXX')).toBe(null);
				expect(socketFactory.getOn('socket1')).toBe(null);
				expect(socketFactory.getOn('socket1', 'on_event')).toBe(null);

				expect(socketFactory.getEmit('XXX')).toBe(null);
				expect(socketFactory.getEmit('socket1')).toBe(null);
				expect(socketFactory.getEmit('socket1', 'emit_event')).toBe(null);

				var onEvent = socketFactory.addOn('socket1', 'on_event');
				var emitEvent = socketFactory.addEmit('socket1', 'emit_event');

				expect(onEvent).not.toBe(null);
				expect(emitEvent).not.toBe(null);

				expect(socketFactory.getOn('socket1', 'on_event')).toEqual(onEvent);
				expect(socketFactory.getEmit('socket1', 'emit_event')).toEqual(emitEvent);
			});

			// TODO: Check on and emit event structure
		}));

		it('Should call callback function', inject(function($rootScope){
			var flag;
			var promise = socketFactory.add('socket1', {url: 'http://localhost:9999', opts: options});
			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();

			// Waiting for connection for 3 seconds
			runs(function() {
				flag = false;
				setTimeout(function() {
					flag = true;
				}, 3000);
			});

			waitsFor(function() {
				return flag;
			}, "It must connect or return error in 3 sec", 3001);

			runs(function(){

				var emitData = '', 
					flag_callback,
					test_data = 'test data',
					onCounter = 0,
					onceCounter = 0;

				var emitCallback = function(data) {
					emitData = data;
				};

				var onCallback = function(data) {
					onCounter++;
				};

				var onceCallback = function(data) {
					onceCounter++;
				};

				var emitEvent = socketFactory.addEmit('socket1', 'emit_event', 'test data', emitCallback);
				var onEvent = socketFactory.addOn('socket1', 'on_event', onCallback);
				var onceEvent = socketFactory.addOnce('socket1', 'on_event', onceCallback);

				runs(function() {
					setTimeout(function() {
						flag_callback = true;
					}, 5000);
				});

				waitsFor(function() {
					return flag_callback;
				}, "It must return callback in 5 sec", 5001);

				runs(function(){
					expect(emitData).toEqual(test_data + ' response');
					expect(emitEvent.emited).toBe(true);
					expect(onCounter >= 4).toBe(true);
					expect(onceCounter == 1).toBe(true);
					expect(onceEvent.executed).toBe(true);
				});
			});
		}));

		it('Should emit broadcast', inject(function($rootScope){

		}));

		it('Should push socket', inject(function($rootScope){

		}));
	});
});
