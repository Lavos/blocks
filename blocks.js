define(['jquery', 'doubleunderscore'], function($, __){
	var Blocks = {};

	var each = function (obj, iterator) {
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				iterator(obj[key], key, obj);
			};
		};
	};

	var extend = function (obj) {
		var objects = Array.prototype.slice.call(arguments, 1);
		var counter = 0, limit = objects.length;

		while (counter < limit) {
			var current = objects[counter];

			for (var prop in current) {
				obj[prop] = current[prop];
			};

			counter++;
		};

		return obj;
	};

	// adapted from BackBone's inherit, also adapted from Google Closure's inherit
	var ctor = function(){};

	var inherits = function (body, extend_prototypes) {
		var parent = this;

		console.dir(parent);
		var body = body || function(){};

		var child = function(){
			parent.apply(this, arguments);
			body.apply(this, arguments);
		};

		extend(child, parent);

		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		child.prototype.constructor = child;
		child.__super__ = parent.prototype;

		if (extend_prototypes) {
			extend(child.prototype, extend_prototypes);
		};

		return child;
	};

	// Events

	var Events = function Events (){
		this.subscriptions = {};
	};

	Events.inherits = inherits;

	extend(Events.prototype, {
		cancelSubscriptions: function cancelSubscriptions (eventname) {
			var self = this;

			if (eventname && self.subscriptions.hasOwnProperty(eventname)) {
				self.subscriptions[eventname] = [];
			} else if (!eventname) {
				self.subscriptions = {};
			};
		},

		once: function once (eventname, callback, context) {
			var self = this;

			function wrappedHandler () {
				callback.apply(this, arguments);
				self.off([eventname, wrappedHandler]);
			};

			return self.on(eventname, wrappedHandler, context || self);
		},

		on: function on (eventname, callback, context) {
			var self = this;

			var events = eventname.split(' ');

			var event_counter = 0, event_limit = events.length;
			while (event_counter < event_limit) {
				var current_event = events[event_counter];
				self.subscriptions[current_event] = self.subscriptions[current_event] || [];

				self.subscriptions[current_event].push({
					callback: callback || function(){},
					context: context || self
				});

				event_counter++;
			};

			return callback;
		},

		off: function off (eventname, handle) {
			var self = this;

			var eventname = handle[0], func = handle[1];

			if (self.subscriptions.hasOwnProperty(eventname)) {
				var callbacks = self.subscriptions[eventname];

				var counter = callbacks.length;
				while (counter--) {
					if (callbacks[counter].callback === func) {
						self.subscriptions[eventname].splice(counter, 1);
					};
				};
			};
		},

		fire: function fire () {
			var self = this;

			var args = Array.prototype.slice.call(arguments);

			if (self.subscriptions.hasOwnProperty('debug')) {
				self._doCallbacks(self.subscriptions['debug'], ['debug'].concat(args));
			};

			if (self.subscriptions.hasOwnProperty('all')) {
				self._doCallbacks(self.subscriptions['all'], ['all'].concat(args));
			};

			if (self.subscriptions.hasOwnProperty(args[0])) {
				self._doCallbacks(self.subscriptions[args[0]], args);
			};
		},

		_doCallbacks: function _doCallbacks (pairs, args) {
			var self = this;

			var safe_pairs = pairs.slice();
			var safe_args = args.slice();
			var counter = 0, limit = safe_pairs.length;

			while (counter < limit) {
				var current_pair = safe_pairs[counter];
				current_pair.callback.apply(current_pair.context, safe_args.slice(1));
				counter++;
			};
		}
	});

	// TODO global events



	// Model

	var Model = Events.inherits(function Model(){
	}, {
		// static properties
		isDirty: false,
		isSaving: false,
		data: {},
		transmit_data: {},

		// methods
		set: function set (key, value, silent) {
			if (!this.hasOwnProperty('data')) {
				this.data = {};
			};

			if (this.data[key] === value) { // data is the same
				return null;
			};

			this.data[key] = value;
			var obj = {};
			obj[key] = value;

			if (!silent) {
				this.fire('change', obj);
			};

			return obj;
		},

		ingest: function ingest (data) {
			if (!this.hasOwnProperty('data')) {
				this.data = {};
			};

			var changes = [];
			_.each(data, function(value, key){
				var change = this.set(key, value, true);

				if (change) {
					changes.push([key, value]);
				};
			});

			this.fire('change', __.extend.apply({}, changes));
		},

		serializeToJSON: function serializeToJSON () {

		}			
	});



	// Collection

	var Collection = Events.inherits(function Collection () {
		this.model = new this.model_constructor();
	}, {
		model_constructor: Model,
		length: 0,
		push: function push (){
			var args = Array.prototype.slice.call(arguments, 0);
			if (args.length) {
				Array.prototype.push.apply(this, args);
				this.fire('add', args);
				this.fire('newset', self);
			};
		},
		indexOf: Array.prototype.indexOf,
		splice: function(){
			var add_items = Array.prototype.slice.call(arguments, 2);
			var removed_items = Array.prototype.splice.apply(self, arguments);

			if (add_items.length) {
				self.fire('add', add_items);
			};

			if (removed_items.length) {
				self.fire('remove', remove_items);
			};

			if (add_items.length || removed_items.length) {
				self.fire('newset', self);
			};

			return removed_items;
		}
	});

	var View = Events.inherits(function View (params) {
		var self = this;

		self.element = document.createElement(self.tag_name);
		self.element.className = self.element_classes;
		self.$element = $(self.element); 
	
		self.comp_template = __.template(self.template_string);

		var counter = 0, limit = self.events.length;
		while (counter < limit) {
			var current_event = self.events[counter];
			console.log(current_event);
			self.$element.on(current_event.event_name, current_event.selector, self[current_event.function_name].bind(self));
			counter++;
		};
	}, {
		tag_name: 'div',
		element_classes: '',
		template_string: '',
		events: [],
		render: function render(data){}
	});

	Model.inherits = Collection.inherits = View.inherits = inherits;

	Blocks.Model = Model;
	Blocks.Collection = Collection;
	Blocks.View = View;
	return Blocks;
});
