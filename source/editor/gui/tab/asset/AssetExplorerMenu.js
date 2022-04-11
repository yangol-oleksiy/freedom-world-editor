import {Locale} from "../../../locale/LocaleManager.js";
import {WebcamTexture} from "../../../../core/texture/WebcamTexture.js";
import {SpriteSheetTexture} from "../../../../core/texture/SpriteSheetTexture.js";
import {CubeTexture} from "../../../../core/texture/CubeTexture.js";
import {CanvasTexture} from "../../../../core/texture/CanvasTexture.js";
import {TextFile} from "../../../../core/resources/TextFile.js";
import {Image} from "../../../../core/resources/Image.js";
import {FWE} from "../../../../core/FWE.js";
import {FileSystem} from "../../../../core/FileSystem.js";
import {Loaders} from "../../../Loaders.js";
import {AddResourceAction} from "../../../history/action/resources/AddResourceAction.js";
import {Global} from "../../../Global.js";
import {Editor} from "../../../Editor.js";
import {DropdownMenu} from "../../../components/dropdown/DropdownMenu.js";
import {Component} from "../../../components/Component.js";


function AssetExplorerMenu(parent)
{
	Component.call(this, parent, "div");

	this.element.style.backgroundColor = "var(--bar-color)";
	this.element.style.overflow = "visible";

	// Import
	var menu = new DropdownMenu(this);
	menu.setText(Locale.import);
	menu.size.set(100, 25);
	menu.position.set(0, 0);

	// 3D Models Loader
	menu.addOption(Locale.models3D, function()
	{
		FileSystem.chooseFile(function(files)
		{
			for (var i = 0; i < files.length; i++)
			{
				Loaders.loadModel(files[i]);
			}
		}, ".obj, .dae, .gltf, .glb, .awd, .ply, .vtk, .vtp, .wrl, .vrml, .fbx, .pcd, .json, .3ds, .stl, .x, .js");
	}, Global.FILE_PATH + "icons/models/models.png");

	// Load Font
	menu.addOption(Locale.font, function()
	{
		FileSystem.chooseFile(function(files)
		{
			for (var i = 0; i < files.length; i++)
			{
				Loaders.loadFont(files[i]);
			}
		}, ".json, .ttf, .otf");
	}, Global.FILE_PATH + "icons/misc/font.png");

	// Load text
	menu.addOption(Locale.text, function()
	{
		FileSystem.chooseFile(function(files)
		{
			for (var i = 0; i < files.length; i++)
			{
				Loaders.loadText(files[i]);
			}
		}, ".js, .txt, .glsl, .json, .xml, .yaml, .csv, .css, .html");
	}, Global.FILE_PATH + "icons/misc/file.png");

	// Audio file
	menu.addOption(Locale.audio, function()
	{
		FileSystem.chooseFile(function(files)
		{
			for (var i = 0; i < files.length; i++)
			{
				Loaders.loadAudio(files[i]);
			}
		}, "audio/*");
	}, Global.FILE_PATH + "icons/misc/audio.png");

	menu.updateInterface();

	// Textures
	var texture = new DropdownMenu(this);
	texture.setText(Locale.texture);
	texture.size.set(100, 25);
	texture.position.set(100, 0);

	// Image texture
	texture.addOption(Locale.texture, function()
	{
		FileSystem.chooseFile(function(files)
		{
			for (var i = 0; i < files.length; i++)
			{
				Loaders.loadTexture(files[i]);
			}
		}, "image/*");
	}, Global.FILE_PATH + "icons/misc/image.png");

	// Spritesheet texture
	texture.addOption(Locale.spriteSheetTexture, function()
	{
		FileSystem.chooseFile(function(files)
		{
			for (var i = 0; i < files.length; i++)
			{
				var file = files[i];
				var name = FileSystem.getFileName(file.name);
				var extension = FileSystem.getFileExtension(file.name);

				var reader = new FileReader();

				reader.onload = function()
				{
					var texture = new SpriteSheetTexture(new Image(reader.result, extension), 1, 1, 1);
					texture.name = name;
					Editor.addAction(new AddResourceAction(texture, Editor.program, "textures"));
				};

				reader.readAsArrayBuffer(file);
			}
		}, "image/*");
	}, Global.FILE_PATH + "icons/misc/grid.png");

	// Cube texture
	texture.addOption(Locale.cubeTexture, function()
	{
		var texture = new CubeTexture([Editor.defaultImage, Editor.defaultImage, Editor.defaultImage, Editor.defaultImage, Editor.defaultImage, Editor.defaultImage]);
		texture.name = "cube";
		Editor.addAction(new AddResourceAction(texture, Editor.program, "textures"));
	}, Global.FILE_PATH + "icons/misc/cube.png");

	// Canvas texture
	texture.addOption(Locale.canvasTexture, function()
	{
		var texture = new CanvasTexture(512, 512);
		texture.placeholder();
		texture.name = "canvas";
		Editor.addAction(new AddResourceAction(texture, Editor.program, "textures"));
	}, Global.FILE_PATH + "icons/misc/canvas.png");

	// Video texture
	texture.addOption(Locale.videoTexture, function()
	{
		FileSystem.chooseFile(function(files)
		{
			for (var i = 0; i < files.length; i++)
			{
				Loaders.loadVideoTexture(files[i]);
			}
		}, "video/*");
	}, Global.FILE_PATH + "icons/misc/video.png");

	// Webcam texture
	texture.addOption(Locale.webcamTexture, function()
	{
		var texture = new WebcamTexture();
		texture.name = "webcam";
		Editor.addAction(new AddResourceAction(texture, Editor.program, "textures"));
	}, Global.FILE_PATH + "icons/hw/webcam.png");

	texture.updateInterface();
}

AssetExplorerMenu.prototype = Object.create(Component.prototype);
export {AssetExplorerMenu};
