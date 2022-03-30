import {Locale} from "../../../../locale/LocaleManager.js";
import {FWE} from "../../../../../core/FWE.js";
import {FileSystem} from "../../../../../core/FileSystem.js";
import {RemoveResourceAction} from "../../../../history/action/resources/RemoveResourceAction.js";
import {ChangeAction} from "../../../../history/action/ChangeAction.js";
import {DragBuffer} from "../../../DragBuffer.js";
import {Global} from "../../../../Global.js";
import {Editor} from "../../../../Editor.js";
import {ContextMenu} from "../../../../components/dropdown/ContextMenu.js";
import {DocumentBody} from "../../../../components/DocumentBody.js";
import {Asset} from "./Asset.js";


function VideoAsset(parent)
{
	Asset.call(this, parent);

	this.preview = document.createElement("video");
	this.preview.volume = 0;
	this.preview.draggable = true;
	this.preview.style.position = "absolute";
	this.preview.style.top = "5%";
	this.preview.style.left = "17%";
	this.preview.style.width = "66%";
	this.preview.style.height = "66%";
	this.element.appendChild(this.preview);

	this.setIcon(Global.FILE_PATH + "icons/misc/video.png");

	var self = this;

	// Context menu event
	this.element.oncontextmenu = function(event)
	{
		var context = new ContextMenu(DocumentBody);
		context.size.set(130, 20);
		context.position.set(event.clientX, event.clientY);
		
		context.addOption(Locale.rename, function()
		{
			Editor.addAction(new ChangeAction(self.asset, "name", Editor.prompt(Locale.delete + " " + Locale.video, self.asset.name)));
		});
		
		context.addOption(Locale.delete, function()
		{
			if (Editor.confirm(Locale.delete + " " + Locale.video))
			{
				Editor.addAction(new RemoveResourceAction(self.asset, Editor.program, "videos"));
			}
		});

		context.addOption(Locale.copy, function()
		{
			Editor.clipboard.set(JSON.stringify(self.asset.toJSON()), "text");
		});

		context.addOption(Locale.cut, function()
		{
			Editor.clipboard.set(JSON.stringify(self.asset.toJSON()), "text");
			Editor.addAction(new RemoveResourceAction(self.asset, Editor.program, "videos"));
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
		
		context.updateInterface();
	};

	// Drag start
	this.element.ondragstart = function(event)
	{
		// Insert into drag buffer
		if (self.asset !== null)
		{
			event.dataTransfer.setData("uuid", self.asset.uuid);
			DragBuffer.push(self.asset);
		}
	};

	// Drag end (called after of ondrop)
	this.element.ondragend = function()
	{
		DragBuffer.pop(self.asset.uuid);
	};
}

VideoAsset.prototype = Object.create(Asset.prototype);

VideoAsset.prototype.attach = function(asset)
{
	Asset.prototype.attach.call(this, asset);

	this.preview.src = asset.data;
};

VideoAsset.prototype.updateMetadata = function()
{
	if (this.asset !== null)
	{
		this.setText(this.asset.name);
	}
};
export {VideoAsset};
