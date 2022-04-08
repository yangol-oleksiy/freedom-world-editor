import {Locale} from "../../../../locale/LocaleManager.js";
import {SceneEditor} from "../SceneEditor.js";
import {Global} from "../../../../Global.js";
import {Component} from "../../../../components/Component.js";
import {ToolBarGroup} from "./ToolBarGroup.js";

/**
 * The tool bar is used to store tool groups.
 *
 * Tools are organized by category, the toolbar size is automatically calculated from the amount of elements.
 *
 * @class ToolBar
 * @extends {Component}
 * @param {Component} parent Parent element.
 */
function ToolBar(parent)
{
	Component.call(this, parent, "div");

	this.setStyle("overflow", "visible");

	/**
	 * Spacing in px between the tool groups.
	 *
	 * @attribute spacing
	 * @type {Number}
	 */
	this.spacing = 10;

	/**
	 * Groups contained inside this tool bar.
	 *
	 * @attribute groups
	 * @type {Array}
	 */
	this.groups = [];

	this.size.y = 45;

	var self = this;

	var tool = this.addGroup();
	this.select = tool.addToggleOption(Locale.select + " (CTRL+1)", Global.FILE_PATH + "icons/tools/select.png", function()
	{
		self.parent.selectTool(SceneEditor.SELECT);
	});
	this.multipleSelect = tool.addToggleOption(Locale.selectMultipleMode + " (no shortcut)", Global.FILE_PATH + "icons/tools/select_multiple	.png", function()
	{
		self.parent.selectTool(SceneEditor.SELECT_MULTIPLE);
	});
	this.insert = tool.addToggleOption(Locale.insertMode + " (no shortcut)", Global.FILE_PATH + "icons/tools/insert.png", function()
	{
		self.parent.selectTool(SceneEditor.INSERT);
	});
	this.move = tool.addToggleOption(Locale.move + " (CTRL+2)", Global.FILE_PATH + "icons/tools/move.png", function()
	{
		self.parent.selectTool(SceneEditor.MOVE);
	});
	this.scale = tool.addToggleOption(Locale.scale + " (CTRL+3)", Global.FILE_PATH + "icons/tools/resize.png", function()
	{
		self.parent.selectTool(SceneEditor.SCALE);
	});
	this.rotate = tool.addToggleOption(Locale.rotate + " (CTRL+4)", Global.FILE_PATH + "icons/tools/rotate.png", function()
	{
		self.parent.selectTool(SceneEditor.ROTATE);
	});

	var zoom = this.addGroup();
	this.zoom = zoom.addOption(Locale.focusObject + " (CTRL+F)", Global.FILE_PATH + "icons/misc/focus.png", function()
	{
		self.parent.focusObject();
	});

	this.updateGroups();
}

ToolBar.prototype = Object.create(Component.prototype);

ToolBar.prototype.selectTool = function(tool)
{
	this.select.setSelected(tool === SceneEditor.SELECT);
	this.move.setSelected(tool === SceneEditor.MOVE);
	this.scale.setSelected(tool === SceneEditor.SCALE);
	this.rotate.setSelected(tool === SceneEditor.ROTATE);
	this.multipleSelect.setSelected(tool === SceneEditor.SELECT_MULTIPLE);
	this.insert.setSelected(tool === SceneEditor.INSERT);
};

/**
 * Add new group to this tool bar.
 *
 * @method addGroup
 * @return {ToolBarGroup} The new group created.
 */
ToolBar.prototype.addGroup = function()
{
	var group = new ToolBarGroup(this);
	group.size.y = this.size.y;
	this.groups.push(group);
	return group;
};

/**
 * Update the groups position and recalculate the bar size.
 *
 * Should be manually called after adding new elements to the toolbar.
 *
 * @method updateGroups
 */
ToolBar.prototype.updateGroups = function()
{
	this.size.x = 0;

	for (var i = 0; i < this.groups.length; i++)
	{
		this.groups[i].position.x = this.size.x;
		this.groups[i].updateInterface();

		this.size.x += this.groups[i].size.x;

		if (i + 1 < this.groups.length)
		{
			this.size.x += this.spacing;
		}
	}
};

export {ToolBar};
