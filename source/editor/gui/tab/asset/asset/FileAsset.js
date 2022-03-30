import {Locale} from "../../../../locale/LocaleManager.js";
import {FWE} from "../../../../../core/FWE.js";
import {FileSystem} from "../../../../../core/FileSystem.js";
import {RemoveResourceAction} from "../../../../history/action/resources/RemoveResourceAction.js";
import {ChangeAction} from "../../../../history/action/ChangeAction.js";
import {TextEditor} from "../../code/TextEditor.js";
import {Global} from "../../../../Global.js";
import {Editor} from "../../../../Editor.js";
import {ContextMenu} from "../../../../components/dropdown/ContextMenu.js";
import {DocumentBody} from "../../../../components/DocumentBody.js";
import {Asset} from "./Asset.js";

function FileAsset(parent)
{
	Asset.call(this, parent);

	this.setIcon(Global.FILE_PATH + "icons/misc/file.png");
	
	var self = this;

	// Image
	this.image = document.createElement("img");
	this.image.style.position = "absolute";
	this.image.style.top = "5%";
	this.image.style.left = "17%";
	this.image.style.width = "66%";
	this.image.style.height = "66%";
	this.element.appendChild(this.image);

	// Context menu event
	this.element.oncontextmenu = function(event)
	{
		var context = new ContextMenu(DocumentBody);
		context.size.set(130, 20);
		context.position.set(event.clientX, event.clientY);

		context.addOption(Locale.rename, function()
		{
			Editor.addAction(new ChangeAction(self.asset, "name", Editor.prompt(Locale.rename + " " + Locale.file, self.asset.name)));
		});
		
		context.addOption(Locale.delete, function()
		{
			if (Editor.confirm(Locale.delete + " " + Locale.file))
			{
				Editor.addAction(new RemoveResourceAction(self.asset, Editor.program, "resources"));
			}
		});

		context.addOption(Locale.export, function()
		{
			if (FWE.runningOnDesktop())
			{
				FileSystem.chooseFile(function(files)
				{
					if (files.length > 0)
					{
						self.asset.export(files[0].path);
					}
				}, "." + self.asset.encoding, true);
			}
			else
			{
				FileSystem.chooseFileName(function(file)
				{
					self.asset.export(file);
				}, "." + self.asset.encoding);
			}
		});

		context.addOption(Locale.copy, function()
		{
			Editor.clipboard.set(JSON.stringify(self.asset.toJSON()), "text");
		});
		
		context.addOption(Locale.cut, function()
		{
			Editor.clipboard.set(JSON.stringify(self.asset.toJSON()), "text");
			Editor.addAction(new RemoveResourceAction(self.asset, Editor.program, "resources"));
		});

		context.updateInterface();
	};


	// Open text editor
	this.element.ondblclick = function()
	{
		var tab = Editor.gui.tab.getTab(TextEditor, self.asset);

		if (tab === null)
		{
			tab = Editor.gui.tab.addTab(TextEditor, true);
			tab.attach(self.asset, self);
		}
		
		tab.select();
	};
}

FileAsset.prototype = Object.create(Asset.prototype);

FileAsset.prototype.updateMetadata = function()
{
	this.setText(this.asset.name);

	if (this.asset.encoding === "js" || this.asset.encoding === "glsl")
	{
		this.image.src = Global.FILE_PATH + "icons/script/script.png";
	}
	else
	{
		this.image.src = Global.FILE_PATH + "icons/misc/file.png";
	}
};

export {FileAsset};
