import {Object3D, Material, Texture, Geometry, BufferGeometry, Shape, Math, BoxBufferGeometry, MeshStandardMaterial, SpriteMaterial} from "three";
import {EventManager} from "../core/utils/EventManager.js";
import {Video} from "../core/resources/Video.js";
import {TextFile} from "../core/resources/TextFile.js";
import {Resource} from "../core/resources/Resource.js";
import {Image} from "../core/resources/Image.js";
import {Font} from "../core/resources/Font.js";
import {Audio} from "../core/resources/Audio.js";
import {Scene} from "../core/objects/Scene.js";
import {Program} from "../core/objects/Program.js";
import {Sky} from "../core/objects/misc/Sky.js";
import {Mesh} from "../core/objects/mesh/Mesh.js";
import {FWE} from "../core/FWE.js";
import {ObjectLoader} from "../core/loaders/ObjectLoader.js";
import {Keyboard} from "../core/input/Keyboard.js";
import {FileSystem} from "../core/FileSystem.js";
import {AmbientLight} from "../core/objects/lights/AmbientLight";
import {Locale} from "./locale/LocaleManager.js";
import {VirtualClipboard} from "./utils/VirtualClipboard.js";
import {Settings} from "./Settings.js";
import {Loaders} from "./Loaders.js";
import {ResourceCrawler} from "./history/ResourceCrawler.js";
import {History} from "./history/History.js";
import {RemoveResourceAction} from "./history/action/resources/RemoveResourceAction.js";
import {AddResourceAction} from "./history/action/resources/AddResourceAction.js";
import {RemoveAction} from "./history/action/objects/RemoveAction.js";
import {AddAction} from "./history/action/objects/AddAction.js";
import {ChangeAction} from "./history/action/ChangeAction.js";
import {ActionBundle} from "./history/action/ActionBundle.js";
import {Action} from "./history/action/Action.js";
import {SceneEditor} from "./gui/tab/scene-editor/SceneEditor.js";
import {CodeEditor} from "./gui/tab/code/CodeEditor.js";
import {Interface} from "./gui/Interface.js";
import {Global} from "./Global.js";
import {LoadingModal} from "./components/modal/LoadingModal.js";
import {DocumentBody} from "./components/DocumentBody.js";

/**
 * Main editor entry point.
 *
 * @class Editor
 */
function Editor() {}

/**
 * Initialize the editor code, creates all GUI elements, loads configuration data, starts all the event lsiteners required.
 *
 * Called when the application starts.
 *
 * @static
 * @method initialize
 */
Editor.initialize = function()
{
	// Check WebGL Support
	if (!FWE.webGLAvailable())
	{
		Editor.alert(Locale.webglNotSupported);
		Editor.exit();
	}

	// Settings
	Editor.settings = new Settings();
	Editor.settings.load();

	// Register tern plugins
	Editor.ternDefinitions = [];
	Editor.ternDefinitions.push(JSON.parse(FileSystem.readFile(Global.FILE_PATH + "tern/threejs.json")));
	Editor.ternDefinitions.push(JSON.parse(FileSystem.readFile(Global.FILE_PATH + "tern/browser.json")));
	Editor.ternDefinitions.push(JSON.parse(FileSystem.readFile(Global.FILE_PATH + "tern/ecmascript.json")));

	// Disable body overflow
	document.body.style.overflow = "hidden";
	document.body.style.fontFamily = "var(--font-main-family)";
	document.body.style.color = "var(--font-main-color)";
	document.body.style.fontSize = "var(--font-main-size)";

	// Disable context menu
	document.body.oncontextmenu = function()
	{
		return false;
	};

	// Watch for changes in the screen pixel ratio (drag between screens)
	window.matchMedia("screen and (min-resolution: 2dppx)").addListener(function()
	{
		Editor.resize();
	});

	if (FWE.runningOnDesktop())
	{
		var gui = window.require("nw.gui");
		Editor.clipboard = gui.Clipboard.get();
		Editor.args = gui.App.argv;

		// Handle window close event
		gui.Window.get().on("close", function()
		{
			if (confirm(Locale.unsavedChangesExit))
			{
				Editor.exit();
			}
		});

		// Try to update the editor
		if (Editor.settings.general.autoUpdate)
		{
			Editor.updateFWE();
		}
	}
	else
	{
		// Clipboard
		Editor.clipboard = new VirtualClipboard();

		// Arguments
		Editor.args = [];

		var parameters = FWE.getQueryParameters();
		for (var i in parameters)
		{
			Editor.args.push(parameters[i]);
		}

		// Prevent some key combinations
		var allowedKeys = [Keyboard.C, Keyboard.V, Keyboard.A, Keyboard.X];
		document.onkeydown = function(event)
		{
			// If F1-F11 or CTRL+Key prevent default action
			if (event.keyCode > Keyboard.F1 && event.keyCode < Keyboard.F11 || !event.altKey && event.ctrlKey && allowedKeys.indexOf(event.keyCode) === -1)
			{
				event.preventDefault();
			}
		};

		// Store settings when exiting the page
		window.onbeforeunload = function(event)
		{
			Editor.settings.store();

			var message = Locale.unsavedChangesExit;
			event.returnValue = message;
			return message;
		};
	}

	// Open ISP file if dragged to the window
	document.body.ondrop = function(event)
	{
		event.preventDefault();

		for (var i = 0; i < event.dataTransfer.files.length; i++)
		{
			var file = event.dataTransfer.files[i];
			var extension = FileSystem.getFileExtension(file.name);
			if (TextFile.fileIsText(file))
			{
				Loaders.loadText(file);
			}
		}
	};

	// Open file
	Editor.openFile = null;

	// Selected object
	Editor.selection = [];

	// Program
	Editor.program = null;

	// History
	Editor.history = null;

	// Initialize User Interface
	Editor.gui = new Interface();
	Editor.gui.updateInterface();

	// Create new program
	if (Editor.program === null)
	{
		Editor.createNewProgram();
	}

	// Event manager
	Editor.manager = new EventManager();
	Editor.manager.add(document.body, "keydown", function(event)
	{
		var key = event.keyCode;

		if (event.ctrlKey)
		{
			if (key === Keyboard.W || key === Keyboard.F4)
			{
				Editor.gui.tab.closeActual();
			}
			else if (key === Keyboard.TAB || key === Keyboard.PAGE_DOWN)
			{
				Editor.gui.tab.selectNextTab();
			}
			else if (key === Keyboard.PAGE_UP)
			{
				Editor.gui.tab.selectPreviousTab();
			}
			else if (key === Keyboard.Z)
			{
				var tabs = Editor.gui.tab.getActiveTab();
				for (var i = 0; i < tabs.length; i++)
				{
					if (tabs[i] instanceof CodeEditor)
					{
						return;
					}
				}

				Editor.undo();
			}
			else if (key === Keyboard.Y)
			{
				var tabs = Editor.gui.tab.getActiveTab();
				for (var i = 0; i < tabs.length; i++)
				{
					if (tabs[i] instanceof CodeEditor)
					{
						return;
					}
				}

				Editor.redo();
			}
		}
		else if (key === Keyboard.DEL)
		{
			var tabs = Editor.gui.tab.getActiveTab();
			for (var i = 0; i < tabs.length; i++)
			{
				if (tabs[i] instanceof CodeEditor)
				{
					return;
				}
			}

			if (Editor.hasObjectSelected())
			{
				var del = Editor.confirm(Locale.deleteObjects);
				if (del)
				{
					Editor.deleteObject();
				}
			}
		}
		else if (key === Keyboard.F2)
		{
			Editor.renameObject();
		}
	});
	Editor.manager.create();
};

/**
 * Select single object.
 *
 * @method selectObject
 * @param {Object3D} object Object to select.
 */
Editor.selectObject = function(object)
{
	for (var i = 0; i < Editor.selection.length; i++)
	{
		if (Editor.selection[i].gui !== undefined && Editor.selection[i].gui.node !== undefined)
		{
			Editor.selection[i].gui.node.setSelected(false);
		}
	}

	Editor.selection = [object];

	if (object.gui !== undefined && object.gui.node !== undefined)
	{
		if (object.gui.node.setSelected !== undefined)
		{
			object.gui.node.setSelected(true);
		}
		if (object.gui.node.expandToRoot !== undefined)
		{
			object.gui.node.expandToRoot();
		}
	}

	Editor.updateSelectionGUI();
};

/**
 * Add object to selection.
 *
 * @method addToSelection
 * @param {Object3D} object Object to add to selection.
 * @param {boolean} updateClient If false does not update the management client.
 */
Editor.addToSelection = function(object)
{
	Editor.selection.push(object);

	if (object.gui !== undefined && object.gui.node !== undefined)
	{
		if (object.gui.node.setSelected !== undefined)
		{
			object.gui.node.setSelected(true);
		}
		if (object.gui.node.expandToRoot !== undefined)
		{
			object.gui.node.expandToRoot();
		}
	}

	Editor.updateSelectionGUI();
};

/**
 * Remove from selection.
 *
 * @method unselectObject
 * @param {Object3D} object Object to remove from selection.
 */
Editor.unselectObject = function(object)
{
	for (var i = 0; i < Editor.selection.length; i++)
	{
		if (Editor.selection[i].uuid === object.uuid)
		{
			if (Editor.selection[i].gui !== undefined && Editor.selection[i].gui.node !== undefined)
			{
				if (Editor.selection[i].gui.node.setSelected !== undefined)
				{
					Editor.selection[i].gui.node.setSelected(false);
				}
			}

			Editor.selection.splice(i, 1);
			Editor.updateSelectionGUI();
			return;
		}
	}
};

/**
 * Get device pixel ratio based on the editor configuration.
 *
 * @static
 * @method getPixelRatio
 * @return {number} Device pixel ratio.
 */
Editor.getPixelRatio = function()
{
	return Editor.settings.general.ignorePixelRatio ? 1.0 : window.devicePixelRatio;
};

/**
 * Check if a object is selected.
 *
 * @method isSelected
 * @param {Object3D} Check if object is selected.
 */
Editor.isSelected = function(object)
{
	for (var i = 0; i < Editor.selection.length; i++)
	{
		if (Editor.selection[i].uuid === object.uuid)
		{
			return true;
		}
	}

	return false;
};

/**
 * Resize the editor to fit the document body.
 *
 * @static
 * @method resize
 */
Editor.resize = function()
{
	if (!FWE.isFullscreen())
	{
		Editor.gui.updateInterface();
	}
};

/**
 * Check if there is some object selected.
 *
 * @static
 * @method hasObjectSelected
 * @return {boolean} True if there is an object selected.
 */
Editor.hasObjectSelected = function()
{
	return Editor.selection.length > 0;
};

/**
 * Clear object selection.
 *
 * @method clearSelection
 */
Editor.clearSelection = function()
{
	for (var i = 0; i < Editor.selection.length; i++)
	{
		if (Editor.selection[i].gui !== undefined && Editor.selection[i].gui.node !== undefined)
		{
			if (Editor.selection[i].gui.node.setSelected !== undefined)
			{
				Editor.selection[i].gui.node.setSelected(false);
			}
		}
	}

	Editor.selection = [];
};

/**
 * Add action to history.
 *
 * Automatically calls the change method of GUI elements.
 *
 * @method addAction
 * @param {Action} action Action to add to the history.
 */
Editor.addAction = function(action)
{
	Editor.history.add(action);
};

/**
 * Get currently active scene in the editor.
 *
 * @static
 * @method getScene
 * @return {Scene} The scene currently active in the editor, null if none available.
 */
Editor.getScene = function()
{
	if (Editor.program.children.length > 0)
	{
		return Editor.program.children[0];
	}

	return null;
};

/**
 * Get currently active scene coords system of the editor.
 *
 * @static
 * @method getCoordsSystem
 * @return {String} Coordinate system, 'xyz' or 'xzy'
 */
Editor.getCoordsSystem = function()
{
	var scene = Editor.getScene();

	return scene.parent.coordsSystem === Program.CS_XYZ ? 'xyz' : 'xzy';
};

/**
 * Add objects to a parent, and creates an action in the editor history.
 *
 * If no parent is specified it adds to object to the current scene.
 *
 * @static
 * @method addObject
 * @param {Object3D} object Object to be added.
 * @param {Object3D} parent Parent object, if undefined the program scene is used.
 */
Editor.addObject = function(object, parent)
{
	if (parent === undefined)
	{
		parent = Editor.getScene();
	}

	var actions = [new AddAction(object, parent)];
	var resources = ResourceCrawler.searchObject(object, Editor.program);

	for (var category in resources)
	{
		for (var resource in resources[category])
		{
			actions.push(new AddResourceAction(resources[category][resource], Editor.program, category));
		}
	}

	Editor.addAction(new ActionBundle(actions));
};

/**
 * Rename object, if none passed as argument selected object is used.
 *
 * @static
 * @method renameObject
 * @param {Object3D} object Object to be renamed.
 */
Editor.renameObject = function(object)
{
	if (object === undefined)
	{
		if (Editor.hasObjectSelected())
		{
			object = Editor.selection[0];
		}
		else
		{
			return;
		}
	}

	if (!object.locked)
	{
		var name = Editor.prompt(Locale.renameObject, object.name);
		if (name !== null && name !== "")
		{
			Editor.addAction(new ChangeAction(object, "name", name));
		}
	}
};


/**
 * Delete object from the editor, and creates an action in the editor history.
 *
 * @method deleteObject
 * @param {Array} objects List of objects.
 */
Editor.deleteObject = function(object)
{
	var selected = object === undefined ? Editor.selection : [object];

	// List of delete actions
	var actions = [];

	// Delect selection
	for (var i = 0; i < selected.length; i++)
	{
		// Object3D
		if (selected[i].isObject3D && !selected[i].locked && !(selected[i] instanceof Program))
		{
			actions.push(new RemoveAction(selected[i]));
		}
		// Material
		else if (selected[i] instanceof Material)
		{
			Editor.addAction(new RemoveResourceAction(selected[i], Editor.program, "materials"));
		}
		// Texture
		else if (selected[i] instanceof Texture)
		{
			Editor.addAction(new RemoveResourceAction(selected[i], Editor.program, "textures"));
		}
		// Font
		else if (selected[i] instanceof Font)
		{
			Editor.addAction(new RemoveResourceAction(selected[i], Editor.program, "fonts"));
		}
		// Audio
		else if (selected[i] instanceof Audio)
		{
			Editor.addAction(new RemoveResourceAction(selected[i], Editor.program, "audio"));
		}
		// Video
		else if (selected[i] instanceof Video)
		{
			Editor.addAction(new RemoveResourceAction(selected[i], Editor.program, "videos"));
		}
		// Geometries
		else if (selected[i] instanceof Geometry || selected[i] instanceof BufferGeometry)
		{
			Editor.addAction(new RemoveResourceAction(selected[i], Editor.program, "geometries"));
		}
		// Shapes
		else if (selected[i] instanceof Shape)
		{
			Editor.addAction(new RemoveResourceAction(selected[i], Editor.program, "shapes"));
		}
		// Resources
		else if (selected[i] instanceof Resource)
		{
			Editor.addAction(new RemoveResourceAction(selected[i], Editor.program, "resources"));
		}
		// Unknown
		else
		{
			console.warn("Freedom World Editor: Cant delete type of object.");
		}
	}

	// Check if any action was added
	if (actions.length > 0)
	{
		Editor.addAction(new ActionBundle(actions));
	}
};

/**
 * Copy selected object to the clipboard.
 *
 * Uses the JSON serialization of the object.
 *
 * @static
 * @method copyObject
 * @param {Object3D} object Object to copy.
 */
Editor.copyObject = function(object)
{
	// If no object passed copy selected object
	if (object === undefined)
	{
		if (Editor.hasObjectSelected())
		{
			object = Editor.selection[0];
		}
		else
		{
			return;
		}
	}

	if (object instanceof Program || object instanceof Scene)
	{
		return;
	}

	if (!object.locked)
	{
		Editor.clipboard.set(JSON.stringify(object.toJSON()), "text");
	}
};

/**
 * Cut selected object, copy to the clipboard and delete it.
 *
 * Uses the JSON serialization of the object.
 *
 * @static
 * @method copyObject
 * @param {Object3D} object Object to copy.
 */
Editor.cutObject = function(object)
{
	if (object === undefined)
	{
		if (Editor.hasObjectSelected())
		{
			object = Editor.selection[0];
		}
		else
		{
			return;
		}
	}

	// Avoid cutting program or scene objects
	if (object instanceof Program || object instanceof Scene)
	{
		return;
	}

	if (!object.locked)
	{
		Editor.clipboard.set(JSON.stringify(object.toJSON()), "text");
		Editor.addAction(new RemoveAction(object));
	}
};

/**
 * Paste object as children of target object.
 *
 * @static
 * @method pasteObject
 * @param {Object3D} parent
 */
Editor.pasteObject = function(target)
{
	try
	{
		var content = Editor.clipboard.get("text");
		var data = JSON.parse(content);

		// Create object
		var obj = new ObjectLoader().parse(data);
		obj.traverse(function(child)
		{
			child.uuid = Math.generateUUID();
		});

		// Add object to target
		if (target !== undefined && !target.locked)
		{
			Editor.addObject(obj, target);
		}
		else
		{
			Editor.addObject(obj);
		}
	}
	catch (e)
	{
		Editor.alert(Locale.errorPaste);
	}
};

/**
 * Redo history action.
 *
 * @method redo
 */
Editor.redo = function()
{
	if (Editor.history.redo())
	{
		Editor.updateObjectsViewsGUI();
	}
	else
	{
		Editor.alert(Locale.nothingToRedo);
	}
};

/**
 * Undo history action.
 *
 * @method undo
 */
Editor.undo = function()
{
	if (Editor.history.undo())
	{
		Editor.updateObjectsViewsGUI();
	}
	else
	{
		Editor.alert(Locale.nothingToUndo);
	}
};

/**
 * Create default resources to be used when creating new objects.
 *
 * @static
 * @method createDefaultResources
 */
Editor.createDefaultResources = function()
{
	Editor.defaultImage = new Image(Global.FILE_PATH + "uv_color.jpg");
	Editor.defaultFont = new Font(Global.FILE_PATH + "default.json");
	Editor.defaultAudio = new Audio(Global.FILE_PATH + "default.mp3");

	Editor.defaultTexture = new Texture(Editor.defaultImage);
	Editor.defaultTexture.name = "texture";

	Editor.defaultTextureParticle = new Texture(new Image(Global.FILE_PATH + "particle.png"));
	Editor.defaultTextureParticle.name = "particle";

	Editor.defaultImageTerrain = new Image(Global.FILE_PATH + "terrain.png");
	Editor.defaultImageTerrain.name = "terrain";

	Editor.defaultGeometry = new BoxBufferGeometry(1, 1, 1);
	Editor.defaultGeometry.name = "box";

	Editor.defaultMaterial = new MeshStandardMaterial({roughness: 0.6, metalness: 0.2});
	Editor.defaultMaterial.name = "standard";

	Editor.defaultSpriteMaterial = new SpriteMaterial({map: Editor.defaultTexture, color: 0xFFFFFF});
	Editor.defaultSpriteMaterial.name = "sprite";

	Editor.defaultTextureLensFlare = [];
	for (var i = 0; i < 4; i++)
	{
		var texture = new Texture(new Image(Global.FILE_PATH + "lensflare/lensflare" + i + ".png"));
		texture.name = "lensflare" + i;
		Editor.defaultTextureLensFlare.push(texture);
	}
};

Editor.updateSettings = function()
{
	Editor.gui.tab.updateSettings();
};

/**
 * Update all object views
 *
 * @static
 * @method updateObjectsViewsGUI
 */
Editor.updateObjectsViewsGUI = function()
{
	Editor.gui.tab.updateObjectsView();
	Editor.gui.tab.updateMetadata();
};

/**
 * Update tabs after changing selection.
 *
 * @static
 * @method updateSelectionGUI
 */
Editor.updateSelectionGUI = function()
{
	Editor.gui.tab.updateMetadata();
	Editor.gui.tab.updateSelection();
};

/**
 * Reset the editor state.
 *
 * @static
 * @method resetEditor
 */
Editor.resetEditor = function()
{
	Editor.clearSelection();

	Editor.gui.tab.updateObjectsView();
	Editor.gui.tab.updateMetadata();
	Editor.gui.tab.updateSelection();
};

/**
 * Create a program and set to the editor.
 *
 * @method createNewProgram
 */
Editor.createNewProgram = function()
{
	var program = new Program();

	Editor.createDefaultResources();
	Editor.setProgram(program);
	Editor.addDefaultScene(Editor.defaultMaterial);
	Editor.setOpenFile(null);
};

/**
 * Create a program and set to the editor.
 *
 * @method createNewXYZProgram
 */
Editor.createNewXYZProgram = function()
{
	var program = new Program();
	program.coordsSystem = Program.CS_XYZ;

	Editor.createDefaultResources();
	Editor.setProgram(program);
	Editor.addXYZScene(Editor.defaultMaterial);
	Editor.setOpenFile(null);
};

/**
 * Create a program with XZY coordinate system set and set to the editor.
 *
 * @method createNewProgram
 */
Editor.createNewXZYProgram = function()
{
	var program = new Program();
	program.coordsSystem = Program.CS_XZY;

	Editor.createDefaultResources();
	Editor.setProgram(program);
	Editor.addXZYScene(Editor.defaultMaterial);
	Editor.setOpenFile(null);
};

/**
 * Create standard material if no material given
 *
 * @method maybeCreateStandardMaterial
 * @param {Material} material Material used by objects, if empty a new material is created
 */
Editor.maybeCreateStandardMaterial = function(material)
{
	if (material === undefined)
	{
		material = new MeshStandardMaterial({roughness: 0.6, metalness: 0.2});
		material.name = "default";
	}

	return material;
};

/**
 * Create a scene using a default template.
 *
 * This is the scene used when creating a new program or scene inside the editor.
 *
 * @method addDefaultScene
 * @param {Material} material Default material used by objects, if empty a new material is created
 */
Editor.addDefaultScene = function(material)
{
	Editor.addXZYScene(material);
};

/**
 * Create a scene using a XYZ coordinate system template.
 *
 * @method addXYZScene
 * @param {Material} material Default material used by objects, if empty a new material is created
 */
Editor.addXYZScene = function(material)
{
	THREE.Object3D.DefaultUp.set(0, 1, 0);

	material = this.maybeCreateStandardMaterial(material);

	// Create new scene
	var scene = new Scene();

	// Sky
	var sky = new Sky(undefined, undefined, undefined, undefined, 'xyz');
	sky.autoUpdate = false;
	scene.add(sky);

	// Floor
	var ground = new BoxBufferGeometry(20, 1, 20);
	ground.name = "ground";

	var model = new Mesh(ground, material);
 	model.position.set(0, -1.0, 0);
	model.name = "ground";
	scene.add(model);

	// Add scene to program
	Editor.addObject(scene, Editor.program);

	// Open scene
	var tab = Editor.gui.tab.addTab(SceneEditor, true);
	tab.attach(scene);
};

/**
 *  Create a scene using a XZY coordinate system template.
 *
 * This is the scene used when creating a new program or scene inside the editor.
 *
 * @method addXZYScene
 * @param {Material} material Default material used by objects, if empty a new material is created
 */
Editor.addXZYScene = function(material)
{
	THREE.Object3D.DefaultUp.set(0, 0, 1);

	material = this.maybeCreateStandardMaterial(material);

	// Create new scene
	var scene = new Scene();

	// Sky
	var sky = new Sky(undefined, undefined, undefined, undefined, 'xzy');
	sky.autoUpdate = false;

	sky.rotation.x = 90 / 180 * 3.14;// XXX

	scene.add(sky);

	// Floor
	var ground = new BoxBufferGeometry(20, 20, 1);
	ground.name = "ground";

	var model = new Mesh(ground, material);
 	model.position.set(0, 0, -1.0);
	model.name = "ground" ;
	scene.add(model);

	// Add scene to program
	Editor.addObject(scene, Editor.program);

	// Open scene
	var tab = Editor.gui.tab.addTab(SceneEditor, true);
	tab.attach(scene);
};

/**
 * Set a program to be edited, create new history object and clear editor windows.
 *
 * @static
 * @method setProgram
 * @param {Program} program
 */
Editor.setProgram = function(program)
{
	if (Editor.program !== program)
	{
		if (Editor.program !== null)
		{
			Editor.program.dispose();
		}

		Editor.program = program;

		// Tree view
		Editor.gui.tree.attach(Editor.program);

		// History
		Editor.history = new History(Editor.settings.general.historySize);

		// Clear tabs
		Editor.gui.tab.clear();

		// Reset editor
		Editor.resetEditor();

		// Add new scene tab to interface
		if (program.children.length > 0)
		{
			var scene = Editor.gui.tab.addTab(SceneEditor, true);
			scene.attach(program.children[0]);
		}
	}
};

/**
 * Set currently open file (also updates the editor title), if running in browser is not used.
 *
 * Used for the editor to remember the file location that it is currently working on.
 *
 * @static
 * @method setOpenFile
 * @param {string} file Path of file currently open.
 */
Editor.setOpenFile = function(file)
{
	if (file !== undefined && file !== null)
	{
		if (file instanceof window.File)
		{
			if (FWE.runningOnDesktop())
			{
				Editor.openFile = file.path;
			}
			else
			{
				Editor.openFile = file.name;
			}
		}
		else
		{
			Editor.openFile = file;
		}

		document.title = FWE.NAME + " " + VERSION + " (" + TIMESTAMP + ") (" + Editor.openFile + ")";
	}
	else
	{
		Editor.openFile = null;
		document.title = FWE.NAME + " " + VERSION + " (" + TIMESTAMP + ")";
	}
};

/**
 * Show a confirm dialog with a message.
 *
 * @static
 * @method confirm
 * @param {string} message
 * @return {boolean} True or false depending on the confirm result.
 */
Editor.confirm = function(message)
{
	return window.confirm(message);
};

/**
 * Show a alert dialog with a message.
 *
 * @static
 * @method confirm
 * @param {string} message
 */
Editor.alert = function(message)
{
	window.alert(message);
};

/**
 * Prompt the user for a value.
 *
 * @static
 * @method confirm
 * @param {string} message
 * @param {string} defaultValue
 * @return {string} Value inserted by the user.
 */
Editor.prompt = function(message, defaultValue)
{
	return window.prompt(message, defaultValue);
};

/**
 * Try to update Freedom World Editor editor version using build from github repo.
 *
 * The version timestamp (TIMESTAMP) is parsed compared to the local timestamp.
 *
 * @static
 * @method updateFWE
 */
Editor.updateFWE = function(silent)
{
	return Editor.alert('TODO');
	/*
	if (silent === undefined)
	{
		silent = true;
	}

	try
	{
		var url = "https:// raw.githubusercontent.com/tentone/nunuStudio/master/build/nunu.editor.min.js";

		FileSystem.readFile(url, false, function(data)
		{
			var token = "TIMESTAMP";
			var pos = data.search(token);
			var timestamp = data.slice(pos + token.length + 2, pos + token.length + 14);

			if (parseInt(timestamp) > parseInt(Editor.TIMESTAMP))
			{
				FileSystem.writeFile("nunu.min.js", data);
				Editor.alert(Locale.updatedRestart);
			}
			else
			{
				if (!silent)
				{
					Editor.alert(Locale.alreadyUpdated);
				}
			}
		});
	}
	catch (e)
	{
		if (!silent)
		{
			Editor.alert(Locale.updateFailed);
		}
	}
	*/
};

/**
 * Get the renderer configuration used for the editor elements.
 *
 * Is defined in the settings tab and can be overrided by the project settings.
 *
 * @static
 * @method getRendererConfig
 */
Editor.getRendererConfig = function()
{
	return Editor.settings.render.followProject ? Editor.program.rendererConfig : Editor.settings.render;
};

/**
 * Exit the editor and close all windows.
 *
 * @static
 * @method exit.
 */
Editor.exit = function()
{
	if (FWE.runningOnDesktop())
	{
		Editor.settings.store();

		var gui = window.require("nw.gui");
		var win = gui.Window.get();

		gui.App.closeAllWindows();
		win.close(true);
		gui.App.quit();
	}
};

/**
 * Predicate to determine if we should rotate scene upon mouse dragging
 *
 * @method isSceneRotationAllowed
 */
Editor.isSceneRotationAllowed = function()
{
	var tab = Editor.gui.tab.getTab(SceneEditor);
	return tab.mode !== SceneEditor.SELECT_MULTIPLE && tab.mode !== SceneEditor.INSERT;
};

export {Editor};
