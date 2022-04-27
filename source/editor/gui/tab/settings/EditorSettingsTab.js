import {Locale} from "../../../locale/LocaleManager.js";
import {Viewport} from "../../../../core/objects/cameras/Viewport.js";
import {Settings} from "../../../Settings.js";
import {Global} from "../../../Global.js";
import {Editor} from "../../../Editor.js";
import {TabComponent} from "../../../components/tabs/TabComponent.js";
import {TableForm} from "../../../components/TableForm.js";
import {Slider} from "../../../components/input/Slider.js";
import {NumberBox} from "../../../components/input/NumberBox.js";
import {DropdownList} from "../../../components/input/DropdownList.js";
import {CheckBox} from "../../../components/input/CheckBox.js";


function EditorSettingsTab(parent, closeable, container, index)
{
	TabComponent.call(this, parent, closeable, container, index, Locale.editor, Global.FILE_PATH + "icons/misc/scene.png");

	this.element.style.overflow = "auto";

	var self = this;

	this.form = new TableForm(this);
	this.form.defaultTextWidth = 125;
	this.form.setAutoSize(false);

	// Scene editor
	this.form.addText(Locale.editor);
	this.form.nextRow();

	// Show stats
	this.form.addText("Show performance").setAltText("Show performance information in the scene editor.");
	this.showStats = new CheckBox(this.form);
	this.showStats.size.set(18, 18);
	this.showStats.setOnChange(function()
	{
		Editor.settings.general.showStats = self.showStats.getValue();
	});
	this.form.add(this.showStats);
	this.form.nextRow();

	// Enable Grid
	this.form.addText("Show grid");
	this.gridEnabled = new CheckBox(this.form);
	this.gridEnabled.size.set(18, 18);
	this.gridEnabled.setOnChange(function()
	{
		Editor.settings.editor.gridEnabled = self.gridEnabled.getValue();
	});
	this.form.add(this.gridEnabled);
	this.form.nextRow();

	// Grid size
	this.form.addText("Grid size");
	this.gridSize = new NumberBox(this.form);
	this.gridSize.size.set(60, 18);
	this.gridSize.setRange(1.0, Number.MAX_SAFE_INTEGER);
	this.gridSize.setStep(0.1);
	this.gridSize.setOnChange(function()
	{
		Editor.settings.editor.gridSize = self.gridSize.getValue();
	});
	this.form.add(this.gridSize);
	this.form.nextRow();

	// Grid spacing
	this.form.addText("Grid spacing");
	this.gridSpacing = new NumberBox(this.form);
	this.gridSpacing.size.set(60, 18);
	this.gridSpacing.setRange(1.0, Number.MAX_SAFE_INTEGER);
	this.gridSpacing.setStep(1.0);
	this.gridSpacing.setOnChange(function()
	{
		Editor.settings.editor.gridSpacing = self.gridSpacing.getValue();
	});
	this.form.add(this.gridSpacing);
	this.form.nextRow();

	// Enable Axis
	this.form.addText("Show axis");
	this.axisEnabled = new CheckBox(this.form);
	this.axisEnabled.size.set(18, 18);
	this.axisEnabled.setOnChange(function()
	{
		Editor.settings.editor.axisEnabled = self.axisEnabled.getValue();
	});
	this.form.add(this.axisEnabled);
	this.form.nextRow();

	// Enable orientation cube
	this.form.addText("Orientation cube");
	this.cameraRotationCube = new CheckBox(this.form);
	this.cameraRotationCube.size.set(18, 18);
	this.cameraRotationCube.setOnChange(function()
	{
		Editor.settings.editor.cameraRotationCube = self.cameraRotationCube.getValue();
	});
	this.form.add(this.cameraRotationCube);
	this.form.nextRow();

	// Orientation cube size
	this.form.addText("Orientation cube size");
	this.cameraRotationCubeSize = new NumberBox(this.form);
	this.cameraRotationCubeSize.size.set(60, 18);
	this.cameraRotationCubeSize.setRange(1.0, Number.MAX_SAFE_INTEGER);
	this.cameraRotationCubeSize.setStep(1.0);
	this.cameraRotationCubeSize.setOnChange(function()
	{
		Editor.settings.editor.cameraRotationCubeSize = self.cameraRotationCubeSize.getValue();
	});
	this.form.add(this.cameraRotationCubeSize);
	this.form.nextRow();

	// Snap to grid
	this.form.addText("Snap to grid");
	this.snap = new CheckBox(this.form);
	this.snap.size.set(18, 18);
	this.snap.setOnChange(function()
	{
		Editor.settings.editor.snap = self.snap.getValue();
	});
	this.form.add(this.snap);
	this.form.nextRow();

	// Tranformations space
	this.form.addText("Keep pose move").setAltText("Recalculate the object transformation to keep its global position when it is moved.");
	this.keepTransformMove = new CheckBox(this.form);
	this.keepTransformMove.size.set(18, 18);
	this.keepTransformMove.setOnChange(function()
	{
		Editor.settings.editor.keepTransformMove = self.keepTransformMove.getValue();
		Editor.gui.inspector.updateSelection();
	});
	this.form.add(this.keepTransformMove);
	this.form.nextRow();

	// Blank Space
	this.form.addText("");
	this.form.nextRow();

	// General text
	this.form.addText("Inspector panel");
	this.form.nextRow();

	// Show UUID
	this.form.addText("Show object UUID").setAltText("Show object UUID in the object panel.");
	this.showUUID = new CheckBox(this.form);
	this.showUUID.size.set(18, 18);
	this.showUUID.setOnChange(function()
	{
		Editor.settings.general.showUUID = self.showUUID.getValue();
		Editor.gui.inspector.updateSelection();
	});
	this.form.add(this.showUUID);
	this.form.nextRow();

	// Show type
	this.form.addText("Show object type");
	this.showType = new CheckBox(this.form);
	this.showType.size.set(18, 18);
	this.showType.setOnChange(function()
	{
		Editor.settings.general.showType = self.showType.getValue();
		Editor.gui.inspector.updateSelection();
	});
	this.form.add(this.showType);
	this.form.nextRow();

	// Blank Space
	this.form.addText("");
	this.form.nextRow();

	// Scene editor
	this.form.addText("Navigation");
	this.form.nextRow();

	// Navigation
	this.form.addText("Navigation Mode");
	this.navigation = new DropdownList(this.form);
	this.navigation.size.set(150, 18);
	this.navigation.addValue(Locale.firstPerson, Settings.FIRST_PERSON);
	this.navigation.addValue(Locale.orbit, Settings.ORBIT);
	this.navigation.addValue(Locale.left, Settings.PLANAR_LEFT);
	this.navigation.addValue(Locale.right, Settings.PLANAR_RIGHT);
	this.navigation.addValue(Locale.front, Settings.PLANAR_FRONT);
	this.navigation.addValue(Locale.back, Settings.PLANAR_BACK);
	this.navigation.addValue(Locale.top, Settings.PLANAR_TOP);
	this.navigation.addValue(Locale.bottom, Settings.PLANAR_BOTTOM);
	this.navigation.setOnChange(function()
	{
		Editor.settings.editor.navigation = self.navigation.getValue();
	});
	this.form.add(this.navigation);
	this.form.nextRow();

	// Invert vertical navigation
	this.form.addText("Invert Vertical");
	this.invertNavigation = new CheckBox(this.form);
	this.invertNavigation.size.set(18, 18);
	this.invertNavigation.setOnChange(function()
	{
		Editor.settings.editor.invertNavigation = self.invertNavigation.getValue();
	});
	this.form.add(this.invertNavigation);
	this.form.nextRow();

	// Invert navigation
	this.form.addText("Invert Horizontal");
	this.invertHorizontalNavigation = new CheckBox(this.form);
	this.invertHorizontalNavigation.size.set(18, 18);
	this.invertHorizontalNavigation.setOnChange(function()
	{
		Editor.settings.editor.invertHorizontalNavigation = self.invertHorizontalNavigation.getValue();
	});
	this.form.add(this.invertHorizontalNavigation);
	this.form.nextRow();

	// Mouse look sensitivity
	this.form.addText("Mouse look");
	this.mouseLookSensitivity = new Slider(this.form);
	this.mouseLookSensitivity.size.set(120, 18);
	this.mouseLookSensitivity.setRange(0.0001, 0.02);
	this.mouseLookSensitivity.setStep(0.0001);
	this.mouseLookSensitivity.setOnChange(function()
	{
		Editor.settings.editor.mouseLookSensitivity = self.mouseLookSensitivity.getValue();
	});
	this.form.add(this.mouseLookSensitivity);
	this.form.nextRow();

	// Mouse move speed
	this.form.addText("Mouse move");
	this.mouseMoveSpeed = new Slider(this.form);
	this.mouseMoveSpeed.size.set(120, 18);
	this.mouseMoveSpeed.setRange(0.0001, 0.01);
	this.mouseMoveSpeed.setStep(0.0001);
	this.mouseMoveSpeed.setOnChange(function()
	{
		Editor.settings.editor.mouseMoveSpeed = self.mouseMoveSpeed.getValue();
	});
	this.form.add(this.mouseMoveSpeed);
	this.form.nextRow();

	// Mouse wheel speed
	this.form.addText("Mouse zoom");
	this.mouseWheelSensitivity = new Slider(this.form);
	this.mouseWheelSensitivity.size.set(120, 18);
	this.mouseWheelSensitivity.setRange(0.0001, 0.01);
	this.mouseWheelSensitivity.setStep(0.0001);
	this.mouseWheelSensitivity.setOnChange(function()
	{
		Editor.settings.editor.mouseWheelSensitivity = self.mouseWheelSensitivity.getValue();
	});
	this.form.add(this.mouseWheelSensitivity);
	this.form.nextRow();

	// Mouse lock on camera move
	this.form.addText("Lock mouse");
	this.lockMouse = new CheckBox(this.form);
	this.lockMouse.size.set(18, 18);
	this.lockMouse.setOnChange(function()
	{
		Editor.settings.editor.lockMouse = self.lockMouse.getValue();
	});
	this.form.add(this.lockMouse);
	this.form.nextRow();

	// Keyboard navigation
	this.form.addText("Keyboard navigation");
	this.keyboardNavigation = new CheckBox(this.form);
	this.keyboardNavigation.size.set(18, 18);
	this.keyboardNavigation.setOnChange(function()
	{
		Editor.settings.editor.keyboardNavigation = self.keyboardNavigation.getValue();
	});
	this.form.add(this.keyboardNavigation);
	this.form.nextRow();

	// Keyboard movement speed
	this.form.addText("Keyboard speed");
	this.keyboardNavigationSpeed = new Slider(this.form);
	this.keyboardNavigationSpeed.size.set(120, 18);
	this.keyboardNavigationSpeed.setRange(0.1, 3);
	this.keyboardNavigationSpeed.setStep(0.1);
	this.keyboardNavigationSpeed.setOnChange(function()
	{
		Editor.settings.editor.keyboardNavigationSpeed = self.keyboardNavigationSpeed.getValue();
	});
	this.form.add(this.keyboardNavigationSpeed);
	this.form.nextRow();

	// Blank Space
	this.form.addText("");
	this.form.nextRow();

	// Scene editor
	this.form.addText("Camera Preview");
	this.form.nextRow();

	// Enable camera preview
	this.form.addText("Show preview");
	this.cameraPreviewEnabled = new CheckBox(this.form);
	this.cameraPreviewEnabled.size.set(18, 18);
	this.cameraPreviewEnabled.setOnChange(function()
	{
		Editor.settings.editor.cameraPreviewEnabled = self.cameraPreviewEnabled.getValue();
	});
	this.form.add(this.cameraPreviewEnabled);
	this.form.nextRow();

	// Enable camera preview
	this.form.addText("Preview size");
	this.cameraPreviewSize = new Slider(this.form);
	this.cameraPreviewSize.size.set(120, 18);
	this.cameraPreviewSize.setRange(1, 600);
	this.cameraPreviewSize.setStep(0.05);
	this.cameraPreviewSize.setOnChange(function()
	{
		Editor.settings.editor.cameraPreviewSize = self.cameraPreviewSize.getValue();
	});
	this.form.add(this.cameraPreviewSize);
	this.form.nextRow();

	// Navigation
	this.form.addText(Locale.position);
	this.cameraPreviewPosition = new DropdownList(this.form);
	this.cameraPreviewPosition.size.set(150, 18);
	this.cameraPreviewPosition.addValue(Locale.bottomRight, Viewport.BOTTOM_RIGHT);
	this.cameraPreviewPosition.addValue(Locale.bottomLeft, Viewport.BOTTOM_LEFT);
	this.cameraPreviewPosition.addValue(Locale.topRight, Viewport.TOP_RIGHT);
	this.cameraPreviewPosition.addValue(Locale.topLeft, Viewport.TOP_LEFT);
	this.cameraPreviewPosition.setOnChange(function()
	{
		Editor.settings.editor.cameraPreviewPosition = self.cameraPreviewPosition.getValue();
	});
	this.form.add(this.cameraPreviewPosition);
	this.form.nextRow();

	// Blank Space
	this.form.addText("");
	this.form.nextRow();

	// Asset explorer
	this.form.addText("Asset explorer");
	this.form.nextRow();

	// Code font size
	this.form.addText("Preview size");
	this.filePreviewSize = new NumberBox(this.form);
	this.filePreviewSize.size.set(60, 18);
	this.filePreviewSize.setRange(50, 200);
	this.filePreviewSize.setStep(1);
	this.filePreviewSize.setOnChange(function()
	{
		Editor.settings.general.filePreviewSize = self.filePreviewSize.getValue();
		Editor.updateSettings();
	});
	this.form.add(this.filePreviewSize);

	// Update form
	this.form.updateInterface();
}

EditorSettingsTab.prototype = Object.create(TabComponent.prototype);

EditorSettingsTab.prototype.activate = function()
{
	// Inspector
	this.filePreviewSize.setValue(Editor.settings.general.filePreviewSize);
	this.showUUID.setValue(Editor.settings.general.showUUID);
	this.showType.setValue(Editor.settings.general.showType);
	this.showStats.setValue(Editor.settings.general.showStats);

	// Editor
	this.snap.setValue(Editor.settings.editor.snap);
	this.gridEnabled.setValue(Editor.settings.editor.gridEnabled);
	this.gridSize.setValue(Editor.settings.editor.gridSize);
	this.gridSpacing.setValue(Editor.settings.editor.gridSpacing);
	this.axisEnabled.setValue(Editor.settings.editor.axisEnabled);
	this.cameraRotationCube.setValue(Editor.settings.editor.cameraRotationCube);
	this.cameraRotationCubeSize.setValue(Editor.settings.editor.cameraRotationCubeSize);

	// Navigation
	this.lockMouse.setValue(Editor.settings.editor.lockMouse);
	this.navigation.setValue(Editor.settings.editor.navigation);
	this.invertNavigation.setValue(Editor.settings.editor.invertNavigation);
	this.invertHorizontalNavigation.setValue(Editor.settings.editor.invertHorizontalNavigation);
	this.keyboardNavigation.setValue(Editor.settings.editor.keyboardNavigation);
	this.keyboardNavigationSpeed.setValue(Editor.settings.editor.keyboardNavigationSpeed);
	this.mouseLookSensitivity.setValue(Editor.settings.editor.mouseLookSensitivity);
	this.mouseMoveSpeed.setValue(Editor.settings.editor.mouseMoveSpeed);
	this.mouseWheelSensitivity.setValue(Editor.settings.editor.mouseWheelSensitivity);

	// Camera preview
	this.cameraPreviewEnabled.setValue(Editor.settings.editor.cameraPreviewEnabled);
	this.cameraPreviewSize.setValue(Editor.settings.editor.cameraPreviewSize);
	this.cameraPreviewPosition.setValue(Editor.settings.editor.cameraPreviewPosition);

	// Transformations
	this.keepTransformMove.setValue(Editor.settings.editor.keepTransformMove);
};

EditorSettingsTab.prototype.updateSize = function()
{
	TabComponent.prototype.updateSize.call(this);

	this.form.size.copy(this.size);
	this.form.updateInterface();
};
export {EditorSettingsTab};
