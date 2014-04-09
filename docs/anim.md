LG Animations
==================
The anim.js module of LG uses a modified version of Animax made for LG to add effect functions to the LG prototype.
The Animax object is under $lg.animation and can be used as according to the Animax documentation.

_This whole animation module depends on the css.js module_

The Animation Function
-----------------
_This function depends on the css.js module_
LG has an important animation function which is used internally for animations, `.animate(properties [, callback] [, time])`
The properties parameter should be an object containing the properties or CSS properties to animate and the value of which to animate to.

For example to animate an elements width to 100px: `$lg('#element').animate({ width: '100px' });`
The "from" value will be taken from the elements current value for the property. 

Several properties can be defined to animate at once calling the animate function only once.
```javascript
$lg('#element').animate({
	width: '100px',
	padding: '20px',
	top: '50%'
});
``` 
The animate function optionally takes a callback function to exectue after the animation is complete.
Also optionally a time can be defined to specify the length of the animation; see Animax documentation for more detail.

LG Animation Functions
-------------------------
There are a few basic animations built into LG for the most popular effects.

#### slideDown([speed] [,callback])
_This function depends on the dom.js module_
Slide the element/s down into view. Commonly used for displaying a hidden element.
The first optional parameter defines the speed of the animation, see Animax for more details.

A callback function can also be specified to be executed when the animation is complete.

```javascript
$lg('#button').click(function(){
	$lg('#menu').slideDown('fast');
});
``` 

#### slideUp([speed] [,callback])  
_This function depends on the dom.js module_
Similar to slideDown but hides the element/s by sliding them up. Commonly used for hiding a visible element.

#### fadeOut([speed] [,callback])
Changes the opacity of an element from its current opacity to 0, hiding it from view.

#### fadeIn([speed] [,callback])
Changes the opacity of an element from 0, to simulate fading in, bringing it into view.


LG Function Modifications
--------------------------
The Animation module modifies a few function of the LG prototype.

The hide, show and toggle function now have an optional animation parameter which can either be 'slide' or 'fade'. 
This allows you to use the animations for toggling: `$lg('#element').toggle('fade');`


