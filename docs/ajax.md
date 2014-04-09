LG Ajax 
===================
The ajax.js file adds useful ajax methods and functions to both the $lg variable and the LG object.
LG uses a modified version of Avax.js tuned to work well with LG.

Functions accessible directly through the $lg variable
----------------------------
These functions don't require initiation, they can be used directly from the $lg variable.

#### $lg.get(url [,callback])
Make a 'GET' XHR request to a URL. The URL can be local or external. Any data should be appended to the url as a query string.
 
A callback function can be provided for when the request completes.
The callback function is given the parameters of the response and the XHR object. Response type can be changed via editing the `$lg.ajax.config` object. 

```javascript
$lg.get('/mypage.php', function(response) { alert(response) });
```          

#### $lg.post(url [,data] [,callback])
Make a 'POST' request to a URL.   
Optional Data parameter can be in the form of a query style string: 'param=value&param2=value2'   
OR in the form of an object: {param: value, param2: value2} or an array: ['param=value', 'param2=value2']

Callback function can be specified for when the request completes. callback is handed a parameter of the response and XHR object.

__Examples:__
```javascript
$lg.post('/send.php','user=me&message=hello', function(response) {
   if(response === 'success') alert('your message has been sent');
});   

$lg.post('/like.php', function(r) { 
	$lg('#likes').inner(r); 
});

$lg.post('/message', {message: 'Hi there', sender: 'Me', topic: 23}, function(r) {
   $lg('#topic').append(r);
});
```

#### $lg.ajax(options)   
$lg.ajax is the function used internally to make all requests; it allows for more flexibility by defining options.
Any options not defined will be set as the default value defined in `$lg.ajax.config` 

Default Settings object (See bottom for explanation of options):
```javascript
$lg.ajax.config = {
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
}; 
```
These default settings can be altered by directly by changing the values in the config object: `$lg.ajax.config.async = false;`     

For changing a option for just one ajax request, the temporary value should be specified in the options parameter object:
```javascript
$lg.ajax({
    url: '/xml_data.php',
    async: false,
    response: 'responseXML'
}); 
``` 
This would make an Ajax request with the default settings but async changed to false and the response type as 'responseXML' to a URL of '/xmldata.php'

#### $lg.localUrl(url)
Returns true if the provided URL is a local url, or false if it is external.

Prototype functions for LG object
--------------------------
These functions are used on your LG object containing the nodes.


#### .load(url [,selector] [,callback])   
_This function is dependant on the selector.js and dom.js modules_
Loads content into the matched elements. 
The load function allows you to retreive elements from another page using a selector, the loaded elements will be inserted into each of your nodelist.   
A callback function can be specified to execute after the loading is complete. The callback receives the response from the ajax request.
  
```javascript
$lg('#login_form').load('/login', '#main form:has(input[name="username"])', function() {
   this.center().show().append('Please log in');
};
```
If no selector is specified the response is inserted directly into the matched nodes, scripts are removed.    
.load() uses a GET request so any data should be sent in a query string.    

#### .serialize()
_This function is dependant on the selector.js and props.js modules_
This will serialize your nodeset into a query string.  
It will take all user input elements names and values within your nodeset and create the query string. 
This can be used on non-form elements. 

#### .send()
_This function is dependant on the selector.js and props.js modules_
This should be used on a form.  
It will send the form via AJAX, by first serializing the forms data, then making an ajax request using the forms method and the forms action as the URL.


AJAX Request Options:
--------------------------
* url - the url to send to obviously.
* type - the type of ajax request 'GET, 'POST' ... 
* async - whether the request should be asynchronous.
* headers - Object of Request headers to be sent with the request. You can set a default header for every request using `$lg.ajax.setHeader(name, value)`
* params - Any data parameters to be sent. Should be an object or string.
* oncomplete - the function to perform on completion of the request. Receives the response and XHR object as the parameters.
* onstatechange - a function to perform each state change. Receives the state and XHR object as parameters.
* response - the return value 'reponse', 'reponseText', 'responseXML'


