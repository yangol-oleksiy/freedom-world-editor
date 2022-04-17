import {Locale} from "../../../locale/LocaleManager.js";
import {Global} from "../../../Global.js";
import {Editor} from "../../../Editor.js";
import {TabComponent} from "../../../components/tabs/TabComponent.js";
import {TableForm} from "../../../components/TableForm.js";
import {DropdownList} from "../../../components/input/DropdownList.js";

function LibrariesSettingsTab(parent, closeable, container, index)
{
	TabComponent.call(this, parent, closeable, container, index, Locale.librariesSettings, Global.FILE_PATH + "icons/misc/particles.png");

	this.element.style.overflow = "auto";

	var self = this;

	this.form = new TableForm(this);
	this.form.defaultTextWidth = 125;
	this.form.setAutoSize(false);

	this.form.addText('Loaded libraries');
	this.form.addText(Editor.settings.libraries.join(', '));
	this.form.nextRow();
}

LibrariesSettingsTab.prototype = Object.create(TabComponent.prototype);

LibrariesSettingsTab.prototype.activate = function()
{
};

LibrariesSettingsTab.prototype.updateSize = function()
{
	TabComponent.prototype.updateSize.call(this);

	this.form.size.copy(this.size);
	this.form.updateInterface();
};

export {LibrariesSettingsTab};
