/* LG.js
*  Animation
*  Dependant: core, css
*/

(function($lg) {
	
	if(!$lg || !$lg.depend('css')) {
		return;
	}
	
	var lg = $lg.proto;
	
	/* Animation. Modified version of Animax. */
			
	//global animax object
	$lg.animation = {
		rAF : window.requestAnimationFrame 
			|| window.mozRequestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function( fn ) { return setTimeout( fn, 1000 / 60 ) },
		running : false, //are all the stored animations running?
		animations : [], //queued animation objects.
		defaultObj : {
			duration : 1000, //duration of animation
			onStart : function(){}, //function when the animation starts
			onFinish : function(){}, //function when the animation finished
			callback : function(){}, //function which performs the animation
			finished : false, 
			started : false,
			values : [], //values of each tweek
			style : 'smooth',
			curTweek : 0,
			length : 0,
			start : 0,
			end : 0,
			reset : function() { //resets an animation ready for use again.
				this.finished = false;
				this.started = false;
				this.store = {};
				this.curTweek = 0;
			},
			data : function(name, value) { //stored data in the animation object to be accessed by callback, onFinish, onStart
				if(!name) return this.store;
				if(arguments.length == 2) this.store[name] = value;
				return this.store[name];
			},
			store : {}
		},
		styles : { //percentage increases for each frame when creating to - from values. Must sum to 100 to complete 100%
			'smooth': [1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1],
			'accell': [1,2,3,4,5,6,7,8,9,10,10,11,12,12],
			'zoom': [12,12,11,10,10,9,8,7,6,5,4,3,2,1],
			'linear': [10,10,10,10,10,10,10,10,10,10],
			'bounce': [10,10,10,10,10,10,10,10,-8,11,-6,10,-4,8,-3,6,-2,5,-1,4],
			'shake': [6,6,-6,-6,-6,-6,6,6,8,8,-8,-8,-8,-8,8,8,6,6,-6,-6,-6,-6,6,6,5,5,-5,-5,-4,-4,4,4,3,-3]
		},
		speeds : { //preset speeds. 
			'fast' : 400,
			'normal': 800,
			'slow' : 2000,
			'slug' : 3000
		},
		
		//creates the values inbetween start and end. 
		createValues : function(start, end, type) {
			var values = []
			, total = parseFloat(start)
			, diff = parseFloat(end) - start
			, increments = $lg.is_string(type) ? this.styles[ type ] : type;
			
			if(!$lg.is_array(increments)) {
				return [];
			}
			
			var frames = increments.length;
			
			for (var i = 0; i < frames; i++) {
				total += ( diff*increments[i] ) / 100;
				values[i] = Math.round(total * 10) / 10; // rounds to one decimal place
			}
			
			return values;
		},
		
		//store animation objects. 
		add : function() {
			for(var i = 0, l = arguments.length; i<l; i++) {
				if($lg.is_object(arguments[i])) this.animations.push( arguments[i] );
			}
		},
		
		// create an animation object
		create : function( obj, element, extraData ) {
			if($lg.is_string(obj)) {
				var newobj = {};
				if(obj in $lg.animation.presets) {
					var pre = $lg.animation.presets[obj];
					if(element || !pre.elementNeeded) {
						for(var i in pre) newobj[i] = pre[i];	
					}
				}
				obj = newobj;
			}
			
			if($lg.is_object(obj)) {
				for(var i in this.defaultObj) {
					if( !(i in obj) ) {
						 obj[i] = this.defaultObj[i];
					}
				}
					
				if($lg.is_string(obj.style)) {
					obj.values = this.createValues(obj.start, obj.end, obj.style);
				}
				
				obj.length = obj.values.length;
				obj.element = element;
				obj.store = {};
				
				if(extraData) {
					for(var i in extraData) {
						obj.store[i] = extraData[i];
					}
				}
			}
			
			return obj;	
		},
		
		// run all stored animations. Called by requestAnimationFrame so must be global.
		runAll : function(callback) {
			var animationsLeft = false
			, us = $lg.animation;
			
			$lg.array_walk(us.animations, function(a) {
				if(!a.started) {
					a.onStart();
					a.started = true;
				}
				
				if(!a.finished) {
					animationsLeft = true;
					a.callback( a.values[ a.curTweek++ ], a.element || null);
					
					if(a.curTweek >= a.length) {						
						a.finished = true;
						a.onFinish();
					}
				}
			});
			
			if(animationsLeft) {
				us.rAF.call(window, function() { us.runAll(callback); }); //must be called in window scope
				us.running = true;
			}
			else {			
				us.resetAll(); //reset all the anims so they can be run again.
				us.running = false;
				if($lg.is_function(callback)) callback.call($lg);
			}		
		},

		//run a single animation object independantly. (this allows setting a duration for the animation to last)
		run : function(a, time) {
			if(!time) time = a.duration;		
			if(time && $lg.is_string(time)) time = this.speeds[time];
			time = time || this.speeds['normal'];
			
			var t = setInterval(function() {
				if(!a.started) {
					a.onStart();
					a.started = true;
				}
				
				if(!a.finished) {
					a.callback( a.values[ a.curTweek++ ], a.element || null );
					if(a.curTweek >= a.length) {
						clearInterval( t );
						a.onFinish();
						a.finished = true;
						a.reset();
					}
				}
			}, time / a.length);
		},
		
		//delete all stored anims.
		clear : function() {
			$lg.animation.animations = [];
		},
		
		//reset all anims so it can be used again
		resetAll : function() {
			$lg.array_walk(this.animations, function(a) { a.reset(); }); 
		},
		
		setPreset : function(name, obj) {
			this.presets[name] = obj;
		},
		
		config : function(option, value) {
			if($lg.is_string(option)) {
				this.defaultObj[ option ] = value;
			}
			else if($lg.is_object(option)) {
				for(var i in option) this.defaultObj[ i ] = option[ i ];
			}
		}
	};
	
	$lg.animation.presets = {};
	
	lg.fadeIn = function(time, callback) {
		if($lg.is_function(time)) {
			callback = time;
		}
		
		var o = this.show().css('opacity');
		
		return this.css('opacity', 0.0).animate({
			opacity : parseFloat(o) || 1.0
		}, callback, time);
	};
	
	lg.fadeOut = function(time, callback) {
		if($lg.is_function(time)) {
			callback = time;
		}
		
		return this.data('originalOpacity', this.css('opacity')).animate({
			opacity : 0
		}, function() {
			this.hide().css('opacity', this.data('originalOpacity'));
			if($lg.is_function(callback)) callback.call(this);
		}, time);
	};
	
	lg.slideDown = function(time, callback) {
		if($lg.is_function(time)) {
			callback = time;
		}
		
		var h = this.css('overflow', 'hidden').show().data('originalMaxHeight', this.maxHeight()).offsets('height');
		
		return this.maxHeight('0px').animate({
			maxHeight : h + 'px'
		}, function() {
			this.maxHeight(this.data('originalMaxHeight'));
			if($lg.is_function(callback)) callback.call(this);
		}, time);
	};
	
	lg.slideUp = function(time, callback) {
		if($lg.is_function(time)) {
			callback = time;
		}
		
		return this.css('overflow', 'hidden').data('originalMaxHeight', this.maxHeight()).maxHeight(this.offsets('height') + 'px').animate({
			maxHeight : 0
		}, function() {
			this.hide().maxHeight(this.data('originalMaxHeight'));
			if($lg.is_function(callback)) callback.call(this);
		}, time);
	};
	
	$lg.animation.presets.css = {
		onStart : function() {
			var props = this.data();
			for(var i in props) {
				var cur_val, unit;
				
				if( this.element.style && i in this.element.style ) {
					cur_val = $lg(this.element).css(i);
					
					if(!cur_val) {
						cur_val = '0';
					}
					
					unit = cur_val.replace(/\d/g, '');
					cur_val = parseFloat( cur_val.replace(unit, '') );
				
					if($lg.is_string(props[i])) {
						var user_unit = props[i].replace(/\d/g, '');
						if(user_unit !== unit) {
							unit = user_unit;
							cur_val = 0; //if the unit the user provided doesn't match the already set unit assume a 'from' value of 0
						}
					}
				}
				else if( $lg.installed.prop ) {
					cur_val = parseFloat( $lg(this.element).prop(i) );
				}
				
				if(isNaN(cur_val)) {
					cur_val = this.start;
				}
				
				this.data(i, {
					values : $lg.animation.createValues(cur_val, $lg.is_number(props[i]) ? props[i] : parseFloat(props[i]), this.style),
					unit : unit
				});
			
			}
		},
		
		callback : function(v, e) {
			var props = this.data();
			
			if(props) {
				for(var i in props) {
					if(!props[i]) {
						continue;
					}
					
					v = props[i].values[this.curTweek];
					
					if(props[i].unit) {
						v += props[i].unit;
					}
					
					if( e.style && i in e.style ) {
						$lg(e).css(i, v);
					}
					else if( $lg.installed.props ) {
						$lg(e).prop(i, v);
					}
				}
			}
		}
	};	
	
	lg.animate = function(props, callback, time) {
		if(this[0]) {
			if($lg.is_string(callback) || $lg.is_number(callback)) {
				time = callback;
			}
			
			var anim = $lg.animation.create('css', this[0], props)
			, that = this;
			
			if($lg.is_function(callback)) {
				anim.onFinish = function() {
					callback.call(that);
				};
			}
			
			$lg.animation.run(anim, time);
		}
		
		return this;
	};
	
	var _hide = lg.hide
	, _show = lg.show;
	
	lg.hide = function(anim) {
		if(anim) {
			var fn = {slide: 'slideUp', fade: 'fadeOut'}[anim];
			
			if(fn) {
				return this[fn]();
			}
		}
		return _hide.call(this);
	};
	
	lg.show = function(anim) {
		if(anim) {
			var fn = {slide: 'slideDown', fade: 'fadeIn'}[anim];
			
			if(fn) {
				return this[fn]();
			}
		}
		
		return _show.call(this);
	};

	lg.toggle = function(anim) {
		return this.all(function(e) {
			e = $lg(e);
			e.display() !== 'none' ? e.hide(anim) : e.show(anim);
		});
	};
	
	$lg.installed.anim = 1;


})($lg);
