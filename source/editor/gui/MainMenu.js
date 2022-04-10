import {Locale} from "../locale/LocaleManager.js";
import {FWE} from "../../core/FWE.js";
import {ObjectLoader} from "../../core/loaders/ObjectLoader.js";
import {FileSystem} from "../../core/FileSystem.js";
import {RemoveAction} from "../history/action/objects/RemoveAction.js";
import {AddAction} from "../history/action/objects/AddAction.js";
import {ChangeAction} from "../history/action/ChangeAction.js";
import {ActionBundle} from "../history/action/ActionBundle.js";
import {Global} from "../Global.js";
import {Editor} from "../Editor.js";
import {DropdownMenu} from "../components/dropdown/DropdownMenu.js";
import {Component} from "../components/Component.js";
import {ButtonText} from "../components/buttons/ButtonText.js";
import {AboutTab} from "./tab/about/AboutTab.js";
import {SettingsTab} from "./tab/settings/SettingsTab.js";
import {ObjectLibraryLoader} from "../utils/ObjectLibraryLoader";

/**
 * Main menu of the application is displayed on top of the window, contains all global operations that can be applied to the project.
 *
 * Its also used to load, save project, and access editor related features.
 *
 * @class MainMenu
 * @extends {Component}
 */
function MainMenu(parent)
{
	Component.call(this, parent, "div");

	this.element.style.overflow = "visible";
	this.element.style.backgroundColor = "var(--bar-color)";
	this.element.style.top = "0px";
	this.element.style.left = "0px";
	this.element.style.width = "100%";
	this.element.style.height = "25px";

	this.size.set(0, 25);

	this.preventDragEvents();

	// Editor Logo
	var logo = document.createElement("img");
	logo.style.display = "block";
	logo.style.position = "absolute";
	logo.style.pointerEvents = "none";
	logo.style.width = "108px";
	logo.style.height = "18px";
	logo.style.top = "3px";
	logo.style.right = "3px";
	logo.src = Global.FILE_PATH + "logo.png";
	this.element.appendChild(logo);

	// File
	var fileMenu = new DropdownMenu(this);
	fileMenu.setText(Locale.file);
	fileMenu.size.set(120, this.size.y);
	fileMenu.position.set(0, 0);

	// New XYZ project
	fileMenu.addOption(Locale.newXYZ, function()
	{
		Editor.gui.newXYZProgram();
	}, Global.FILE_PATH + "icons/misc/new.png");

  // New XZY project
	fileMenu.addOption(Locale.newXZY, function()
	{
		Editor.gui.newXZYProgram();
	}, Global.FILE_PATH + "icons/misc/new.png");

	// Save project
	fileMenu.addOption(Locale.save, function()
	{
		Editor.alert('Unimplemented');
	}, Global.FILE_PATH + "icons/misc/save.png");

	// Save project
	fileMenu.addOption(Locale.saveAs, function()
	{
		Editor.alert('Unimplemented');
	}, Global.FILE_PATH + "icons/misc/save.png").setAltText("CTRL+S");

	// Load Project
	fileMenu.addOption(Locale.load, function()
	{
		Editor.alert('Unimplemented');
	}, Global.FILE_PATH + "icons/misc/load.png").setAltText("CTRL+L");

	// Settings
	fileMenu.addOption(Locale.settings, function()
	{
		var tab = Editor.gui.tab.getTab(SettingsTab);
		if (tab === null)
		{
			tab = Editor.gui.tab.addTab(SettingsTab, true);
		}
		tab.select();
	}, Global.FILE_PATH + "icons/misc/settings.png");

	if (DEVELOPMENT) {
		// Load test library
		fileMenu.addOption("Load test library", function()
		{
			ObjectLibraryLoader.loadTestLibs();
		}, Global.FILE_PATH + "icons/misc/import.png");
	}

	fileMenu.updateInterface();

	// Editor
	var editMenu = new DropdownMenu(this); editMenu.setText("Edit");
	editMenu.size.set(100, this.size.y);
	editMenu.position.set(120, 0);

	editMenu.addOption(Locale.undo, function()
	{
		Editor.undo();
	}, Global.FILE_PATH + "icons/misc/undo.png");

	editMenu.addOption(Locale.redo, function()
	{
		Editor.redo();
	}, Global.FILE_PATH + "icons/misc/redo.png");

	editMenu.addOption(Locale.copy, function()
	{
		Editor.copyObject();
	}, Global.FILE_PATH + "icons/misc/copy.png");

	editMenu.addOption(Locale.cut, function()
	{
		Editor.cutObject();
	}, Global.FILE_PATH + "icons/misc/cut.png");

	editMenu.addOption(Locale.paste, function()
	{
		Editor.pasteObject();
	}, Global.FILE_PATH + "icons/misc/paste.png");

	editMenu.addOption(Locale.delete, function()
	{
		if (Editor.hasObjectSelected())
		{
			var del = Editor.confirm(Locale.deleteObjects);
			if (del)
			{
				Editor.deleteObject();
			}
		}
	}, Global.FILE_PATH + "icons/misc/delete.png");

	editMenu.updateInterface();

	// Project
	var projectMenu = new DropdownMenu(this);
	projectMenu.setText(Locale.project);
	projectMenu.size.set(100, this.size.y);
	projectMenu.position.set(220, 0);

	projectMenu.addOption(Locale.executeScript, function()
	{
		FileSystem.chooseFile(function(files)
		{
			try
			{
				if (files.length > 0)
				{
					var code = FileSystem.readFile(files[0].path);
					var func = Function(code);
					func();
				}
			}
			catch (error)
			{
				Editor.alert("Error: " + error);
			}
		}, ".js");
	}, Global.FILE_PATH + "icons/script/script.png");

	projectMenu.updateInterface();

	// About
	var about = new ButtonText(this);
	about.setText(Locale.about);
	about.size.set(100, this.size.y);
	about.position.set(320, 0);
	about.updateInterface();
	about.setOnClick(function()
	{
		var tab = Editor.gui.tab.getTab(AboutTab);
		if (tab === null)
		{
			tab = Editor.gui.tab.addTab(AboutTab, true);
		}
		tab.select();
	});

	// Run
	this.run = new ButtonText(this);
	this.run.setText(Locale.run);
	this.run.size.set(100, this.size.y);
	this.run.position.set(420, 0);
	this.run.updateInterface();
	this.run.setOnClick(function()
	{
		Editor.runProject();
	});
}

MainMenu.prototype = Object.create(Component.prototype);

MainMenu.prototype.updateInterface = function()
{
	this.updateVisibility();
};

export {MainMenu};
