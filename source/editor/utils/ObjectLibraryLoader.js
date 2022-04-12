import YAML from 'js-yaml';
import {FileLoader} from 'three';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {SideBar} from '../gui/tab/scene-editor/sidebar/SideBar';
import {Editor} from '../Editor';
import {SceneEditor} from "../gui/tab/scene-editor/SceneEditor.js";
import {ButtonDrawer} from "../components/buttons/ButtonDrawer.js";
import {Global} from "../Global.js";
import {Locale} from "../locale/LocaleManager.js";

/**
 * Utility class for loading 3d objects libraries.
 *
 * @class ObjectLibraryLoader
 */
function ObjectLibraryLoader() {}

function maybeApplyCoordinatesTransformation(obj, objSystem, sceneSystem)
{
	if (objSystem === sceneSystem)
	{
		return obj;
	}

	if (objSystem === 'xzy')
	{ // XZY -> XYZ
		obj.rotation.x = - Math.PI / 2;
		obj.rotation.y = 0;
		obj.rotation.z = 0;
		return obj;
	}
	else
	{
		Editor.alert("Unimplemented, ObjectLibraryLoader");
	}
}

function applyToMaterials(materials, func)
{
	if (materials.forEach)
	{
		return materials.map(func);
	}
	else
	{
		return func(materials);
	}
}

ObjectLibraryLoader.loadTestLibs = function(variable)
{
	var loader = new FileLoader();
	var fbxLoader = new FBXLoader();

	var libraryPath = document.location.protocol + '//' + document.location.host + '/files/3dlib/';

	var editor = Editor.gui.tab.getTab(SceneEditor);
	var sidebar = editor.sideBar;

	var models = new ButtonDrawer(sidebar);
	models.setImage(Global.FILE_PATH + "icons/misc/3d.png");
	sidebar.buttons = [models].concat(sidebar.buttons);

	var sceneEditor = Editor.gui.tab.getTab(SceneEditor);
	var insertModeToolBar = Editor.gui.tab.getTab(SceneEditor).insertModeToolBar;

	var tool = insertModeToolBar.addGroup();
	var importId = 'import' + Date.now() + Math.floor(Math.random() * 1000);

	loader.load(libraryPath + 'lib.yaml', function(data)
	{
		var library = YAML.load(data);

		library.items.forEach(function(origElem)
		{
			var elem = Object.assign({}, library.defaultOptions, origElem);
			var objectPath = libraryPath + elem.model;
			var iconPath = elem.iconPath
				? library.iconsBase.replace(/[/]$/, '') + '/' + elem.iconPath.replace(/^[/]/, '')
				: Global.FILE_PATH + "icons/models/figures.png";

			fbxLoader.load(objectPath, function(group)
			{
				var obj = maybeApplyCoordinatesTransformation(group.children[0], elem.coordinatesSystem, Editor.getCoordsSystem()).clone(true);

				obj.material = applyToMaterials(obj.material, function(material)
				{
					material.emissive.r = 0.2;
					material.emissive.g = 0.2;
					material.emissive.b = 0.2;

					return material;
				});

				if (elem.pluginInsert)
				{
					models.addOption(iconPath, function()
					{
						sceneEditor.levelData.setSceneObject(Editor.getScene(), obj, elem);
					}, elem.name);

					models.updateOptions();
					sidebar.updateInterface();
				}

				if (elem.pluginInsertMode)
				{
					var id = importId + elem.name;
					var object = obj;
					var option = tool.addToggleOption(elem.name, iconPath, function()
					{
						insertModeToolBar.selectTool(id);
						insertModeToolBar.parent.selectTool(insertModeToolBar.parent.mode);
					});
					option.id = id;
					option.object = object;
					option.libraryOptions = elem;

					insertModeToolBar.allButtons.push(option);
				}

				insertModeToolBar.maybeSelectFirstOption();
				sidebar.updateInterface();
			});
		});
	});

	insertModeToolBar.updateGroups();
	sceneEditor.updateInterface();
};

export {ObjectLibraryLoader};
