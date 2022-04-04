import {Script} from "../../../../core/objects/script/Script.js";
import {Editor} from "../../../Editor.js";
import {CodeEditor} from "./CodeEditor.js";
import {LuaToolbar} from "./controls/LuaToolbar.js";

/**
 * The script editor is used to view and edit code of script objects.
 *
 * @class LuaScriptEditor
 * @extends {CodeEditor}
 */
function LuaScriptEditor(parent, closeable, container, index)
{
	CodeEditor.call(this, parent, closeable, container, index);

	var self = this;

	this.setLanguage("lua");
	this.updateSettings();

	/**
	 * The tool bar contains the selector for the transform tools and object placing icons.
	 *
	 * @attribute toolBar
	 * @type {LuaToolbar}
	 */
	this.toolBar = new LuaToolbar(this);

	/**
	 * Tern server used to provide code analysis.
	 *
	 * @attribute server
	 * @type {CodeMirror.TernServer}
	 */
	this.server = new CodeMirror.TernServer(
		{
			caseInsensitive: false,
			defs: Editor.ternDefinitions
		});

	this.code.setOption("extraKeys",
		{"Ctrl-Space": function(cm) {self.server.complete(cm);}});

	// Change
	this.code.on("change", function(cm)
	{
		if (!cm.state.focused)
		{
			return;
		}

		self.updateCode();
	});

	// Cursor activity event
	this.code.on("cursorActivity", function(cm)
	{
		self.server.updateArgHints(cm);
	});

	// Key pressed event
	this.code.on("keypress", function(cm, event)
	{
		var typed = String.fromCharCode(event.charCode);

		if (/[\w\.]/.exec(typed))
		{
			self.server.complete(cm);

			// If there is no tern sugestion suggest known words
			if (!cm.state.completionActive || !cm.state.completionActive.widget)
			{
				CodeMirror.commands.autocomplete(cm, null);
			}
		}
	});

	/**
	 * Scroll position
	 *
	 * @attribute scroll
	 * @type {Object}
	 */
	this.scroll = null;

	/**
	 * Script object attached to code editor.
	 *
	 * @attribute script
	 * @type {Script}
	 */
	this.script = null;
}

LuaScriptEditor.prototype = Object.create(CodeEditor.prototype);

LuaScriptEditor.prototype.updateMetadata = function()
{
	// Name
	this.setName(this.script.name);

	// Check if object has a parent
	if (this.script.parent === null)
	{
		this.close();
		return;
	}

	// Check if object exists in parent
	var children = this.script.parent.children;
	for (var i = 0; i < children.length; i++)
	{
		if (this.script.uuid === children[i].uuid)
		{
			return;
		}
	}

	// If not found close tab
	if (i >= children.length)
	{
		this.close();
	}
};

LuaScriptEditor.prototype.activate = function()
{
	CodeEditor.prototype.activate.call(this);

	this.updateCode();
};

LuaScriptEditor.prototype.isAttached = function(script)
{
	return this.script === script;
};

LuaScriptEditor.prototype.attach = function(script)
{
	this.script = script;
	this.setText(script.code);
	this.updateMetadata();
};

/**
 * Update the attached object script code.
 *
 * @method updateCode
 */
LuaScriptEditor.prototype.updateCode = function()
{
	if (this.script !== null)
	{
		this.script.code = this.code.getValue();
	}
};

LuaScriptEditor.prototype.updateSize = function()
{
	CodeEditor.prototype.updateSize.call(this);

	this.toolBar.position.set(0, 0);
	this.toolBar.size.set(40, this.size.y);
	this.toolBar.updateInterface();
	this.toolBar.position.set(this.size.x / 2 - this.toolBar.size.x / 2, 5);
	this.toolBar.updateInterface();
};

export {LuaScriptEditor};
