import {Vector2} from "three";
import {EventManager} from "../../core/utils/EventManager.js";
import {Group} from "../../core/objects/misc/Group.js";

/**
 * Component is the base object for all GUI elements.
 * 
 * All GUI elements are based on the Component class, components can be inserted into other componens or into DOM elements.
 * 
 * @class Component
 * @param {Component} parent Parent element.
 * @param {string} type Type of the based DOM element.
 */
function Component(parent, type)
{
	/** 
	 * Base DOM element for this component.
	 *
	 * Different components may use diferent base element types.
	 * 
	 * @attribute element
	 * @type {Component}
	 */
	this.element = document.createElement(type !== undefined ? type : "div");
	this.element.style.position = "absolute";
	this.element.style.overflow = "hidden";

	/**
	 * Event manager responsible for handling all events attached to this component.
	 *
	 * Allows children object types to expand the events of the object without overlapping event names.
	 *
	 * Only the events of this component should be put here. Avoid mixing events of different components across event handlers.
	 *
	 * @attribute event
	 * @type {EventManager}
	 */
	this.event = new EventManager();

	/** 
	 * The parent element that contains this Component.
	 *
	 * Can be a DOM element or another Component.
	 * 
	 * @attribute parent
	 * @type {Component}
	 */
	this.parent = null;
	if (parent !== undefined)
	{
		this.attachTo(parent);
	}
	
	/** 
	 * True if the element is visible.
	 *
	 * @attribute visible
	 * @type {boolean}
	 */
	this.visible = true;
	
	/**
	 * Size of this component in px.
	 *
	 * @attribute size
	 * @type {Vector2}
	 */
	this.size = new Vector2(0, 0);
	
	/**
	 * Position of this component relatively to its parent in px.
	 *
	 * @attribute position
	 * @type {Vector2}
	 */
	this.position = new Vector2(0, 0);

	/**
	 * Positioning mode, indicates how to anchor the component.
	 *
	 * @attribute mode
	 * @type {number}
	 */
	this._mode = Component.TOP_LEFT;
}

Component.prototype.constructor = Component;

Component.prototype.isComponent = true;

/**
 * Top-left positioning.
 *
 * @static
 * @attribute TOP_LEFT
 * @type {number}
 */
Component.TOP_LEFT = 0;

/**
 * Top-right positioning.
 *
 * @static
 * @attribute TOP_RIGHT
 * @type {number}
 */
Component.TOP_RIGHT = 1;

/**
 * Bottom-left positioning.
 *
 * @static
 * @attribute BOTTOM_LEFT
 * @type {number}
 */
Component.BOTTOM_LEFT = 2;

/**
 * Bottom-right positioning.
 *
 * @static
 * @attribute BOTTOM_RIGHT
 * @type {number}
 */
Component.BOTTOM_RIGHT = 3;

Component.preventDefault = function(event)
{
	event.preventDefault();
};

/**
 * Add a event to the component base element. The event is registered in the component event manager.
 *
 * @method addEvent
 * @param {string} event Event name.
 * @param {Function} callback Callback function passed to the event handler.
 */
Component.prototype.addEvent = function(event, callback)
{
	this.event.addAndCreate(this.element, event, callback);
};

/**
 * Remove all ocurrences of a event from the component. 
 *
 * @method removeEvent
 * @param {string} event Event name.
 */
Component.prototype.removeEvent = function(event)
{
	this.event.remove(this.element, event);
};

/**
 * Replace all instance of a specific event with a new event.
 *
 * @method replaceEvent
 * @param {string} event Event name.
 * @param {Function} callback Callback function passed to the event handler.
 */
Component.prototype.replaceEvent = function(event, callback)
{
	this.event.remove(this.element, event);
	this.event.addAndCreate(this.element, event, callback);
};

/** 
 * Add a CSS class to the base DOM element of this Component.
 * 
 * @method addClass
 * @param {string} name Name of the class to be added.
 */
Component.prototype.addClass = function(name)
{
	this.element.classList.add(name);
};

/** 
 * Remove a CSS class from the base DOM element of this Component.
 * 
 * @method removeClass
 * @param {string} name Name of the class to be removed.
 */
Component.prototype.removeClass = function(name)
{
	if (this.element.classList.contains(name))
	{
		this.element.classList.remove(name);
	}
};

/**
 * Change style of the base DOM element.
 *
 * @method setStyle
 * @param {string} attribute Name of the style attribute.
 * @param {string} value Value of the style.
 */
Component.prototype.setStyle = function(attribute, value)
{
	this.element.style[attribute] = value;
};

/**
 * Set the multiple styles to the DOM element.
 *
 * Style are described in a object that uses the same attribute names as the normal DOM access.
 *
 * Here is an exaple of a style object:
 * {
 * backgroundColor: "#FF0000",
 * color: "#FFFFFF"
 * }
 *
 * @method setStyles
 * @param {Object} styles Object describing the style to be applied to the object.
 */
Component.prototype.setStyles = function(styles)
{
	for (var i in styles)
	{
		this.element.style[i] = styles[i];
	}
};

/**
 * Add and drag and drop default event prevention to this component.
 *
 * Usefull to avoid unwanted actions on draggable components. 
 *
 * @method preventDragEvents
 */
Component.prototype.preventDragEvents = function()
{
	this.element.ondrop = Component.preventDefault;
	this.element.ondragover = Component.preventDefault;
};

/**
 * Set alt text, that is displayed when the mouse is over the element. Returns the element created that is attached to the document body.
 *
 * @method setAltText
 * @param {string} altText Alt text.
 */
Component.prototype.setAltText = function(altText)
{
	var element = document.createElement("div");
	element.style.position = "absolute";
	element.style.display = "none";
	element.style.alignItems = "center";
	element.style.zIndex = "10000";
	element.style.border = "3px solid";
	element.style.borderRadius = "5px";
	element.style.color = "var(--color-light)";
	element.style.backgroundColor = "var(--bar-color)";
	element.style.borderColor = "var(--bar-color)";
	element.style.height = "fit-content";
	document.body.appendChild(element);

	// Text
	var text = document.createTextNode(altText);
	element.appendChild(text);

	// Destroy
	var destroyFunction = this.destroy;
	this.destroy = function()
	{	
		destroyFunction.call(this);

		if (document.body.contains(element))
		{
			document.body.removeChild(element);
		}
	};
	
	this.element.style.pointerEvents = "auto"; 

	this.addEvent("mousemove", function(event)
	{
		element.style.display = "flex";
		element.style.left = event.clientX + 8 + "px";
		element.style.top = event.clientY - 20 + "px";
	});

	this.addEvent("mouseout", function()
	{
		element.style.display = "none";
	});

	return element;
};

/**
 * Set method to be called on component click.
 *
 * A "click" event is added to the component event manager. Multiple click events can coexist.
 * 
 * @method setOnClick
 * @param {Function} callback Function called when the component is clicked.
 */
Component.prototype.setOnClick = function(callback)
{
	this.addEvent("click", callback);
};

/**
 * Remove all DOM children from the element.
 * 
 * @method removeAllChildren
 */
Component.prototype.removeAllChildren = function()
{
	while (this.element.firstChild)
	{
		this.element.removeChild(this.element.firstChild);
	}
};

/**
 * Attach this component to a new parent component.
 * 
 * Destroys the object and reataches the base DOM element to the new parent element.
 * 
 * @method attachTo
 * @param {Component} parent Parent container.
 */
Component.prototype.attachTo = function(parent)
{
	if (this.parent === parent || parent === undefined)
	{
		return;
	}

	if (this.parent !== null)
	{
		Component.prototype.destroy.call(this);
	}

	this.parent = parent;

	if (parent.isComponent === true)
	{
		parent.element.appendChild(this.element);
	}
	else
	{
		console.warn("Freedom World Editor: Parent is not a Component.", this);
		this.parent.appendChild(this.element);
	}
};

/**
 * Create event listeners to watch for pointer enter/leave events.
 * 
 * Store the pointer state in the pointerInside attribute.
 * 
 * @method watchPointer
 */
Component.prototype.watchPointer = function()
{
	var self = this;

	this.pointerInside = false;

	this.element.addEventListener("mouseenter", function()
	{
		self.pointerInside = true;
	});

	this.element.addEventListener("mouseleave", function()
	{
		self.pointerInside = false;
	});
};

/**
 * Called to destroy a component.
 *
 * Destroy the element and removes it from its DOM parent.
 * 
 * @method destroy
 */
Component.prototype.destroy = function()
{
	if (this.parent !== null)
	{
		if (this.parent.isComponent === true)
		{
			if (this.parent.element.contains(this.element))
			{
				this.parent.element.removeChild(this.element);
				this.parent = null;
			}
		}
		else
		{
			console.warn("Freedom World Editor: Parent is not a Component.", this);
			if (this.parent.contains(this.element))
			{
				this.parent.removeChild(this.element);
				this.parent = null;
			}
		}
	}
};

/**
 * Set positioning mode.
 * 
 * @method setMode
 * @param {number} setMode
 */
Component.prototype.setMode = function(mode)
{
	this._mode = mode;
	this.element.style.bottom = null;
	this.element.style.top = null;
	this.element.style.right = null;
	this.element.style.left = null;
};

/**
 * Calculate the position of the container to make it centered.
 *
 * Calculated relatively to its parent size.
 * 
 * @method center
 */
Component.prototype.center = function()
{
	this.position.set((this.parent.size.x - this.size.x) / 2, (this.parent.size.y - this.size.y) / 2);
};

/**
 * Update visibility of this element.
 *
 * @method setVisibility
 */
Component.prototype.setVisibility = function(visible)
{
	this.visible = visible;
	this.updateVisibility();
};

/**
 * Update the visibility of this element.
 *
 * @method updateVisibility
 */
Component.prototype.updateVisibility = function()
{
	this.element.style.display = this.visible ? "block" : "none";
};

/**
 * Update the position of this element.
 * 
 * @method updatePosition
 */
Component.prototype.updatePosition = function(mode)
{
	if (mode !== undefined)
	{
		this._mode = mode;
	}

	if (this._mode === Component.TOP_LEFT || this._mode === Component.TOP_RIGHT)
	{
		this.element.style.top = this.position.y + "px";
	}
	else
	{
		this.element.style.bottom = this.position.y + "px";
	}

	if (this._mode === Component.TOP_LEFT || this._mode === Component.BOTTOM_LEFT)
	{
		this.element.style.left = this.position.x + "px";
	}
	else
	{
		this.element.style.right = this.position.x + "px";
	}
};

/**
 * Update the size of this element.
 * 
 * @method updateSize
 */
Component.prototype.updateSize = function()
{
	this.element.style.width = this.size.x + "px";
	this.element.style.height = this.size.y + "px";
};

/**
 * Update component appearance.
 * 
 * Should be called after changing size or position.
 *
 * Uses the updateVisibility and if the element is visible calls the updateSize and updatePosition (in this order) methods to update the interface.
 * 
 * @method update
 */
Component.prototype.updateInterface = function()
{
	this.updateVisibility();

	if (this.visible)
	{
		this.updateSize();
		this.updatePosition();
	}
};

export {Component};
