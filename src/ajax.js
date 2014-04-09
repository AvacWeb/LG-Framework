/* LG.js
*  Ajax
*  Dependant: core & form handling functions dependant on selector and props, .load dependant on dom
*/

(function($lg) {
	if(!$lg) {
		return; 
	}
	
	var lg = $lg.proto;
	
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
	
	$lg.installed.ajax = 1;

})($lg);
