'use strict';

/* jasmine specs for services go here */

describe('Socket: ', function() {

	var socketService, socketFactory;

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
  			var promise = socketService.create({url: ''});
  			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();
			expect(successValue).not.toBeUndefined();
  			expect(errorValue).toBeUndefined();
  			expect(successValue != null).toBe(true);
		}));
	});

	describe('SocketFactory', function() {
		it('Dont have any socket', function() {
			expect(Object.keys(socketFactory.getList()).length).toBe(0);
		});

		it('Should add new socket', inject(function($rootScope) {
			expect(socketFactory.hasSocket('socket1')).toBe(false);
  			var promise = socketFactory.add('socket1', {url: ''});
  			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });
			expect(successValue).toBeUndefined();
			expect(errorValue).toBeUndefined();

			$rootScope.$apply();
			expect(successValue).not.toBeUndefined();
  			expect(errorValue).toBeUndefined();
  			expect(successValue != null).toBe(true);

  			expect(Object.keys(socketFactory.getList()).length).toBe(1);
  			expect(socketFactory.hasSocket('socket1')).toBe(true);

  			expect(socketFactory.get('XXX')).toBe(null);
  			expect(socketFactory.socket('XXX')).toBe(null);

  			expect(socketFactory.get('socket1')).toEqual(successValue);
  			expect(socketFactory.socket('socket1')).toEqual(successValue.socket);
		}));

		it('Should be different', inject(function($rootScope) {
			expect(socketFactory.hasSocket('socket1')).toBe(false);
			expect(socketFactory.hasSocket('socket2')).toBe(false);

  			var promise = socketFactory.add('socket1', {url: '111'});
  			var successValue, errorValue;

  			var socket1, socket2;

			promise
				.success(function(value) { socket1 = value; })
				.error(function(value) { errorValue = value; });

			$rootScope.$apply();

  			promise = socketFactory.add('socket2', {url: '123'});
			promise
				.success(function(value) { socket2 = value; })
				.error(function(value) { errorValue = value; });

			$rootScope.$apply();

			expect(socketFactory.hasSocket('socket1')).toBe(true);
			expect(socketFactory.hasSocket('socket2')).toBe(true);
			expect(socketFactory.get('socket1')).not.toBe(null);
			expect(socketFactory.get('socket2')).not.toBe(null);			
			expect(socket1).not.toEqual(socket2);
		}));

		it('Should check and add events', inject(function($rootScope) {
			expect(socketFactory.hasSocket('socket1')).toBe(false);
  			var promise = socketFactory.add('socket1', {url: '111'});
  			var successValue, errorValue;

			promise
				.success(function(value) { successValue = value; })
				.error(function(value) { errorValue = value; });

			$rootScope.$apply();

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

			// TODO: Check on and emit event structure
			// TODO: event structure name
		}));

		it('Should call callback function', inject(function($rootScope){

		}));

		it('Should emit broadcast', inject(function($rootScope){

		}));

		it('Should push socket', inject(function($rootScope){

		}));
	});
});
