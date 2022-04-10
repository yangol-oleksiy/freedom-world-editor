import {Group, Object3D} from "three";
// eslint-disable-next-line no-duplicate-imports
import * as THREE from "three";
import {Scene} from "../Scene.js";
import {Program} from "../Program.js";
import {FileSystem} from "../../FileSystem.js";
import * as FWE from "../../Main.js";

/**
 * FennelScript objects are used to run Fennel scripts inside editor.
 *
 * @class FennelScript
 * @extends {Object}
 * @param {string} code Fennel code to be used by this script
 * @param {number} mode Mode used to import external code into the script.
 * @module Script
 */
function FennelScript(code, mode)
{
	Group.call(this);

	this.type = "FennelScript";
	this.name = "script";

	/**
	 * Source code attached to the script, by default it is a FennelScript source.
	 *
	 * @property code
	 * @type {string}
	 */
	this.code = code !== undefined ? code : FennelScript.DEFAULT;

	/**
	 * Mode indicates how to include external Fennel files into the script.
	 *
	 * Can be APPEND, EVALUATE or INCLUDE.
	 *
	 * APPEND mode with append the library code to the script code, when running in this mode the include method cannot be used during runtime
	 *
	 * EVALUATE node with evaluate the library code during runtime, include method may still be used.
	 *
	 * INCLUDE mode will include the file as a global script, these libraries are not unloaded after the script or application is terminated.
	 *
	 * @property mode
	 * @type {number}
	 */
	this.mode = mode !== undefined ? mode : FennelScript.APPEND;

	/**
	 * Compiled function used during runtime.
	 *
	 * This varible gets created using the compileCode() function called automatically on initalization.
	 *
	 * @attribute script
	 * @type {Function}
	 */
	this.script = {};

	/**
	 * Reference to the program object.
	 *
	 * Can be used to access other scenes, get resources and objects.
	 *
	 * @property program
	 * @type {Program}
	 */
	this.program = null;

	/**
	 * Reference to the scene where the script is placed.
	 *
	 * Can be used to interact with other objects.
	 *
	 * @property scene
	 * @type {Scene}
	 */
	this.scene = null;
}

FennelScript.prototype = Object.create(Group.prototype);

/**
 * Regular expression to obtain all the include calls placed inside of scripts.
 *
 * @attribute includeRegex
 * @type {RegExp}
 */
FennelScript.includeRegex = /include[ ]*\([ \n]*["'].+?["'][ \n]*\);*/gi;
FennelScript.includeRegexStart = /include[ ]*\([ \n]*["']/gi;
FennelScript.includeRegexEnd = /["'][ \n]*\);*/gi;

/**
 * Default script code used when creating a new Script.
 *
 * @attribute DEFAULT
 * @type {string}
 */
FennelScript.DEFAULT = `
(js.global.console:log "Hello World !")
`;

/**
 * List of default methods that can be implemented by scripts.
 *
 * This list is used to search for these implementations in the script object at runtime.
 *
 * @attribute METHODS
 * @type {Array}
 */
FennelScript.METHODS = ["initialize", "update", "dispose", "onMouseOver", "onResize", "onAppData"];

/**
 * Append libraries on initialization.
 *
 * Libraries are appended to the script code on initialization.
 *
 * @attribute APPEND
 * @type {number}
 */
FennelScript.APPEND = 100;

/**
 * Evaluate libs during runtime.
 *
 * This allows to load new libs during runtime, but its not possible to access private statements.
 *
 * @attribute EVALUATE
 * @type {number}
 */
FennelScript.EVALUATE = 101;

/**
 * Include file into the document.body.
 *
 * This imports the JS file as any other file included into a <script> tag.
 *
 * @attribute INCLUDE
 * @type {number}
 */
FennelScript.INCLUDE = 102;

/**
 * Get includes from the code, includes are fetched from the resource manager or if not found fetched using XHR.
 *
 * Used to extract includes from code when loading libraries in APPEND mode.
 *
 * @static
 * @method getIncludes
 * @param {string} code Script code.
 */
FennelScript.getIncludes = function(code)
{
	// TODO
};

/**
 * Remove comments from Fennel code using regex.
 *
 * @method removeComments
 * @param {string} code Input Fennel code.
 * @return {string} The processed Fennel code.
 */
FennelScript.removeComments = function(code)
{
	return code; // TODO
};

/**
 * Remove includes from code.
 *
 * Used to remove include statements when initializing code in APPEND mode.
 *
 * @static
 * @method removeIncludes
 * @param {string} code Fennel code.
 */
FennelScript.removeIncludes = function(code)
{
	return code;
};

/**
 * Initialize script, code automatically called by the runtime on program initialization.
 *
 * Compiles the script code and calls the script initialize method if it exists after the code is compiled.
 *
 * @method initialize
 */
FennelScript.prototype.initialize = function()
{
	var node = this;
	while (node.parent !== null)
	{
		node = node.parent;
		if (node instanceof Scene)
		{
			this.scene = node;
		}
		else if (node instanceof Program)
		{
			this.program = node;
		}
	}

	Object3D.prototype.initialize.call(this);

	var self = this;

	this.compileCode(this.code, function()
	{
		if (self.script.initialize !== undefined)
		{
			self.script.initialize.call(self);
		}
	});
};

/**
 * Update script state automatically calls for mouse events if they are defined and for the script update method.
 *
 * This method is executed every frame, script logic should not relly on the frame time, use the "delta" value provided.
 *
 * @method update
 */
FennelScript.prototype.update = function(delta)
{
	if (this.script.onMouseOver !== undefined)
	{
		var intersections = this.scene.raycaster.intersectObjects(this.children, true);
		if (intersections.length > 0)
		{
			this.script.onMouseOver.call(this, intersections);
		}
	}

	if (this.script.update !== undefined)
	{
		this.script.update.call(this, delta);
	}

	Object3D.prototype.update.call(this, delta);
};

/**
 * Disposes the script, can be used to clear resources when the program exits.
 *
 * Calls the script dispose method if it exists.
 *
 * @method dispose
 */
FennelScript.prototype.dispose = function()
{
	if (this.script.dispose !== undefined)
	{
		this.script.dispose.call(this);
	}

	Object3D.prototype.dispose.call(this);
};

/**
 * Call resize method if available.
 *
 * The resize method receives width and height as arguments.
 *
 * @method resize
 */
FennelScript.prototype.resize = function(x, y)
{
	if (this.script.onResize !== undefined)
	{
		this.script.onResize.call(this, x, y);
	}
};

/**
 * Call onAppData() from the script if available.
 *
 * This method is called everytime that external data is passed to the runtime.
 *
 * @method appData
 * @param {Object} data
 */
FennelScript.prototype.appData = function(data)
{
	if (this.script.onAppData !== undefined)
	{
		this.script.onAppData.call(this, data);
	}
};

/**
 * Prepare the script code to be run. The script can be prepared using different methods depending on the include mode defined.
 *
 * Can be used to dinamically change the script code. However it is not recommended can lead to undefined behavior.
 *
 * @method compileCode
 * @param {string} code
 * @param {Function} onReady Funtion called when the code is ready.
 */
FennelScript.prototype.compileCode = function(code, onReady)
{
	// TODO
};

/**
 * Create a object to access the context of this script.
 *
 * Also includes the access to three cannon and engine methods.
 *
 * @method createContextObject
 * @return {Object} Context object for the script to access data.
 */
FennelScript.prototype.createContextObject = function()
{
	var context = {};

	Object.assign(context, CANNON);
	Object.assign(context, THREE);
	Object.assign(context, FWE);

	var mathProps = ["E", "LN2", "LN10", "LOG2E", "LOG10E", "PI", "SQRT1_2", "SQRT2", "abs", "acos", "acosh", "asin", "asinh", "atan", "atan2", "atanh", "cbrt", "ceil", "clz32", "cos", "cosh", "exp", "expm1", "floor", "fround", "hypot", "imul", "log", "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"];
	var math = {};
	for (var i of mathProps)
	{
		math[i] = window.Math[i];
	}
	Object.assign(math, THREE.Math);

	Object.assign(context,
		{
			self: this,
			program: this.program,
			scene: this.scene,
			THREE: THREE,
			CANNON: CANNON,
			Math: math,
			Keyboard: this.program.keyboard,
			Mouse: this.program.mouse
		});

	return context;
};

FennelScript.prototype.toJSON = function(meta)
{
	var data = Object3D.prototype.toJSON.call(this, meta);

	data.object.code = this.code;
	data.object.mode = this.mode;

	return data;
};

export {FennelScript};
