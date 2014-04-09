/* LG.js
*  Selector
*  Dependent: core
*/

(function($lg) {
	
	if(!$lg) {
		return;
	}
	
	var lg = $lg.proto;
	
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
	
	//indicate this module has been installed.
	$lg.installed.selector = 1;
	
})($lg);
