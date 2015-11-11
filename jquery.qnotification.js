/**
* $.fn.Qnotification
*
* A jQuery plugin to 
*
* @version v1.0.0, 2015-11-11
* @author Fredi Quirino <fred@firefallpro.com>
*/
/* global jQuery:true TweenMax:true */

/*
* to-do:
* - add ability to change the delay of each individual notification temporarily,
* currently if you change the auto_close_delay then you change it for all notifications, last one sets it for all
*/
(function ($) {
	var defaults = {
		debug : false,
		debug_lvl : 1,
		plugin_name : 'Qnotification',
		classname : {
			container : 'notification_container',
			wrapper : 'wrapper',
			template : 'template',
			message : 'message',
			close : 'close_btn'
		},
		speed : 800,
		auto_close : true,
		auto_close_delay : 1000,
		animations : {}
	};
	
	var notification_count = 0;
	
	//////////////
	// Private
	//////////////
	var methods = {
		_log : function () {
			if (!$.fn.Qnotification.debug) return;
			
			var ie = !$.support.opacity, args = arguments, str = '';
			
			if (ie && typeof arguments[0] === 'string' && typeof arguments[1] === 'string') str = arguments[0] + ' ' + arguments[1];
			else if (ie && typeof arguments[0] === 'string') str = arguments[0];
			
			console.log(defaults.plugin_name, (ie) ? str : args);
		},
		_size : function (obj) {
			var size = 0, key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) size++;
			}
			return size;
		},
		init : function (fn, args, options) {
			// Toggle debug
			if (options.debug) $.fn.Qnotification.debug = true;
				
			// Merge specified options with defaults
			var o = $.extend({}, defaults, options);
			
			// return object by default
			var results = this;
			// iterate through jquery objects
			this.each(function () {
				var $this = $(this);
				
				// has already been initialized
				if (typeof $this.data('qnotification') !== 'undefined') {
					methods._log('init: already initialized');
					var data = $this.data('qnotification');
						data.options = $.extend({}, data.options, options);
					if (typeof methods[fn] !== 'undefined') results = methods[fn].call($this, args, data);
					return $this;
				}
				
				methods.init_notification.call($this, o);
			});
			return results;
		},
		init_notification : function (o) {
			var $this = this;
			var data = {
				notification : {
					queue : [],
					timer : null
				},
				options : o
			};
			
			$this.addClass(o.classname.container).data('qnotification', data);
		},
		add : function (message, data) {
			methods._log('add:', message);
			
			var options = data.options;
			var $this = this,
				$template,
				$wrapper,
				$notification,
				$message,
				$close;
			
			// template element
			$template = $this.find('.' + options.classname.template);
			if (!$template.length) {
				methods._log('add: template target not found');
				return $this;
			}
			// wrapper
			$wrapper = $this.find('.' + options.classname.wrapper);
			if (!$wrapper.length) {
				methods._log('add: wrapper target not found');
				return $this;
			}
			
			// new element
			$notification = $template.clone().removeClass(options.classname.template);
			$notification.attr('id', options.plugin_name + '-' + notification_count);
			notification_count++;
			
			// message element
			$message = $notification.find('.' + options.classname.message);
			if (!$message.length) {
				methods._log('add: message target not found');
				return $this;
			}
			message = $.trim(message);
			$message.text(message);
			
			// close element
			$close = $notification.find('.' + options.classname.close);
			if (!$close.length) {
				methods._log('add: close target not found');
				return $this;
			}
			
			// events
			$close.on('click', function () {
				methods._log('event: close button');
				methods.close.call($this, $notification, data);
			});
			
			// add to dom (hidden)
			$wrapper.append($notification);
			
			// queue message
			data.notification.queue.push($notification);
			
			//$this.data('qnotification', data);
			
			// animate
			return methods.transition.call($this, data);
			
			//return $this;
		},
		close : function (target, data, flag) {
			methods._log('close:');
			
			var $this = this,
				options = data.options;
			
			var $target = typeof target === 'string' ? $(target) : target;
				$target = $target === null ? $this.find('.active.notification') : $target;
			if (!$target.length) {
				methods._log('close: target not found');
				return $this;
			}
			
			if ($this.hasClass('transition')) {
				methods._log('close: currently unavailable');
				return $this;
			}
			
			$this.addClass('transition');
			
			if (!flag) {
				methods.stop_timer.call($this, data);
			}
			
			$target.fadeOut(options.speed, function () {
				methods._log('close: complete');
				$this.removeClass('transition');
				$target.removeClass('active');
				methods.transition.call($this, data);
			});
			
			return $this;
		},
		start_timer : function (data) {
			methods._log('start_timer:', data.notification.timer);
			
			var $this = this;
			
			methods.stop_timer.call($this, data);
			
			$this.addClass('sleep');
			data.notification.timer = setTimeout(function () {
				data.notification.timer = null;
				$this.removeClass('sleep');
				methods.close.call($this, null, data, 1);
			}, data.options.auto_close_delay);
			
			methods._log('start_timer:', data.notification.timer);
			
			return $this;
		},
		stop_timer : function (data) {
			methods._log('stop_timer:', data.notification.timer);
			var $this = this;
			
			if (data.notification.timer) {
				$this.removeClass('sleep');
				clearTimeout(data.notification.timer);
				data.notification.timer = null;
			}
			
			return $this;
		},
		transition : function (data) {
			methods._log('transition:');
			
			var $this = this,
				options = data.options;
			
			if ($this.hasClass('transition') || $this.hasClass('sleep')) {
				methods._log('transition: currently unavailable', $this.hasClass('transition'), $this.hasClass('sleep'));
				return $this;
			}
			
			if (!data.notification.queue.length) {
				methods._log('transition: queue is empty');
				return $this;
			}
			
			var $target = data.notification.queue.shift();
			if (!$target.length) {
				methods._log('transition: target not found');
				return $this;
			}
			
			//$this.data('qnotification', data);
			$this.addClass('transition');
			$target.fadeOut(0);
			$target.fadeIn(options.speed, function () {
				methods._log('transition: complete');
				
				$target.addClass('active');
				$this.removeClass('transition');
				
				// close notification after x seconds
				if (options.auto_close) {
					methods.start_timer.call($this, data);
				}
			});
			
			return $this;
		}
	};
	
	$.fn.Qnotification = function () {
		var fn = 'init', args, settings = {}, callback;
		
		// Assign arguments
		for (var i = 0; i < arguments.length; i++) {
			switch (typeof arguments[i]) {
			
			// Callback
			case 'function':
				callback = arguments[i];
				break;
			
			// Settings
			case 'object':
				settings = arguments[i];
				break;
			
			// Ignore undefined
			case 'undefined':
				break;
			
			// Function or Argument
			case 'string':
			default:
				if (methods[arguments[i]]) fn = arguments[i];
				else args = arguments[i];
				break;
			}
		}
		
		methods._log(fn);
		
		// type checking options that will be merged with default options
		for (var op in settings) {
			if (settings.hasOwnProperty(op)) {
				// Default option for invalid type
				if (typeof settings[op] !== typeof defaults[op] && defaults[op] !== null) settings[op] = defaults[op];
			}
		}
		
		// Everyone Must go through init
		return methods.init.call(this, fn, args, settings);
	};
	
	// Global debug
	$.fn.Qnotification.debug = false;
})(jQuery);