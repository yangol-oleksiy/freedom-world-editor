import {Locale} from "../../../../locale/LocaleManager.js";
import {Component} from "../../../../components/Component.js";
import {ButtonText} from "../../../../components/buttons/ButtonText.js";

/**
 * FennelToolbar contains tools specific to Fennel code editor.
 *
 * @class FennelToolbar
 * @extends {Component}
 */
function FennelToolbar(parent)
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
	var luaCodeToExecuteFennel = `
	package.path = "./?.lua"
	local js = require("js")

	-- minimal shims just to allow the compilers to load in Fengari
	package.loaded.ffi = {typeof=function() end}
	os = {getenv=function() end}
	io = {open=function() end}
	bit = {band = function(a,b) return a & b end,
	       rshift=function(a,b) return a >> b end}
	unpack = table.unpack

	function print(...) js.global.console:log(...) end

	print("Loading fennel...")

	local antifennel = dofile("antifennel.lua")
	local fennel = require("fennel")

	print("Loaded Fennel " .. fennel.version .. " in " .. _VERSION)

	local ok, code = pcall(fennel.compileString, js.global.fennelCode)

	if ok then
		js.global.luaCode = code;
	end`;

	this.addButton(Locale.runScript, function()
	{
		window.fennelCode = self.parent.code.getValue();

		fengari.load(luaCodeToExecuteFennel)();
		fengari.load(window.luaCode)();
	}, Locale.cube);
}

FennelToolbar.prototype = Object.create(Component.prototype);

FennelToolbar.prototype.addButton = function(buttonTitle, callback, altText)
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

FennelToolbar.prototype.updateSize = function()
{
	Component.prototype.updateSize.call(this);

	this.buttons[0].attachTo(this);
	this.buttons[0].position.set(0, 0);
	this.buttons[0].visible = true;
	this.buttons[0].updateInterface();

	this.position.x = this.parent.size.x - 200;
	this.size.y = 40;
	this.size.x = 200;
	this.position.y = this.parent.size.y - 40;
};

export {FennelToolbar};
