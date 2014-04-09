LG Event Handling
===================
LG has an event system for easy binding of listeners to multiple elements at once. The main event API resides in $lg.event



#### bind(eventType, eventHandler)
Binds a handler to an event for all elements in the nodeset. 
Optionally multiple event types can be bound to the same handler by seperating them with a space.
```javascript
$lg('#explosive').bind('click', function(e){ 
	alert('Boom!');
});

$lg('textarea').bind('keypress keyup keydown', function(e) {
	alert( e.keyCode );
});
```          

#### fire(eventType [, eventData]) 
Fires a type of event on the all elements in the nodeset. 
All handlers set with the bind function, inline and others will be fired. 
Optional second parameter allows you to pass an object with values which will be used in the event object, allowing you to specify a keyCode, target etc... 
```javascript
$lg('#explosive').fire('click'); // Boom!

$lg('textarea').fire('keypress', {keyCode: 13, text: 'My custom event property for the handlers'});
``` 

#### Shortcut Event Functions
LG has a number of functions for making binding of events easier and quicker, as a large amount of event types have their own function.
_close click dblclick mouseup mousedown mouseover mouseout mousemove contextmenu keydown keypress keyup 
unload error resize scroll blur focus change submit select reset change_ all have their own function.
These functions can be used for either setting or firing an event. 

To set an event handler, specify a function as the only parameter.
```javascript
$lg('#clicker').click(function(e) {
	e.preventDefault();
	alert('Clicked!');
});
``` 

To fire an event, pass no arguments or give a data object to be passed to the event handlers.
```javascript
$lg('#clicker').click();

$lg('textarea').keypress({keyCode: 13});
``` 

#### hover([mouseenter] [, mouseleave])
A common problem with mouseover events is the user only wants them to occur when the mouse enters the element, and not fire when the mouse enters children elements. 
The hover function solves that problem and allows for a mouseover/mouseout that does not fire when the mouse enters or leaves children elements of the bound element.
This is the action taken by Internet Explorer events mouseenter and mouseleave.

The first parameter is a function to be executed upon the mouse entering the element, and the second for when the mouse leaves. 
Hover events can only be bound using the hover function, however they can be fired using the fire function or no arguments.

```javascript
$lg('#option').hover(function() {
	$lg('#menu').show();
}, function() {
	$lg('#menu').slideUp();
});

$lg('#option').hover();
``` 

#### removeEvent([eventType] [, handler])
Remove an event handler or multiple event handlers from the nodeset. 
If no arguments are defined, all event handlers set using the bind function will be removed from the elements. 
If an event type is defined only events of that type will be defined.
If an event type and handler function is defined, that single handler will be removed.
`$lg('#clicker').removeEvent('click');`




