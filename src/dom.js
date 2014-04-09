/* LG.js
* Dom
* Dependent: core
*/

(function($lg) {
	
	if(!$lg) {
		return;
	}
	
	var lg = $lg.proto;
	
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
	
	$lg.installed.dom = 1;
	
})($lg);
