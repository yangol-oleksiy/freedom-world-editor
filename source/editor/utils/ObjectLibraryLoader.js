import YAML from 'js-yaml';
import {FileLoader} from 'three';
import {SideBar} from '../gui/tab/scene-editor/sidebar/SideBar'
import {Editor} from '../Editor'
import {SceneEditor} from "../gui/tab/scene-editor/SceneEditor.js";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {ButtonDrawer} from "../components/buttons/ButtonDrawer.js";
import {Global} from "../Global.js";
import {Locale} from "../locale/LocaleManager.js";

/**
 * Utility class for loading 3d objects libraries.
 *
 * @class ObjectLibraryLoader
 */
function ObjectLibraryLoader() {}

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

	loader.load(libraryPath + 'lib.yaml', function(data) {
		var library = YAML.load(data);

		library.forEach(function(elem){
			var objectPath = libraryPath + elem.model;

			fbxLoader.load(objectPath, function(group){
				models.addOption(Global.FILE_PATH + "icons/models/figures.png", function()
				{
					Editor.getScene().add(group.children[0].clone(true));
				}, elem.name);

				models.updateOptions();
				sidebar.updateInterface();
			})

			sidebar.updateInterface();
		});
	});
};

export {ObjectLibraryLoader};
