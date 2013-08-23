define(['jquery', 'doubleunderscore'], function($, __){
	var Blocks = {};

	var Block = function Block () {};

	__.extend(Block.prototype, {
		// static properties
		isDirty: false,
		isSaving: false,
		data: {},
		transmit_data: {},

		// methods
		remember: function remember (data) {
			console.log(data);
			this.fire('update', data);
		},

		serializeToJSON: function serializeToJSON () {


		}			
	}, __.PubSubPattern.prototype);

	var Collection = __.inherits(Block);

	__.extend(Collection.prototype, {
		blocks: [],
		length: 0,
		push: Array.prototype.push,
		indexOf: Array.prototype.indexOf,
		splice: Array.prototype.splice
	});

	var View = function View (params) {
		var self = this;

		self.element = document.createElement(self.tag_name);
		self.element.className = self.element_classes;
		self.$element = $(self.element); 
	
		self.comp_template = __.template(self.template_string);

		var counter = 0, limit = self.events.length;
		while (counter < limit) {
			var current_event = self.events[counter];
			console.log(current_event);
			self.$element.on(current_event.event_name, current_event.selector, function(){ self[current_event.function_name](this); });
			counter++;
		};
	};

	__.extend(View.prototype, {
		tag_name: 'div',
		element_classes: '',
		template_string: '',
		events: [],
		render: function render(data){}
	});

	Blocks.Block = Block;
	Blocks.Collection = Collection;
	Blocks.View = View;
	return Blocks;
});
