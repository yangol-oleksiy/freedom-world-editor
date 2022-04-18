import {LocalStorage} from "../core/utils/LocalStorage.js";
import {RendererConfiguration} from "../core/renderer/RendererConfiguration.js";
import {Viewport} from "../core/objects/cameras/Viewport.js";
import {FWE} from "../core/FWE.js";
import {FileSystem} from "../core/FileSystem.js";

/**
 * Settings store all user configurable settings of the editor.
 *
 * Everything regarding editor, code analysis, rendering etc is stored in this object.
 *
 * @constructor
 * @class Settings
 */
function Settings()
{
	this.loadDefault();
}

/**
 * Path to the configuration file if running ouside of the browser.
 *
 * @static
 * @attribute CONFIG_FILE
 * @type {string}
 */
Settings.CONFIG_FILE = "config.json";

/**
 * Angle in radians, stores the radian symbol as used in the UnitConverter.
 *
 * @static
 * @attribute RADIAN
 * @type {string}
 */
Settings.RADIAN = "r";

/**
 * Angle in degrees, stores the degree symbol as used in the UnitConverter.
 *
 * @static
 * @attribute RADIAN
 * @type {string}
 */
Settings.DEGREE = "d";

// Distance
Settings.METER = "m";

// Navigation
Settings.FIRST_PERSON = 10;
Settings.ORBIT = 11;
Settings.PLANAR_LEFT = 12;
Settings.PLANAR_RIGHT = 13;
Settings.PLANAR_FRONT = 14;
Settings.PLANAR_BACK = 15;
Settings.PLANAR_TOP = 16;
Settings.PLANAR_BOTTOM = 17;

// Update channel
Settings.STABLE = 30;
Settings.BETA = 31;

// Load default settings
Settings.prototype.loadDefault = function()
{
	// General
	this.general =
	{
		autoUpdate: false,
		theme: "dark",
		filePreviewSize: 70,
		showStats: true,
		showUUID: true,
		showType: true,
		immediateMode: false,
		historySize: 20,
		ignorePixelRatio: false
	};

	// Units
	this.units =
	{
		/**
		 * The units to use for angle in the editor, for most object the base units are radians. Use the UnitConvert to ensure the correct format.
		 *
		 * For example if the object data is natively in radians call UnitConverter.convert(angle, "r", Editor.settings.units.angle);
		 *
		 * @type {string}
		 * @attribute angle
		 */
		angle: Settings.RADIAN,

		distance: Settings.METER
	};

	// Editor
	this.editor =
	{
		snap: false,
		keepTransformMove: true,
		gridSize: 500,
		gridSpacing: 5,
		gridEnabled: true,
		gridFixed: false,
		axisEnabled: true,
		cameraPreviewEnabled: true,
		cameraPreviewSize: 200,
		cameraPreviewPosition: Viewport.BOTTOM_RIGHT,
		lockMouse: true,
		transformationSpace: "world",
		navigation: Settings.ORBIT,
		invertNavigation: false,
		invertHorizontalNavigation: false,
		keyboardNavigation: false,
		keyboardNavigationSpeed: 0.5,
		mouseLookSensitivity: 0.002,
		mouseMoveSpeed: 0.001,
		mouseWheelSensitivity: 0.0005,
		cameraRotationCube: true,
		cameraRotationCubeSize: 120
	};

	// Render
	this.render = new RendererConfiguration();
	this.render.followProject = true;

	// Code
	this.code =
	{
		theme: "monokai",
		keymap: "sublime",
		fontSize: 14,
		lineNumbers: true,
		lineWrapping: false,
		autoCloseBrackets: true,
		highlightActiveLine: false,
		showMatchesOnScrollbar: true,
		dragFiles: true,
		indentWithTabs: true,
		tabSize: 4,
		indentUnit: 4,
		vimMode: false,
		smartIndent: false,
		matchBrackets: true
	};

	// JSLint
	this.jslint =
	{
		// Error
		maxerr: 50, // {int} Maximum error before stopping

		// Enforcing
		bitwise: false, // true: Prohibit bitwise operators (&, |, ^, etc.)
		curly: false, // true: Require {} for every new block or scope
		eqeqeq: false, // true: Require triple equals (===) for comparison
		forin: false, // true: Require filtering for..in loops with obj.hasOwnProperty()
		freeze: true, // true: prohibits overwriting prototypes of native objects such as Array, Date etc.
		latedef: false, // true: Require variables/functions to be defined before being used
		noarg: true, // true: Prohibit use of `arguments.caller` and `arguments.callee`
		nonbsp: true, // true: Prohibit non-breaking whitespace characters.
		nonew: false, // true: Prohibit use of constructors for side-effects (without assignment)
		plusplus: false, // true: Prohibit use of `++` and `--`
		undef: false, // true: Require all non-global variables to be declared (prevents global leaks)
		unused: false, // Unused variables:
		// true: all variables, last function parameter
		// "vars": all variables only
		// "strict": all variables, all function parameters
		strict: false, // true: Requires all functions run in ES5 Strict Mode
		maxparams: false, // {int} Max number of formal params allowed per function
		maxdepth: false, // {int} Max depth of nested blocks (within functions)
		maxstatements: false, // {int} Max number statements per function
		maxcomplexity: false, // {int} Max cyclomatic complexity per function
		varstmt: false, // true: Disallow any var statements. Only `let` and `const` are allowed.

		// Relaxing
		asi: true, // true: Tolerate Automatic Semicolon Insertion (no semicolons)
		boss: true, // true: Tolerate assignments where comparisons would be expected
		debug: true, // true: Allow debugger statements e.g. browser breakpoints.
		eqnull: true, // true: Tolerate use of `== null`
		esversion: 6, // {int} Specify the ECMAScript version to which the code must adhere.
		moz: true, // true: Allow Mozilla specific syntax (extends and overrides esnext features)
		evil: true, // true: Tolerate use of `eval` and `new Function()`
		expr: true, // true: Tolerate `ExpressionStatement` as Programs
		funcscope: true, // true: Tolerate defining variables inside control statements
		iterator: true, // true: Tolerate using the `__iterator__` property
		lastsemic: true, // true: Tolerate omitting a semicolon for the last statement of a 1-line block
		laxbreak: false, // true: Tolerate possibly unsafe line breakings
		loopfunc: true, // true: Tolerate functions being defined in loops
		noyield: false, // true: Tolerate generator functions with no yield statement in them.
		notypeof: true, // true: Tolerate invalid typeof operator values
		proto: true, // true: Tolerate using the `__proto__` property
		scripturl: false, // true: Tolerate script-targeted URLs
		shadow: true, // true: Allows re-define variables later in code e.g. `var x=1; x=2;`
		sub: true, // true: Tolerate using `[]` notation when it can still be expressed in dot notation
		supernew: true, // true: Tolerate `new function () { ... };` and `new Object;`
		validthis: true, // true: Tolerate using this in a non-constructor function

		// Environment
		browser: true, // Web Browser (window, document, etc)
		browserify: false, // Browserify (node.js code in the browser)
		couch: false, // CouchDB
		devel: true, // Development/debugging (alert, confirm, etc)
		dojo: false, // Dojo Toolkit
		jasmine: false, // Jasmine
		jquery: false, // jQuery
		mocha: true, // Mocha
		mootools: false, // MooTools
		node: false, // Node.js
		nonstandard: false, // Widely adopted globals (escape, unescape, etc)
		phantom: false, // PhantomJS
		prototypejs: false, // Prototype and Scriptaculous
		qunit: false, // QUnit
		rhino: false, // Rhino
		shelljs: false, // ShellJS
		typed: false, // Globals for typed array constructions
		worker: false, // Web Workers
		wsh: false, // Windows Scripting Host
		yui: false // Yahoo User Interface
	};

	this.libraries = [
		document.location.protocol + '//' + document.location.host + '/files/3dlib/'
	];
};

/**
 * Store settings in the local storage.
 *
 * @method store
 */
Settings.prototype.store = function()
{
	var data = JSON.stringify(
		{
			general: this.general,
			editor: this.editor,
			units: this.units,
			render: this.render,
			code: this.code,
			jslint: this.jslint
		}, null, "\t");

	// Make json file human readable
	data.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, "$1");

	// Store file
	if (FWE.runningOnDesktop())
	{
		FileSystem.writeFile(Settings.CONFIG_FILE, data);
	}
	// Cookie
	else
	{
		LocalStorage.set("config", data);
	}
};

/**
 * Load settings from the local storage.
 *
 * @method load
 */
Settings.prototype.load = function()
{
	try
	{
		if (FWE.runningOnDesktop())
		{
			var data = JSON.parse(FileSystem.readFile(Settings.CONFIG_FILE));
		}
		else
		{
			var data = LocalStorage.get("config");
		}

		for (var i in data)
		{
			if (this[i] === undefined)
			{
				this[i] = {};
			}

			for (var j in data[i])
			{
				this[i][j] = data[i][j];
			}
		}
	}
	catch (e)
	{
		console.warn("Freedom World Editor: Failed to load configuration file");
	}
};
export {Settings};
