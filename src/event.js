/* LG.js
*  Event
*  Dependant: core
*/

(function($lg, window) {
	if(!$lg) {
		return; 
	}
	
	var lg = $lg.proto;
	
	$lg.event = {
		eventStore : {},	
		eventObj : function(event) {
			if(event.lg_fixed === $lg.expando) {
				return event;
			}
		
			var newevent = { 
				lg_fixed : $lg.expando,
				originalEvent : event,
				bubbles : ('bubbles' in event) ? event.bubbles : (event.target && event.target.parentNode ? true : false),
				keyCode : event.keyCode || event.which,
				target : event.target || event.srcElement || document,
				defaultPrevented : false,
				propagationStopped : false,
				immediatePropagationStopped : false,
					
				stopPropagation : function() {		
					if(this.originalEvent.stopPropagation) this.originalEvent.stopPropagation();
					this.originalEvent.cancelBubble = this.propagationStopped = true;
				},
				isPropagationStopped : function() {
					return this.propagationStopped;
				},
				preventDefault : function() {
					this.defaultPrevented = true;
					if(this.originalEvent.preventDefault) this.originalEvent.preventDefault();
				},
				isDefaultPrevented : function() {
					return this.defaultPrevented;
				},
				stopImmediatePropagation : function() {
					if(this.originalEvent.stopImmediatePropagation) this.originalEvent.stopImmediatePropagation();
					this.immediatePropagationStopped = true;
				},
				isImmediatePropagationStopped : function() {
					return this.immediatePropagationStopped;
				}
			};		
			
			for(var data in event) {
				if( !(data in newevent) ) {
					newevent[data] = event[data];
				}
			}
			
			//real dom event or custom?
			newevent.custom = !(event instanceof window.Event);
			
			if( newevent.target.nodeType === 3 ) {
				newevent.target = newevent.target.parentNode;
			}
			
			if( !newevent.which ) {
				newevent.which = newevent.keyCode || newevent.charCode;
			}
			
			if( !newevent.metaKey ) {
				newevent.metaKey = newevent.ctrlKey;
			}
		
			return newevent;
		},
		
		bind : function(target, type, handler) {
			if(type.indexOf(' ') > 0) {
				return $lg.array_walk(type.split(' '), function(t) {
					$lg.event.bind(target, t, handler);
				});
			}
			
			var events = $lg(target).data('events') || {};
			
			if(!events[type] && $lg.is_function(handler)) {
				events[type] = [];
				
				if(events.eventTypes) {
					events.eventTypes.push(type);
				}
				else {
					events.eventTypes = [type];
				}
				
				try {
					if(target.attachEvent) {
						target.attachEvent('on' + type, $lg.event.listener);
					}
					else if(target.addEventListener) {
						target.addEventListener(type, $lg.event.listener);
					}
				}catch(e){};
				//try-catch block to prevent errors with custom events.
			}
			
			if($lg.is_function(handler)) {
				handler.uid = $lg.unique_id();
				events[type].push(handler);
			}
			
			$lg(target).data('events', events);		
		},
		
		listener : function(event) {
			if($lg.event.ignore !== event.target) {
				return $lg.event.trigger(event.target, event.type, event);
			}
		},
		
		trigger : function(target, type, event) {
			if(event && !event.target) {
				event.target = target;
			}
			event = $lg.event.eventObj(event || {target: target});	
			
			var propagation = []
			, events = null;
			
			//create a propagation path.
			do {
				events = $lg(target).data('events') || {};
				
				if(events[type]) {			
					propagation.push({target:target, handlers:events[type]});
				}
			}
			while(event.bubbles && (target = target.parentNode)) 
			
			if(propagation.length === 0) {
				return;
			}
			
			$lg.array_walk(propagation, function(data) {
				if( !event.isPropagationStopped() ) {
					var ret = true;
					
					//since we stop natural propagation, inline handlers won't fire. So do this manually too.
					if(data.target['on' + type]) { 
						ret = data.target['on' + type].call(data.target, event);
					}
					
					//call all the handlers of this target unless immProp is stopped.
					$lg.array_walk(data.handlers, function(fn) {
						if( !event.isImmediatePropagationStopped() && fn.call(data.target, event) === false) {
							ret = false;
						}
					});	
					
					if(ret === false) { //allow preventing default by returning false
						event.preventDefault();
					}
				}
			});
			
			//we must fire the actual dom event for manually fired funcs. Aka, for 'click', they haven't actually clicked. So we must click for em.
			if(event.custom && !event.isDefaultPrevented() && $lg.is_function(event.target[type])) {
				$lg.event.ignore = event.target;
				event.target[type](); 
				$lg.event.ignore = null;
			}
			
			//now we stop the native propagation, since we've done it ourselves.
			if(!event.isPropagationStopped()) {
				event.stopPropagation();
			}
		},
		
		remove : function(target, type, fn) {
			if(!target) return; //a target is needed at least.
			
			var events = $lg(target).data('events')
			, types
			, removeListener = false;
			
			if(events) {
				if(type && (types = events[type])) { //if a specific event type has been specified
					if(fn) {
						types = $lg.array_walk('f', types, function(f) {
							return f.uid !== fn.uid || f === fn;
						});
					}
					else {
						types = [];
					}
					
					events[type] = types;	
					
					if(types.length === 0) {
						removeListener = true;
						delete events[type];
					}
				}
				else if(!type) {
					events = {eventTypes: events.eventTypes};
					removeListener = true;
				}	
				
				if(removeListener) {
					var removeTypes = type ? [type] : events.eventTypes;
					
					
					$lg.array_walk(removeTypes, function(t) {
						try {
							if(target.detachEvent) {
								target.detachEvent('on' + t, $lg.event.listener);
							}
							else if(target.removeEventListener) {
								target.removeEventListener(t, $lg.event.listener);
							}
						}catch(e){}; 
						//try-catch block to prevent any errors with custom events.
					});
					
					events.eventTypes = $lg.array_walk('f', events.eventTypes, function(t) {
						return t in events;
					});
				}
				
				$lg(target).data('events', events);
			}
		}
	}
	
	lg.bind = lg.on = function(type, handler) {
		return this.all(function(elem) {
			$lg.event.bind(elem, type, handler);
		});
	};
	
	lg.fire = function(type, data) {
		if(type === 'hover') {
			return this.hover();
		}
		
		return this.all(function(elem) {
			$lg.event.trigger(elem, type, $lg.is_object(data) ? data : {});
		});
	};
	
	lg.removeEvent = function(type, fn) {
		return this.all(function(elem) {
			$lg.event.remove(elem, type, fn);
		});
	};
	
	//fixed mouseenter for cross-browser. One that doesn't fire when entering or leaving child element.
	lg.hover = function(enter, leave) {
		
		if( $lg.is_function(enter) ) {
			if('mouseenter' in document.body) {
				this.bind('mouseenter', enter)
			}
			else {
				this.mouseover(function(e) {
					if( e.custom || (e.fromElement && !$lg(e.fromElement.tagName.toLowerCase(), this).includes(e.fromElement)) ) {
						enter.call(this, e);
					}
				});
			}
		}
		
		if( $lg.is_function(leave) ) {
			if('mouseleave' in document.body) {
				return this.bind('mouseleave', leave)
			}
			else {
				this.mouseout(function(e) { 
					if( e.custom || (e.toElement && !$lg(e.toElement.tagName.toLowerCase(), e.target).includes(e.toElement)) ) {
						leave.call(this, e); 
					}
				});
			}
		}
		
		if(!enter && !leave) {
			this.fire('mouseenter' in document.body ? 'mouseenter' : 'mouseover');
		}
		
		return this;
	};

	$lg.array_walk(('close click dblclick mouseup mousedown mouseover mouseout mousemove contextmenu keydown keypress keyup load unload error resize scroll blur focus change submit select reset change').split(' '), function(name) {
		lg[name] = function(fn) {
			return $lg.is(fn, 'function') ? this.bind(name, fn) : this.fire(name, fn);
		}; 
	});	
	
	$lg.installed.event = 1;
	
})($lg, window);
