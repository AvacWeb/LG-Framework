/* LG.js
*  CSS
* Dependant: core
*/

(function($lg) {

	if(!$lg) {
		return;
	}
	
	var lg = $lg.proto;
	
	lg.css = function(prop, value) {
		
		if( $lg.is_string(prop) ) {
			if( $lg.is(value, 'undefined') ) {
				
				var e = this[0];
				
				if(e) { 
					//prioritize inline styles.
					if(e.style && e.style[prop]) {
						 return e.style[prop];
					}
					 
					if(window.getComputedStyle) {
						return e.ownerDocument.defaultView.getComputedStyle(e, null).getPropertyValue(prop);
					}
					
					if(e.computedStyle) {
						return e.computedStyle[prop];
					}
					
					if(e.currentStyle) {
						return e.currentStyle[prop];
					}
				}
				
				return null;
			}
			else {
				
				return this.all(function(e) { 
					e.style[prop] = value ;
				});
				
			}
		}
		else if( $lg.is_object(prop) ) {
			for(var i in prop) {
				this.css(i, prop[i]);
			}
		}
		
		return this;
	};
	
	//Add some other basic CSS things in. 
	$lg.array_walk(('width height display position minHeight minWidth maxHeight maxWidth visibility').split(' '), function(name) { 
		lg[name] = function(value) { 
			return this.css(name, value) 
		};
	});
	
	lg.hide = function() {
		return this.css('display', 'none');
	};
	
	lg.show = function() {

		//set empty display, to give default display state back. 
		return this.css('display', '').all(function(e) {
			
			//check if they are still hidden, aka from a stylesheet. We'll need to override.
			if($lg(e).display() === 'none') {
				
				//here we create a dummy element, to find the default display type 
				var temp = $lg('<' + e.tagName + '>').appendTo('body')
				, display = temp.display();
				
				$lg(e).display(display);
				temp.remove();
			}
			
		});
	};

	lg.toggle = function() {
		return this.all(function(e) {
			e = $lg(e);
			e.display() !== 'none' ? e.hide() : e.show();
		});
	};
	
	//neat little function to center something, either within the parent or screen
	lg.center = function(fix, axis) {
		
		if( $lg.is_string(fix) ) {
			axis = fix;
			fix = false;
		}
		
		return this.all(function(e) {
			e = $lg(e).position( fix ? 'fixed' : 'absolute' ); //set a position which allows it to move more freely.
			
			var offsets = e.offsets()
			, propObject = {};
			
			//option to only center elem on x-axis
			if(!axis || axis === 'left' || axis === 'x') {
				propObject.marginLeft = '-' + (offsets.width * 0.5) + 'px';
				propObject.left = '50%';
			}
			
			if(!axis || axis === 'top' || axis === 'y') {
				propObject.marginTop = '-' + (offsets.height * 0.5) + 'px';
				propObject.top = '50%';
			}
			
			e.css(propObject);
		});
		
	};
	
	$lg.installed.css = 1;

})($lg);
