import YAML from 'js-yaml';
import {FileLoader} from 'three';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {SideBar} from '../gui/tab/scene-editor/sidebar/SideBar';
import {Editor} from '../Editor';
import {SceneEditor} from "../gui/tab/scene-editor/SceneEditor.js";
import {ButtonDrawer} from "../components/buttons/ButtonDrawer.js";
import {Global} from "../Global.js";
import {Locale} from "../locale/LocaleManager.js";
import {MultipleSelection} from "../gui/tab/scene-editor/utils/MultipleSelection.js";

/**
 * Utility class for loading 3d objects libraries.
 *
 * @class ObjectLibraryLoader
 */
function ObjectLibraryLoader() {}
ObjectLibraryLoader.loadedLibraries = [];

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

ObjectLibraryLoader.loadSettingsLibraries = function()
{
	var th = this;
	th.loadedLibraries = [];

	var promises = [];

	Editor.settings.libraries.forEach(function(libraryPath)
	{
		promises.push(th.loadLibrary(libraryPath));
	});

	Promise.all(promises).then(function()
	{
		if (ObjectLibraryLoader.onLoadCallback)
		{
			ObjectLibraryLoader.onLoadCallback();
			ObjectLibraryLoader.onLoadCallback = null;
		}
	});
};

ObjectLibraryLoader.loadLibrary = function(libraryPath)
{
	return new Promise(function(resolve, reject)
	{
		var loader = new FileLoader();
		var fbxLoader = new FBXLoader();

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
			var subPromises = [];

			library.items.forEach(function(origElem)
			{
				subPromises.push(new Promise(function(subResolve, subReject)
				{

					var isLastItem = library.items[library.items.length - 1] === origElem;
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
								if (sceneEditor.mode === SceneEditor.SELECT_MULTIPLE)
								{
									MultipleSelection.doEachSelectedField(function(x, y)
									{
										if (Editor.getCoordsSystem() === 'xzy')
										{
											var newObj = obj.clone(true);
											newObj.position.x = x;
											newObj.position.y = y;
											sceneEditor.levelData.setSceneObject(Editor.getScene(), newObj, elem);
										}
										else
										{
											alert('Unimplemented');
										}
									});
								}
								else
								{
									sceneEditor.levelData.setSceneObject(Editor.getScene(), obj, elem);
								}
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

						if (isLastItem)
						{
							sidebar.updateInterface();
							insertModeToolBar.maybeSelectFirstOption();
							insertModeToolBar.updateGroups();
							sceneEditor.updateInterface();
						}

						subResolve();
					});
				}));
			});

			Promise.all(subPromises).then(resolve).catch(reject);
		});
	});
};

export {ObjectLibraryLoader};
