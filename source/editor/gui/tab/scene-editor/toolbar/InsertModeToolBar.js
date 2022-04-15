import {Component} from "../../../../components/Component.js";
import {ToolBarGroup} from "./ToolBarGroup.js";

/**
 * The tool bar is used to store tool groups.
 *
 * Tools are organized by category, the toolbar size is automatically calculated from the amount of elements.
 *
 * @class InsertModeToolBar
 * @extends {Component}
 * @param {Component} parent Parent element.
 */
function InsertModeToolBar(parent)
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
	this.allButtons = [];

	this.size.y = 45;

	this.lastSelectedId = null;
	this.lastSelectedObject = null;
	this.lastSelectedObjectOptions = null;
}

InsertModeToolBar.prototype = Object.create(Component.prototype);

InsertModeToolBar.prototype.selectTool = function(id)
{
	this.lastSelectedId = id;
	var th = this;
	this.allButtons.forEach(function(btn)
	{
		btn.setSelected(btn.id === id);
		if (btn.id === id)
		{
			th.lastSelectedObject = btn.object;
			th.lastSelectedObjectOptions = btn.libraryOptions;
		}
	});
};

/**
 * Add new group to this tool bar.
 *
 * @method addGroup
 * @return {ToolBarGroup} The new group created.
 */
InsertModeToolBar.prototype.addGroup = function()
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
InsertModeToolBar.prototype.updateGroups = function()
{
	this.position.x = 0;

	var allGroupsSize = 0;
	for (var i = 0; i < this.groups.length; i++)
	{
		allGroupsSize += this.groups[i].size.x;

		if (i + 1 < this.groups.length)
		{
			allGroupsSize += this.spacing;
		}
	}

	var startLeft = (this.parent.size.x - allGroupsSize) / 2;
	if (startLeft < 0)
	{
		console.log('Unimplemented case');
		return;
	}

	var x = startLeft;
	for (var i = 0; i < this.groups.length; i++)
	{
		this.groups[i].position.x = x;
		this.groups[i].updateInterface();

		x += this.groups[i].size.x;

		if (i + 1 < this.groups.length)
		{
			x += this.spacing;
		}
	}
};

InsertModeToolBar.prototype.maybeSelectFirstOption = function()
{
	if (!this.lastSelectedId && this.allButtons.length > 0)
	{
		this.selectTool(this.allButtons[0].id);
		this.parent.selectTool(this.parent.mode);
	}
};

export {InsertModeToolBar};
