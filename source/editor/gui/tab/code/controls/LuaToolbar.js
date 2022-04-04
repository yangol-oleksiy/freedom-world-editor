import {Locale} from "../../../../locale/LocaleManager.js";
import {Global} from "../../../../Global.js";
import {Editor} from "../../../../Editor.js";
import {Component} from "../../../../components/Component.js";
import {ButtonText} from "../../../../components/buttons/ButtonText.js";

/**
 * LuaToolbar contains tools specific to Lua code editor.
 *
 * @class LuaToolbar
 * @extends {Component}
 */
function LuaToolbar(parent)
{
	Component.call(this, parent, "div");

	this.preventDragEvents();

	this.setStyle("overflow", "visible");
	this.setStyle("backgroundColor", "var(--bar-color)");
	this.setStyle("zIndex", "300");

	/**
	 * List of object placing buttons.
	 *
	 * @attribute buttons
	 * @type {Array}
	 */
	this.buttons = [];

	this.parent = parent;

	var self = this;
	this.addButton(Locale.runScript, function()
	{
		fengari.load(self.parent.code.getValue())();
	}, Locale.cube);
}

LuaToolbar.prototype = Object.create(Component.prototype);

LuaToolbar.prototype.addButton = function(buttonTitle, callback, altText)
{
	var self = this;

	var panel = new Component(this, "div");
	panel.element.style.overflow = "visible";
	panel.element.style.backgroundColor = "var(--bar-color)";
	panel.element.style.zIndex = "250";

	var button = new ButtonText(panel);

	button.setText(buttonTitle);
	button.setOnClick(function()
	{
		callback();
		self.updateInterface();
	});

	button.size.x = 200;
	button.size.y = 40;

	if (altText !== undefined)
	{
		button.setAltText(altText);
	}

	button.addEvent("mouseenter", function()
	{
		button.element.style.backgroundColor = 'var(--button-over-color)';
	});

	button.addEvent("mouseleave", function()
	{
		button.element.style.backgroundColor = 'transparent';
	});

	this.buttons.push(button);
};

LuaToolbar.prototype.updateSize = function()
{
	Component.prototype.updateSize.call(this);

	this.buttons[0].attachTo(this);
	//this.buttons[i].size.set(size, size);
	this.buttons[0].position.set(0, 0);
	//this.buttons[i].optionsSize.set(size, size);
	this.buttons[0].visible = true;
	this.buttons[0].updateInterface();

	this.position.x = this.parent.size.x - 200;
	this.size.y = 40;
	this.size.x = 200;
	this.position.y = this.parent.size.y - 40;
};

export {LuaToolbar};
