/* LG.js 
*  Core
*/

(function(undefined) {
	
	//init object
	var LG_object = function(item, context) {	
		var that = this
		, it = 0
		, elements = [];
		
		if( item.is_lg && item.nodes ) {
			elements = item.nodes;
		}
		
		//for strings, we have multiple options. But need DOM module.
		else if( $lg.is_string(item) ) {
			
			//if it looks and smells like a html string, it just might be...
			if( /<[^>]+>/.test(item) ) {
				elements = $lg.installed.dom 
							? $lg.frag( item.replace(/^\s+|\s+$/g, '') ).childNodes
							: [];
			}
			
			else if(/^[a-zA-Z1-6]+$/.test(item) && $lg.is_object(context) && !context.is_lg) {
				elements = $lg.installed.dom //need dom installed here to create element
							? [ $lg.elem(item, context) ]
							: [];
			}
			
			else if($lg.installed.selector) {
				elements = $lg.selector(item, context);
			}
		}
		
		if( $lg.is_array(item) ) {
			elements = item;
		}
		
		else if( $lg.is(item, 'nodelist') ) {
			elements = $lg.to_array(item);
		}
		
		else if( $lg.is_element(item) || $lg.is_document(item) || (item.window === item) ) {
			elements = [ item ];
		}	
		
		else if( $lg.is(item, 'documentfragment') ) {
			elements = item.childNodes;
		}
		
		//ensure only existing element nodes
		this.nodes = $lg.array_walk('f', elements, function(n) {
			
			if( n && ($lg.in_array([1, 9], n.nodeType) || (n.window === n)) ) {				
				that[ it++ ] = n;  //allow easy access to nodes.
				return true;
			}
			
			return false;
		});
		
		this.length = this.size = this.nodes.length;
		
		return this;
	};
	
	//access to object and main function.
	window.$lg = function(elements, context) { 
		return $lg.is_function(elements) 
				? $lg.domReady.add(elements)
				: new LG_object(elements, context);
	};
	
	//easy access variable.
	var lg = LG_object.prototype;
	lg.is_lg = true;
	
	//keep track of installed modules. Hopefully people won't spoof this... would be daft.
	$lg.installed = {
		core : 1
	};
	
	$lg.depend = function(modules) {
		modules = modules.split(' ');
		
		for(var i = 0, m; (m = modules[i++]); ) {
			
			if( !$lg.installed[m] ) {
				return false;
			}
			
		}
		
		return true;
	};
	
	//here we have an important function for multiple array uses... we use arrays a lot... 
	//MODE: f = filter, m = map, c = concat (fn returns array to concatenate), a = all (forEach), no mode is essentially forEach
	$lg.array_walk = function(mode, arr, fn) {
		if( $lg.is_array(mode) ) {
			fn = arr;
			arr = mode;
			mode = 'a';
		}
		
		var nativeMethod = {f: 'filter', m: 'map', a: 'forEach'}[mode]
		, i = 0
		, ret = []
		, l = arr.length;

		if(nativeMethod && arr[nativeMethod]) {
			return arr[nativeMethod].call(arr, fn);
		}

		for(; i < l; i++ ) {
			var elem = arr[i]
			, result = fn.call(arr, elem, i, arr);

			switch(mode) {
				case 'f' :
					if(result) {
						ret.push(elem);
					}
					break;
					
				case 'c' : 
					ret = ret.concat( $lg.to_array(result) );
					break;
					
				case 'm' :
					ret.push( result );
			}
		};

		return ret;
	};

	//Other sort of essential array functions		
	if(Array.prototype.indexOf) {
		$lg.array_index = function(haystack, needle) {
			return haystack.indexOf(needle);
		}
	}
	else {
		$lg.array_index = function(haystack, needle) {
			for(var i = 0, l = haystack.length; i < l; i++) {
				if(haystack[i] === needle) return i;
			}
			return -1;
		}
	}
	
	$lg.in_array = function(haystack, needle) {
		return $lg.array_index(haystack, needle) !== -1;
	};
	
	$lg.to_array = function(obj) {
		if( $lg.is_array(obj) ) {
			return obj;
		}
		
		try {
			return Array.prototype.slice.call( obj );
		}
		catch(e) {}
		
		return $lg.array_walk('m', obj, function(r) { 
			return r; 
		});
	};
	
	
	//Its essential to be able to tell what things are
	$lg.is = function(obj, test) {
		//creative method from Angus Croll at http://javascriptweblog.wordpress.com/
		var type = ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
		
		return test 
				? (test === type) 
				: type;
	};
	
	('function array object string number regexp').replace(/\w+/g, function(f) {
		$lg['is_' + f] = function(obj) { 
			return $lg.is(obj, f) 
		};
	});
	
	$lg.is_element = function(obj) {
		return obj.tagName && $lg.is(obj).indexOf('element') > 0;
	};
	
	$lg.is_document = function(obj) {
		return obj.nodeType && obj.nodeType === 9;
	};
	
	
	//Things we need for affecting the set.

	//This used to be used internally to update the objects nodes, however now it just initiates a new object.
	lg.update = function(nodes) {
		return new LG_object(nodes || this.nodes);
	};
	
	lg.all = function(fn) { //perform fn to all nodes.
		$lg.array_walk(this.nodes, fn);
		return this;
	};
	
	lg.index = function(i) {
		if( $lg.is_number(i) ) {
			return this.update( this[i] );
		}
		return this;
	};
	
	lg.get = function(i) {
		if( $lg.is_string(i) ) {
			return i === 'last' 
				? this[ this.length - 1 ] 
				: this[0];
		}
		else if( $lg.is_number(i) ) {
			return this[ i ];
		}
		return this.nodes;
	};
	
	//add new nodes into the stack. new nodes are added in order to the end of the array.
	lg.add = function(new_nodes, context) {
		var add_nodes = $lg(new_nodes, context).nodes
		, first_nodes = this.nodes;
		
		if( $lg.is_array(add_nodes) ) {
			$lg.array_walk(add_nodes, function(e) {
				first_nodes.push(e);
			});
		}
		
		return this.update( first_nodes );
	};
	
	// remove nodes from the list either by index of selector
	lg.lose = function(option) {
		if( $lg.is_number(option) ) {
			
			return this.filter(function(e, i) {
				return (i !== option);
			});
			
		}
		
		if($lg.is_string(option) && $lg.depend('dom selector')) {
			
			var nodes = $lg(option, this.parent());
			
			return this.filter(function(el) {
				return !$lg.in_array(nodes, el);
			});
		}
		
		return this;
	};
	
	//keep only nodes matching the filter
	lg.filter = function(fn) {
		if( $lg.is_string(fn) && $lg.installed.selector ) {
			
			var nodes = $lg(fn).nodes;
			
			fn = function(el) {
				return $lg.in_array(nodes, el);
			};
			
		}
		
		if( $lg.is_function(fn) ) {		
			return this.update( 
						$lg.array_walk('f', this.nodes, fn) 
					);
		}
		
		return this;
	};
	
	$lg.domReady = {
		callbacks : [],
		loaded : false,
		
		listen : function() {
			if (document.addEventListener) { 
				document.addEventListener("DOMContentLoaded", $lg.domReady.run, false); //the browsers that play nice.
			}
			else if(document.readyState) { 
				var timer = setInterval(function() { 
					if(/loaded|complete/.test(document.readyState)) {
						clearInterval( timer );
						$lg.domReady.run(); 			
					}
				}, 50);
			}
			else {
				document.onload 
					? document.onload = $lg.domReady.run 
					: window.onload = $lg.domReady.run;
			}
		},
		
		run : function(forceRun) {
			if(!forceRun && this.loaded) return;
			
			$lg.array_walk($lg.domReady.callbacks, function(fn) {	
				fn.call(this, document, $lg);	
			});
			
			this.loaded = true;
			
			if(document.removeEventListener) {
				document.removeEventListener('DOMContentLoaded', $lg.domReady.run, false);
			}
		},
		
		add : function(fn) {
			if( $lg.domReady.callbacks.push( fn ) == 1 ) $lg.domReady.listen();
		}
	};
	
	$lg.isDomLoaded = function() {
		return $lg.domReady.loaded;
	};
	
	lg.data = function(data, value) {
		if($lg.is(value, 'undefined')) {
			return (this[0] && this[0][$lg.expando]) ? this[0][$lg.expando][data] : null;
		}
		return this.all(function(n) {
			if(!n[$lg.expando]) n[$lg.expando] = {};
			n[$lg.expando][data] = value;
		});
	};
	
	$lg.unique_id = (function() {
		var uid = 1;
		return function() {
			return 'LGunique_' + uid++;
		}
	})();
	
	//cookies
	$lg.cookie = function(name, value, permanent) {
		if( $lg.is(value, 'undefined') ) {
			var cpos = document.cookie.indexOf( name + '=' );
			if(cpos == -1) return null;
			var cstart = cpos + name.length + 1
			, cend = document.cookie.indexOf(';', cstart);
			return unescape( document.cookie.substring(cstart, cend > 0 ? cend : document.cookie.length) )
		}
		else {
			document.cookie = name + '=' + escape( value ) + '; path=/;' + (permanent ? ' expires=Wed, 1 Jan 2030 00:00:00 GMT' : '');
		}
	};
	
	$lg.selection = function() {
		if (window.getSelection) {  // all browsers, except IE before version 9
			var e = document.activeElement;
			if (e && e.tagName.toLowerCase() in {textarea:1, input:1}) { 
                return e.value.substring(e.selectionStart, e.selectionEnd);
			}
			else {
				return window.getSelection().toString();
			}
		}
		else if(document.selection.createRange) { // Internet Explorer
			return (document.selection.createRange()).text || '';
		}
		return '';
	};
	
	if(!$lg.expando) {
		$lg.expando = 'LGdata_' + $lg.unique_id() + '_' + (new Date()).getMilliseconds();
	}
	
	//ensure dom-ready is listening.
	$lg(function(){});
	
	//expose prototype for modifying
	$lg.proto = lg;
	
})();

