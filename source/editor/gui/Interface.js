import {Locale} from "../locale/LocaleManager.js";
import {FWE} from "../../core/FWE.js";
import {FileSystem} from "../../core/FileSystem.js";
import {Editor} from "../Editor.js";
import {TabGroup} from "../components/tabs/TabGroup.js";
import {TabGroupSplit} from "../components/tabs/splittable/TabGroupSplit.js";
import {TabContainer} from "../components/tabs/splittable/TabContainer.js";
import {DocumentBody} from "../components/DocumentBody.js";
import {TreeView} from "./tab/tree-view/TreeView.js";
import {InspectorContainer} from "./tab/inspector/InspectorContainer.js";
import {ConsoleTab} from "./tab/console/ConsoleTab.js";
import {MainMenu} from "./MainMenu.js";

/**
 * The full GUI of the application.
 *
 * All objects are GUI objects are initialized in this object.
 *
 * @class Interface
 */
function Interface()
{
	/**
	 * Main tab container that has all the interface tabs.
	 *
	 * @attribute tab
	 * @type {TabContainer}
	 */
	this.tab = new TabContainer(DocumentBody);
	this.tab.attach(new TabGroupSplit());

	var main = this.tab.split(TabGroup.RIGHT).parent;
	main.tabPosition = 0.7;

	var left = main.elementA.split(TabGroup.BOTTOM).parent;
	left.tabPosition = 0.7;
	var leftBottom = left.elementB;

	var right = main.elementB.split(TabGroup.BOTTOM).parent;
	var rightTop = right.elementA;
	var rightBottom = right.elementB;

	this.console = leftBottom.addTab(ConsoleTab, false);

	this.tree = rightTop.addTab(TreeView, false);

	this.inspector = rightBottom.addTab(InspectorContainer, false);

	this.menuBar = new MainMenu(DocumentBody);
}

/**
 * Create new program.
 *
 * @method newProgram
 */
Interface.prototype.newProgram = function()
{
	this.newXZYProgram();
};

/**
 * Create new program.
 *
 * @method newXYZProgram
 */
Interface.prototype.newXYZProgram = function()
{
	if (Editor.confirm(Locale.changesWillBeLost + " " + Locale.createProject))
	{
		Editor.createNewXYZProgram();
	}
};

/**
 * Create new program with XZY coordinate system.
 *
 * @method newXZYProgram
 */
Interface.prototype.newXZYProgram = function()
{
	if (Editor.confirm(Locale.changesWillBeLost + " " + Locale.createProject))
	{
		Editor.createNewXZYProgram();
	}
};

Interface.prototype.updateInterface = function()
{
	var width = window.innerWidth;
	var height = window.innerHeight;

	this.tab.position.set(0, this.menuBar.size.y);
	this.tab.size.set(width, height - this.menuBar.size.y);
	this.tab.updateInterface();
};

export {Interface};
