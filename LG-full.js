/* LG-JS-Frame
 * Framework for easy site building.
 * Released under MIT License.
*/

(function(window, undefined) {
	
	//the init object
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
		core : 1,
		dom : 1,
		attr : 1,
		props : 1,
		css : 1,
		ajax : 1,
		anim : 1,
		event : 1,
		selector : 1
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
	
//SELECTOR 
//find more nodes via selector using the current nodes as the context.
	lg.find = function(selector) {
		if( $lg.is_string(selector) ) {
			return this.update( $lg.selector(selector, this.nodes) );
		}
		
		return this;
	};
	
	//returns boolean, whether the current set contains anything matching the item given.
	lg.includes = function(elem) {
		if($lg.is_string(elem)) {
			elem = $lg.selector(elem)[0];
		}
		
		return $lg.in_array(this.nodes, elem);
	};
	
	/* SELECTOR ENGINE */
	/* Modified version of Avac-Selector-Engine: https://github.com/AvacWeb/Avac-Selector-Engine */
	
	//split the selector into a manageable array. 
	function selectorSplit(selector) {
		var chunky = /(?:#[\w\d_-]+)|(?:\.[\w\d_-]+)|(?:\[(\w+(?:-\w+)?)(?:([\$\*\^!\|~\/]?=)(.+?))?\])|(?:[\>\+~])|\w+|\s|(?::[\w-]+(?:\([^\)]+\))?)/g;
		return selector.match( chunky ) || [];
	};
	
	//identify a chunk. Is it a class/id/tag etc?
	function identify(chunk) {
		for(var type in $lg.selector.regex) {
			if ( $lg.selector.regex[type].test(chunk) ) return type;
		}
		
		return false;
	};
	
	//just to prevent rewriting over and over...
	function all(elem) {
		return elem.all ? elem.all : elem.getElementsByTagName('*');
	};
	
	$lg.selector = function(selector, context) {	
		if(!selector || $lg.selector.regex.space.test(selector) || !selector.charAt) return [];
		selector = selector.replace(/^\s+|\s+$/, '').replace(/\s?([\+~\>])\s?/g, ' $1');
		
		var shortcut = /.*(?!(?:\(|\[).*#.+(?:\)|\]))(?:[\w\d]+|\s)#([\w\d_-]+).*/g
		, i = 0
		, pieceStore = []
		, nodes = context ? context : [document]
		, chunks;
		
		if( !$lg.is_array(nodes) ) {
			nodes = $lg(nodes).nodes;
		}
		
		/* OPTIONAL SHORTCUT:
		 * ID's are quick to find. If a selector contains an ID we jump to it. 
		 * Aka 'div .content #foo .bar' becomes '#foo .bar' to speed things up.
		 * This may give incorrect results if #foo is not within .content
		 * But the option is here if its safe for use in your case.
		*/
		//if( shortuct.test(selector) ) {
		//	nodes = [ document.getElementById( selector.replace(shortcut, '$1') ) ];
		//	selector = selector.substr( shortcut.lastIndex );
		//}

		//QSA support. This is put inside the main func so as to keep the multi-context, and above shortcut supported.
		if(document.querySelectorAll) {
			try {
				return $lg.array_walk('c', nodes, function(e) {
					return $lg.to_array( e.querySelectorAll(selector) );
				});
			} 
			catch(e){}; //catch bad selectors. (Avac supports things QSA doesn't)
		}
		
		//create an array with all the diff parts of the selector
		chunks = $lg.array_walk('m', selectorSplit(selector), function(sel) {
			return {
				text: sel, 
				type: identify(sel)
			};
		});

		for(var l = chunks.length; i < l; i++) {
			
			if(nodes.length === 0 || chunks.length === 0) return []; //no point carrying on if we run out of nodes.

			var piece = chunks[i];

			if(!piece.type) throw new Error('Invalid Selector: ' + piece.text);

			if(piece.type !== 'space' && chunks[ i + 1 ]) {  
				pieceStore.push( piece ); 
				//We push all non-descendant selectors into piece store until we hit a space in the selector.
			}
			else {
				if(piece.type !== 'space' && piece.type !== 'changer') {
					pieceStore.push( piece );
				}

				//now we begin. Grab the first piece, as the starting point, then perform the filters on the nodes.
				var piece1 = pieceStore.shift()
				, j = 0
				, k = pieceStore.length;

				nodes = $lg.array_walk('c', nodes, function(elem) {
					return elem ?
							$lg.selector.getters[ piece1.type ](elem, piece1.text)
							: [];
				});
				
				//now perform filters on the nodes.
				for(; j < k; j++ ) {

					//a 'changer' changes the nodes completely, rather than adding to them.
					if(pieceStore[j].type === 'changer') {
						var info = $lg.selector.regex.changer.exec(pieceStore[j].text);
						nodes = $lg.selector.changers[ info[1] ](nodes, parseInt(info[2])); //sooo ugly.
						continue;
					}

					nodes = array_walk('f', nodes, function(elem) {
						return elem ? 
								$lg.selector.filters[ pieceStore[j].type ](elem, pieceStore[j].text)
								: false;
					});
				}
				
				if(piece.type == 'changer') {
					var info = $lg.selector.regex.changer.exec(piece.text);
					nodes = $lg.selector.changers[ info[1] ](nodes, parseInt(info[2]));
				};
				
				pieceStore = [];
			}
		}
		
		return nodes;
	};
	
	$lg.selector.regex = {
		'id': /^#[\w\d-]+$/,
		'Class': /^\.[\w\d-]+$/,
		'tag': /^\w+$/,
		'rel': /^\>|\+|~$/,
		'attr': /^\[(\w+(?:-\w+)?)(?:([\$\*\^!\|~\/]?=)(.+?))?\]$/,  
		'changer': /^:(eq|gt|lt|first|last|odd|even|nth)(?:\((\d+)\))?$/,
		'pseudo' : /^:([\w\-]+)(?:\((.+?)\))?$/,
		'space' : /^\s+$/
	};
	
	$lg.selector.getters = { 
		'id' : function(elem, sel) {
			sel = sel.replace('#', '');
			return elem.getElementById 
					? [ elem.getElementById(sel) ]
					: $lg.array_walk('f', all(elem), function(e) {
						return $lg.selector.filters.id(e, sel);
					});
		},
		
		'Class' : function(elem, sel) {
			sel = sel.replace('.', '');
			return elem.getElementsByClassName
					? $lg.to_array( elem.getElementsByClassName(sel) )
					: $lg.array_walk('f', all(elem), function(e) {
						return $lg.selector.filters.Class(e, sel);
					});
		},
		
		'tag': function(elem, sel) {
			return $lg.to_array( elem.getElementsByTagName(sel) );
		},	
		
		'attr': function(elem, sel) {
			return $lg.array_walk('f', all(elem), function(e) {
				return $lg.selector.filters.attr(e, sel);
			});
		},
		
		'rel' : function(elem, sel) {
			switch(sel) {
				case '+' : 
					if($lg.installed.dom) {
						return $lg(elem).next().get();
					}
					
					var next = elem.nextElementSibling || elem.nextSibling;
					while(next && next.nodeType !== 1) {
						next = next.nextSibling;
					}
					return [next];

				case '>' :
					return $lg.array_walk('f', elem.childNodes, function(e) {
						return e.nodeType === 1;
					});
					
				case '~' :
					if(elem.parentNode) {
						var children = $lg(elem.parentNode.childNodes).nodes;
						
						return $lg.array_walk('f', children, function(e) {
							return $lg.selector.filters.rel(e, '~', elem);
						});
					}
					
					return [];
			}
		},
		
		'pseudo': function(elem, sel) {
			return $lg.array_walk('f', all(elem), function(e) {
				return $lg.selector.filters.pseudo(e, sel);
			});
		}
	};
		
	$lg.selector.filters = {
		'id' : function(elem, sel) {
			return (elem.id && elem.id === sel.replace('#', ''));
		},	
		
		'Class' : function(elem, sel) {
			return (elem.className && (RegExp('(^|\\s)' + sel.replace('.', '') + '(\\s|$)')).test( elem.className ));
		},	
		
		'tag' : function(elem, sel) {
			return (elem.tagName && elem.tagName.toLowerCase() === sel.toLowerCase());
		},
		
		'attr' : function(elem, sel) {  
			var info = $lg.selector.regex.attr.exec(sel)
			, attr = elem.getAttribute ? elem.getAttribute(info[1]) : elem.attributes.getNamedItem(info[1]);

			if( !info[2] || !attr ) {
				return !!attr;
			}

			if(info[2] && info[3]) {
				var value = info[3].replace(/^['"]|['"]$/g, '');

				switch(info[2]) {
					case '==':
					case '=':
						return (attr === value)
					case '^=':
					case '|=':
						return (attr.indexOf(value) === 0);
					case '$=':
						return attr.indexOf(value) === attr.length - value.length; //avoid using a regex, as would need to escape the string. Pointless.
					case '*=':
						return (attr.indexOf(value) != -1)
					case '~=':
						return attr.match(RegExp('\\b' + value + '\\b'));
					case '!=':
						return (attr != value);
					case '/=':
						var modifiers = value.match(/\s(\w+)$/) || ['', ''];
						value = value.replace(/\\/g, '\\\\').replace(modifiers[0], '');
						return RegExp(value, modifiers[1]).test(attr);
				}
			}
			return false;
		},	
		
		'rel' : function(elem, sel, relElem) {
			switch(sel) {
				case '+' : 
					if($lg.installed.dom) {
						return $lg(elem).previous()[0] === relElem;
					}
					
					var prev = elem.previousElementSibling || elem.previousSibling;
					while(prev && prev.nodeType != 1) {
						prev = prev.previousSibling;
					}
					
					return prev === relElem;
					
				case '~' :
					return elem !== relElem && elem.parentNode === relElem.parentNode;
					
				case '>' :
					return elem.parentNode === relElem;
			};
			return false;
		},	
			
		'pseudo' : function(elem, sel) {
			var pseudo = sel.replace($lg.selector.regex.pseudo, '$1')
			, info = sel.replace($lg.selector.regex.pseudo, '$2')
			return $lg.selector.pseudo_filter[pseudo](elem, info);
		}
	};
		
	$lg.selector.pseudo_filter = {
		'first-child' : function(elem, sel) { 
			while(elem = elem.previousSibling) {
				if(elem.nodeType == 1) return false;
			}
			return true;
		},
		'last-child' : function(elem, sel) {
			while(elem = elem.nextSibling) {
				if(elem.nodeType == 1) return false;
			}
			return true;
		},
		
		'hidden' : function(elem, sel) { 
			if($lg.installed.css) {
				return ($lg(elem).display() === "none") || ($lg(elem).visibility() === 'hidden')
			}
			
			if(elem.style) {
				if(elem.style.display === 'none' || elem.style.visibility === 'hidden') {
					return true;
				}
			}
			
			return elem.type === 'hidden';
		},
		'contains' : function(elem, sel) { 
			var text = $lg.installed.dom 
						? $lg(elem).text()
						: (elem.textContent || elem.innerText || elem.innerHTML.replace(/<.*?>/g, ''));
						
			return (text.indexOf(sel) != -1)
		},
		
		'notcontains' : function(elem, sel) { return !this.contains(elem, sel) },
		'only-child' : function(elem, sel) { return ( this['first-child'](elem) && this['last-child'](elem) ) },
		'empty' : function(elem, sel) { return !elem.hasChildNodes() },
		'not' : function(elem, sel) { return !$lg.in_array($lg.selector(sel), elem) },
		'has' : function(elem, sel) { return $lg.selector(sel, elem).length > 0 },
		'nothas' : function(elem, sel) { return !this.has(elem, sel) },
		'selected' : function(elem, sel) { return elem.selected; },
		'visible' : function(elem, sel) { return !this.hidden(elem) },
		'input' : function(elem, sel) { return (/input|select|textarea|button/i).test( elem.nodeName ) },
		'enabled' : function(elem, sel) { return !elem.disabled },
		'disabled' : function(elem, sel) { return elem.disabled },
		'checkbox' : function(elem, sel) { return elem.type === 'checkbox' },
		'text' : function(elem, sel) { return elem.type === 'text' },
		'header' : function(elem, sel) { return (/h\d/i).test( elem.nodeName ) },
		'radio' : function(elem, sel) { return elem.type === 'radio' },
		'checked' : function(elem, sel) { return elem.checked }
	};
	
	function ofType(arr, start, increment) {
		var i = start, ret = [], e;
		while( e = arr[i] ) {
			ret.push( e );
			i += increment;
		}
		return ret;
	};

	//allow extending of pseudos.
	$lg.add_pseudo = function(name, fn) {
		$lg.selector.pseudo_filters[name] = fn;
	};
		
	$lg.selector.changers = {
		'eq' : function(arr, digit) { return arr[digit] ? [ arr[digit] ] : []; },
		'gt' : function(arr, digit) { return arr.slice(digit) },
		'lt' : function(arr, digit) { return arr.slice(0, digit) },
		'first' : function(arr, digit) { return [ arr[0] ] },
		'last' : function(arr, digit) { return [ arr[arr.length-1] ] },
		'odd' : function(arr, digit) { return ofType(arr, 0, 2); },
		'even' : function(arr, digit) { return ofType(arr, 1, 2); },
		'nth' : function(arr, digit) { return ofType(arr, digit - 1, digit); }
	};
	
	
//DOM
//some important dom utilities first.
	
	//create an elem and specify its properties in an object.
	$lg.elem = function(tag, props) {
		var elem = document.createElement(tag);
		
		if( $lg.is_object(props) ) {
			if($lg.installed.props) {
				return $lg(elem).prop(props)[0];
			}
		
			for(var p in props) {
				elem[ p ] = props[ p ];
			}
		}
		
		return elem;
	};

	//create a document fragment from a string
	$lg.frag = function(item) {
		var frag = document.createDocumentFragment();
		
		if( $lg.is_string(item) ) {
			var cur
			, div = $lg.elem('div', {innerHTML : item});
			
			while(cur = div.firstChild) {
				frag.appendChild(cur);
			}
		}
		else {
			$lg(item).all(function(n) {
				frag.appendChild(n);
			});
		}
		
		return frag;
	};
	
	lg.html = lg.inner = function(markup) {		
		if( $lg.is(markup, 'undefined') ) {
			return this[0] && this[0].innerHTML;
		}
		
		//empty first to remove event listeners. prevent memory leaks
		this.empty().all(function(e) {
			e.innerHTML = markup;
		});
		
		return this;
	};

	//hard to explain, but ensures only working with element nodes. 
	lg.relation = function(relation, direction) {
		var nativeProp = relation.split(/(?=[A-Z])/).join('Element'); //nextSibling -> nextElementSibling, previousSibling -> previousElementSibling etc..
		if(!direction) direction = relation;
		
		return this.update(
			$lg.array_walk('m', this.nodes, function(elem) {
				if( elem[nativeProp] ) return elem[nativeProp]; 	
				elem = elem[relation];	
				while(elem && elem.nodeType !== 1) elem = elem[direction];
				return elem || null;
			})
		);
	};
	
	//thanks to our function above these next functions are made real easy.
	lg.parent = function() {
		return this.relation('parentNode', 0);
	};
	
	lg.last = function() {
		return this.relation('lastChild', 'previousSibling');
	};
	
	lg.first = function() {
		return this.relation('firstChild', 'nextSibling');
	};
	
	lg.next = function() {
		return this.relation('nextSibling', 0);
	};
	
	lg.previous = function() {
		return this.relation('previousSibling', 0);
	};
	
	//if selector module is installed a selector to filter children by can be specified.
	lg.children = function(selector) {
		var children = $lg.array_walk('c', this.nodes, function(e) {
			return $lg.to_array(e.childNodes);
		});
		
		children = $lg(children); //this fixes it and gets rid of non-element nodes.
		
		return $lg.is_string(selector) ? children.filter(selector) : children;
	};
	
	lg.append = function(markup) {
		if( !$lg.is_string(markup) ) {
			markup = $lg.frag(markup);
		}
		
		return this.all(function(e) {
			//if its a string, we must frag it every time in order to append to all the nodes.
			//Otherwise the first created frag will just keep getting appended to each node
			e.appendChild( $lg.is_string(markup) ? $lg.frag(markup) : markup );
		});
	};
	
	lg.prepend = function(markup) {
		if( !$lg.is_string(markup) ) {
			markup = $lg.frag(markup);
		}
		
		return this.all(function(e) {
			var x = $lg.is_string(markup) ? $lg.frag(markup) : markup;
			e.firstChild ? e.insertBefore(x, e.firstChild) : e.appendChild(x);
		});
	};
	
	lg.before = function(markup) {
		if( !$lg.is_string(markup) ) {
			markup = $lg.frag(markup);
		}
		
		return this.all(function(e) {
			e.parentNode.insertBefore($lg.is_string(markup) ? $lg.frag(markup) : markup, e);
		});
	};
	
	lg.after = function(markup) {
		if( !$lg.is_string(markup) ) {
			markup = $lg.frag(markup);
		}
		
		return this.all(function(e) {
			var p = e.parentNode, x = $lg.is_string(markup) ? $lg.frag(markup) : markup;
			e.nextSibling ? p.insertBefore(x, e.nextSibling) : p.appendChild(x);
		});
	};
	
	lg.move = function(action, element) {
		element = $lg(element);
		
		if( !$lg.in_array(['after', 'before', 'prepend', 'append', 'replace'], action) ) {
			return;
		}
		
		element[action](this.nodes);
		
		return this;
	};
	
	lg.prependTo = function(element) {
		return this.move('prepend', element);
	};
	
	lg.appendTo = function(element) {
		return this.move('append', element);
	};
	
	lg.remove = function() {
		//before removing, we should remove any event listeners.
		if($lg.installed.event) {
			this.removeEvent();
		}
		
		this.empty().all(function(e) {
			if(e.parentNode) e.parentNode.removeChild(e);
		});
		
		return this.update([]);
	};
	
	lg.empty = function() {
		return this.all(function(e) {
			if(e.hasChildNodes()) {
				$lg(e.childNodes).remove(); //since this would only remove elements and not text nodes we must empty via innerhtml too.
				e.innerHTML = ''; 
			}
		});
	};

	//swap all elements for another or markup
	lg.replace = function(markup) {
		return this.before(markup).remove();
	};
	
	lg.text = function() {
		var text = '';
		this.all(function(e) {
			text += e.textContent || e.innerText || e.text || e.innerHTML.replace(/<.*?>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
		});
		return text;
	};
	
	lg.offsets = function(prop) {
		var elem = this[0]; 
		
		if(elem) {
			var offsets = {left : elem.offsetLeft, top : elem.offsetTop, width : elem.offsetWidth,	height : elem.offsetHeight};
			return prop ? offsets[prop] : offsets;
		}
		
		return null;
	};

	if(!lg.includes) {
		lg.includes = function(elem) {
			return $lg.in_array(this.nodes, elem);
		};	
	}
	
//PROPS/ATTR
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
	
//CSS

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
	
// AJAX - Modified form of Avax mini lib for handling AJAX

	$lg.ajax = {
		responseCache: {},
		currentUrl : window.location.protocol + '//' + window.location.hostname,
		config : {
			type: 'GET',
			async : true,
			headers : {
				//header name : header value
			},
			params : {
				//param key : param value;  - these params will be sent with every request.
			},
			oncomplete : function(response, xhr){},
			onstatechange : function(state, xhr){},
			onfailure : function(status, xhr) {},
			response : 'responseText',
			cache : false
		}
	};
	
	$lg.ajax.XHR = window.XMLHttpRequest 
					? function() { return new XMLHttpRequest() } 
					: function() { return new ActiveXObject('Microsoft.XMLHTTP') };

	$lg.ajax.XHR2 = function() {
		var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) return xhr;
		if (typeof XDomainRequest != "undefined") return new XDomainRequest();
		return null;
	};

	//turns object into query string.
	$lg.ajax.params = function(obj) {
		if( $lg.is_array(obj) ) {
			if( obj.join ) {
				return obj.join;
			}
			
			var q = '';
			$lg.array_walk(obj, function(pair) {
				q += '&' + pair;
			});
			
			return q.substr(1); //remove 1st &
		}
		
		if( $lg.is_string(obj) ) {
			return obj.replace(/^\?/, '');
		}
		else if( $lg.is_object(obj) )  {
			var params = [];
			
			for(var i in obj) {
				params.push( i + '=' + encodeURIComponent(obj[i]) );
			}
			
			return this.params(params);
		}
		
		return '';
	};

	//cache response, key based on url and params. 
	$lg.ajax.cache = function(url, params, data) {
		
		//create a key from the url and query string.
		var key = url + '-' + params;
		
		if(data) {
			this.responseCache[key] = data;
		}
		
		return this.responseCache[key];
	};

	//test if the url is a local URL not external (needing XHR2)
	//local formats: ../file /file ./ file http://domain/file
	$lg.localUrl = function(url) {
		switch(url.charAt(0)) {
			case '.' :
			case '/' :
				return true;
				
			default :
				return !(/^https?:/).test(url.replace($lg.ajax.currentUrl, ''));
		}
	};
	
	//merge object 2 (default) properties into object 1 (user supplied). Object 1's values taking precedence.
	$lg.ajax.mergeObj = function(obj1, obj2) {
		for(var i in obj2) {
			if( !(i in obj1) ) obj1[ i ] = obj2[ i ];
		}
		return obj1;
	};
	
	$lg.ajax.setHeader = function(name, value) {
		$lg.ajax.config.headers[name] = value;
	};

	$lg.ajax.request = function(obj) {
		if( !$lg.is_object(obj) || !obj.url ) return;
		
		var a = $lg.ajax
		, config = a.config
		, headers = obj.headers && $lg.is_object(obj.headers) 
						? a.mergeObj(obj.headers, config.headers) 
						: config.headers
		, obj = a.mergeObj(obj, config) //merge default values into the object
		, params = obj.params
		, defaultParams = config.params;
		
		//deal with parameters.
		if(params) {
			if( $lg.is_string(params) ) {
				params += '&' + a.params(defaultParams); //concat the default parameters
			}
			else {
				params = a.params( a.mergeObj(params, defaultParams) );
			}
		}
		else {
			params = a.params( defaultParams );
		}
		
		//if obj.cache is set, then check for a cached copy of this request.
		var cached = obj.cache 
						? a.cache(obj.url, params) 
						: null;
		
		if(cached) {
			return obj.oncomplete.call(xhr, cached, xhr); //fire oncomplete event with cached response.
		}
		
		//no cache, so create our request.
		var xhr = $lg.localUrl(obj.url) 
					? $lg.ajax.XHR() 
					: $lg.ajax.XHR2();
					
		if(!xhr) {
			return null;
		}
		
		obj.type = obj.type.toUpperCase();
		
		if(obj.type === 'GET') {
			obj.url += (obj.url.indexOf('?') !== -1 ? '&' : '?') + params; //add params to URL for get requests.
		}
		
		xhr.open(obj.type, obj.url, obj.async);

		//set all request headers. Default headers have already been merged above.
		for(var i in headers) {
			xhr.setRequestHeader(i, headers[i]);
		}
		
		var finish = function() {
			if(obj.cache) {
				a.cache(obj.url, data, xhr[obj.response]);
			}
			
			obj.oncomplete.call(xhr, xhr[obj.response], xhr);
		};
		
		if(obj.async) {
			if(xhr.onload) {
				xhr.onload = finish;
				xhr.onerror = function() {
					obj.onfailure.call(xhr, xhr.status, xhr);	
				};
			}
			else {
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if(xhr.status === 200) {
							finish();
						}
						else {
							obj.onfailure.call(xhr, xhr.status, xhr);
						}
					}
					else {
						obj.onstatechange.call(xhr, xhr.readyState, xhr);
					}
				};
			}
		}
		
		xhr.send( params );
		
		if(!obj.async) {
			finish();
		}
		
		return xhr;
	};

	$lg.get = function(url, callback) {
		var obj = {url: url}
		
		if( $lg.is_function(callback) ) {
			obj.oncomplete = callback;
		}
		
		return $lg.ajax.request(obj);
	};

	//make a post request.
	$lg.post = function(url, data, callback) {
		var obj = {
			type : 'POST',
			url : url,
			params : data,
			headers : {'Content-type' : 'application/x-www-form-urlencoded'}
		};
		
		if( $lg.is_function(callback) ) {
			obj.oncomplete = callback;
		}
		
		return $lg.ajax.request(obj);
	};

	$lg.serialize = function(form) {
		if(!$lg.depend('selector props')) {
			return '';
		}
		
		var params = []
		, elems = $lg(':input', form).lose('button'); 
		
		elems.all(function(elem) {
			elem = $lg(elem);
			
			var name = elem.name()
			, value = elem.value()
			, type = elem.type()
			, tag = elem.prop('tagName').toLowerCase();
			
			if(!name || name === "null" || !value || !type) return;
			
			if(tag === 'input' || tag === 'textarea') {
				
				if( $lg.in_array(['button', 'submit', 'reset'], type) ) {
					return; // dont include these.
				}
				
				if(type === 'checkbox' || type === 'radio') {
					if(elem.prop('checked')) {
						params.push( name + '=' + encodeURIComponent(value) );
					}
				}
				else {
					params.push( name + '=' + encodeURIComponent(value) );
				}
				
			}
			else if(tag === 'select') {
				if( $lg.is_array(value) ) { //multiple select
					params.push( name + '=' + value.join('&' + name + '=') );
				}
				else {
					params.push( name + '=' + encodeURIComponent(value) );
				}
			}
		});
		
		return params.join('&');
	};

	$lg.ajax.sendForm = function(form, callback, extraData) {
		if(!$lg.depend('selector props') || form.tagName.toLowerCase() !== 'form') {
			return '';
		}
		
		form = $lg(form);
		
		var url = form.attr('action') || $lg.ajax.currentUrl
		, method = form.attr('method') 
				? form.attr('method').toUpperCase() 
				: 'GET'
		, data = form.serialize() + (extraData ? '&' + this.params( extraData ) : '');
		
		if(method === 'GET') {
			url += (url.indexOf('?') !== -1 ? '&' : '?') + data;
			return $lg.get(url, callback);
		}
		
		if(method === 'POST') {
			return $lg.post(url, data, callback);
		}
		
		var obj = {
			url : url,
			type : method, 
			params : data
		};
		
		if(callback) {
			obj.oncomplete = callback;
		}
		
		return $lg.ajax.request(obj);
	};
	
	lg.send = function(callback, data) {
		if(this[0]) $lg.ajax.sendForm(this[0], callback, data);
	};
	
	lg.serialize = function() {
		var data = '';
		this.all(function(e) {
			data += '&' + $lg.serialize(e);
		});
		return data.substr(1);
	};

	lg.load = function(url, selector, callback) {
		if(!$lg.depend('selector dom')) {
			return this;
		}
		
		if( $lg.is_function(selector) ) {
			callback = selector;
			selector = false;
		}
		
		var that = this;
		
		$lg.get(url, function(r) {
			r = r.replace(/<script.*?>\s*<\/script\s*>/gi, ''); //remove script tags from being reloaded. Inline scripts aren't executed so no danger with them.
			
			if( $lg.is_string(selector) ) {
				
				that.empty();
				
				$lg(selector, $lg('<div></div>').append(r)).appendTo(that);
			}
			else {
				that.inner(r);
			}
			
			if( $lg.is_function(callback) ) {
				callback.call(that, r);
			}
		});
		
		return this;
	};

//ANIMATION

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
	
//EVENT

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
	
})(window);
