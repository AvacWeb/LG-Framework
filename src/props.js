/* LG.js
*  Prop & Attr
* Dependent: core
*/

(function($lg) {
	
	if(!$lg) {
		return;
	}
	
	var lg = $lg.proto;
	
	lg.prop = function(prop, value) {
		
		if( $lg.is_string(prop) ) {
			if( $lg.is(value, 'undefined') ) {
				
				var e = this[0];
				
				if(e && e.nodeName.toLowerCase() === 'select' && prop === 'value') { //if its a select element... 
					if(e.multiple) {
						
						return $lg.array_walk('c', e, function(opt) {
							return opt.selected 
									? [opt.value] 
									: [];
						});
						
					}
					else {
						return e.value || e.options[ e.selectedIndex ].value;
					}
				}
				
				if(e) {
					return prop in e 
							? e[prop]
							: $lg(e).attr(prop); //fall back to attr;
				}
				
				return null;	
					
			}
			else {
				
				if(prop === 'style') {
					if($lg.installed.css) {
						return this.css(value);
					}
					
					prop = '';
					
					for(var val in value) {
						prop += val + ':' + value[val] + ';';
					}
					
					value = prop;
					prop = 'cssText';
				}
				
				return this.all(function(e) { 
					(prop === 'cssText' ? e.style : e)[prop] = value ;
				});
				
			}
		}
		else if( $lg.is_object(prop) ) {
	
			for(var i in prop) {
				this.prop(i, prop[i]);
			}
		}
		
		return this;
	};
	
	$lg.array_walk(('src href title id type name value').split(' '), function(prop) {
		lg[prop] = function(value) { 
			return this.prop(prop, value) 
		};
	});
	
	
	lg.attr = function(name, value) {
		if($lg.is_object(name)) {
			
			for(var attr in name) {
				this.attr(attr, name[attr]);
			}
		}
		
		else if($lg.is_string(name)) {
			
			if($lg.is(value, 'undefined')) {
				
				var e = this[0];
				
				return e && e.getAttribute 
						? e.getAttribute(name) 
						: e && e.attributes 
							? e.attributes.getNamedItem(name) 
							: null;	
							
			}
			else {
				this.all(function(e) {
					e.setAttribute(name, value);
				});
			}
		}
		
		return this;
	};
	
	lg.removeAttr = function(name) {
		return this.all(function(e) {
			e.removeAttribute(name);
		});
	};
	
	lg.addClass = function(cn) {
		return this.all(function(e) { 
			e.className ? (e.className += ' ' + cn) : e.className = cn 
		});
	};
	
	lg.removeClass = function(cn) {
		if( $lg.is_string(cn) ) {
			
			var reg = RegExp('\\b' + cn + '\\b', 'g'); //global mod incase the same classname is set twice. class="class1 class2 class2"
			
			return this.all(function(e) {
				e.className = e.className.replace(reg, '') 
			});
			
		}
		else {
			return this.prop('className', '');
		}
	};
	
	$lg.installed.attr = 1;
	$lg.installed.props = 1;
	
})($lg);
