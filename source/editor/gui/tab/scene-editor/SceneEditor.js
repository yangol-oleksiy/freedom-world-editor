import {AxesHelper, Bone, BoxHelper, BufferGeometry, Camera, CameraHelper, DirectionalLight, DirectionalLightHelper, Geometry, HemisphereLight, HemisphereLightHelper, Light, LightProbe, Line, LineBasicMaterial, Material, Mesh, MeshStandardMaterial, Object3D, PointLight, PointLightHelper, Points, PointsMaterial, Raycaster, RectAreaLight, Scene, ShaderMaterial, SkinnedMesh, SpotLight, SpotLightHelper, Sprite, SpriteMaterial, Texture, Vector2, PlaneGeometry, MeshBasicMaterial, MeshPhongMaterial, BoxGeometry} from "three";
import {ActionBundle} from "../../../history/action/ActionBundle.js";
import {AddResourceAction} from "../../../history/action/resources/AddResourceAction.js";
import {Audio} from "../../../../core/resources/Audio.js";
import {Program} from "../../../../core/objects/Program.js";
import {AudioEmitter} from "../../../../core/objects/audio/AudioEmitter.js";
import {ButtonIcon} from "../../../components/buttons/ButtonIcon.js";
import {ChangeAction} from "../../../history/action/ChangeAction.js";
import {Component} from "../../../components/Component.js";
import {DragBuffer} from "../../DragBuffer.js";
import {DropdownList} from "../../../components/input/DropdownList.js";
import {Editor} from "../../../Editor.js";
import {EventManager} from "../../../../core/utils/EventManager.js";
import {Font} from "../../../../core/resources/Font.js";
import {Global} from "../../../Global.js";
import {Group} from "../../../../core/objects/misc/Group.js";
import {Image} from "../../../../core/resources/Image.js";
import {Keyboard} from "../../../../core/input/Keyboard.js";
import {LensFlare} from "../../../../core/objects/misc/LensFlare.js";
import {Loaders} from "../../../Loaders.js";
import {Locale} from "../../../locale/LocaleManager.js";
import {Model} from "../../../../core/resources/Model.js";
import {Mouse} from "../../../../core/input/Mouse.js";
import {FWE} from "../../../../core/FWE.js";
import {ObjectIcons} from "../../../utils/ObjectIcons.js";
import {OrthographicCamera} from "../../../../core/objects/cameras/OrthographicCamera.js";
import {PerspectiveCamera} from "../../../../core/objects/cameras/PerspectiveCamera.js";
import {RendererCanvas} from "../../../components/RendererCanvas.js";
import {Settings} from "../../../Settings.js";
import {SwapAction} from "../../../history/action/objects/SwapAction.js";
import {TabComponent} from "../../../components/tabs/TabComponent.js";
import {Video} from "../../../../core/resources/Video.js";
import {VideoTexture} from "../../../../core/texture/VideoTexture.js";
import {Viewport} from "../../../../core/objects/cameras/Viewport.js";
import {TransformControls} from "./transform/TransformControls.js";
import {ToolBar} from "./toolbar/ToolBar.js";
import {InsertModeToolBar} from "./toolbar/InsertModeToolBar.js";
import {SkeletonHelper} from "./helpers/SkeletonHelper.js";
import {SideBar} from "./sidebar/SideBar.js";
import {RectAreaLightHelper} from "./helpers/RectAreaLightHelper.js";
import {PointsHelper} from "./helpers/PointsHelper.js";
import {OrientationCube} from "./utils/OrientationCube.js";
import {ObjectIconHelper} from "./helpers/ObjectIconHelper.js";
import {LineHelper} from "./helpers/LineHelper.js";
import {LightProbeHelper} from "./helpers/LightProbeHelper.js";
import {GridHelper} from "./helpers/GridHelper.js";
import {EditorPlanarControls} from "./controls/EditorPlanarControls.js";
import {EditorOrbitControls} from "./controls/EditorOrbitControls.js";
import {EditorFreeControls} from "./controls/EditorFreeControls.js";
import {WireframeHelper} from "./helpers/WireframeHelper.js";

/**
 * The scene editor is the core of the Freedom World Editor editor.
 *
 * It is used to edit the scenes and apply changes to the objects using helper objects.
 *
 * @class SceneEditor
 * @extends {TabComponent}
 */
function SceneEditor(parent, closeable, container, index)
{
	TabComponent.call(this, parent, closeable, container, index, Locale.scene, Global.FILE_PATH + "icons/misc/scene.png");

	var self = this;

	/**
	 * Rendering canvas element where the scene is presented.
	 *
	 * @attribute canvas
	 * @type {RendererCanvas}
	 */
	this.canvas = new RendererCanvas(this, Editor.getRendererConfig());
	this.canvas.onResize = function(width, height)
	{
		if (self.scene !== null)
		{
			self.scene.resize(width, height);
		}
	};
	this.canvas.resetCanvas = function()
	{
		RendererCanvas.prototype.resetCanvas.call(this);

		self.transform.setCanvas(this.canvas);
		self.mouse.setCanvas(this.canvas);

		this.canvas.ondragover = Component.preventDefault;
		this.canvas.ondrop = function(event)
		{
			event.preventDefault();

			var uuid = event.dataTransfer.getData("uuid");
			var draggedObject = DragBuffer.get(uuid);

			var canvas = this;
			var rect = canvas.getBoundingClientRect();

			var position = new Vector2(event.clientX - rect.left, event.clientY - rect.top);
			var normalized = new Vector2(position.x / self.canvas.size.x * 2.0 - 1.0, -2.0 * position.y / self.canvas.size.y + 1.0);
			self.raycaster.setFromCamera(normalized, self.camera);

			var intersections = self.raycaster.intersectObjects(self.scene.children, true);

			// Auxiliar method to copy details from a object to a destination
			function copyDetails(destination, object)
			{
				destination.name = object.name;
				destination.visible = object.visible;
				destination.castShadow = object.castShadow;
				destination.receiveShadow = object.receiveShadow;
				destination.frustumCulled = object.frustumCulled;
				destination.renderOrder = object.renderOrder;
				destination.matrixAutoUpdate = object.matrixAutoUpdate;
				destination.position.copy(object.position);
				destination.scale.copy(object.scale);
				destination.quaternion.copy(object.quaternion);
			}

			// Auxiliar method to attach textures to objects
			function attachTexture(texture, object)
			{
				var material = null;
				if (object instanceof Mesh || object instanceof SkinnedMesh)
				{
					material = new MeshStandardMaterial({map: texture, color: 0xFFFFFF, roughness: 0.6, metalness: 0.2});
					material.name = texture.name;
				}
				else if (object instanceof Line)
				{
					material = new LineBasicMaterial({color: 0xFFFFFF});
					material.name = texture.name;
				}
				else if (object instanceof Points)
				{
					material = new PointsMaterial({map: texture, color: 0xFFFFFF});
					material.name = texture.name;
				}
				else if (object instanceof Sprite)
				{
					material = new SpriteMaterial({map: texture, color: 0xFFFFFF});
					material.name = texture.name;
				}

				Editor.addAction(new ActionBundle(
					[
						new AddResourceAction(material, Editor.program, "materials"),
						new ChangeAction(object, "material", material)
					]));
			}

			// Dragged file
			if (event.dataTransfer.files.length > 0)
			{
				var files = event.dataTransfer.files;

				for (var i = 0; i < files.length; i++)
				{
					var file = files[i];

					// Check if mouse intersects and object
					if (intersections.length > 0)
					{
						var object = intersections[0].object;

						// Image
						if (Image.fileIsImage(file))
						{
							Loaders.loadTexture(file, function(texture)
							{
								attachTexture(texture, object);
							});
						}
						// Video
						else if (Video.fileIsVideo(file))
						{
							Loaders.loadVideoTexture(file, function(texture)
							{
								attachTexture(texture, object);
							});
						}
						// Font
						else if (Font.fileIsFont(file))
						{
							if (object.font !== undefined)
							{
								Loaders.loadFont(file, function(font)
								{
									object.setFont(font);
								});
							}
						}
					}

					// Model
					if (Model.fileIsModel(file))
					{
						Loaders.loadModel(file);
					}
				}
			}
			// Dragged resource
			else if (draggedObject !== null)
			{
				// Object intersected
				if (intersections.length > 0)
				{
					var object = intersections[0].object;

					// Material
					if (draggedObject instanceof Material)
					{
						// Sprite material
						if (draggedObject instanceof SpriteMaterial)
						{
							if (object instanceof Sprite)
							{
								Editor.addAction(new ChangeAction(object, "material", draggedObject));
							}
						}
						// Points material
						else if (draggedObject instanceof PointsMaterial)
						{
							if (object instanceof Points)
							{
								Editor.addAction(new ChangeAction(object, "material", draggedObject));
							}
							else if (object.geometry !== undefined)
							{
								var newObject = new Points(object.geometry, draggedObject);
								copyDetails(newObject, object);
								Editor.addAction(new SwapAction(object, newObject, true));
							}
						}
						// Line material
						else if (draggedObject instanceof LineBasicMaterial)
						{
							if (object instanceof Line)
							{
								Editor.addAction(new ChangeAction(object, "material", draggedObject));
							}
							else if (object.geometry !== undefined)
							{
								var newObject = new Line(object.geometry, draggedObject);
								copyDetails(newObject, object);
								Editor.addAction(new SwapAction(object, newObject, true));
							}
						}
						// Shader material
						else if (draggedObject instanceof ShaderMaterial)
						{
							if (object.material !== undefined)
							{
								Editor.addAction(new ChangeAction(object, "material", draggedObject));
							}
						}
						// Mesh material
						else
						{
							if (object instanceof Mesh)
							{
								Editor.addAction(new ChangeAction(object, "material", draggedObject));
							}
							else if (object.geometry !== undefined)
							{
								var newObject = new Mesh(object.geometry, draggedObject);
								copyDetails(newObject, object);
								Editor.addAction(new SwapAction(object, newObject, true));
							}
						}
					}
					// Texture
					else if (draggedObject instanceof Texture)
					{
						attachTexture(draggedObject, object);
					}
					// Image
					else if (draggedObject instanceof Image)
					{
						attachTexture(new Texture(draggedObject), object);
					}
					// Video
					else if (draggedObject instanceof Video)
					{
						attachTexture(new VideoTexture(draggedObject), object);
					}
					// Font
					else if (draggedObject instanceof Font)
					{
						if (object.font !== undefined)
						{
							object.setFont(draggedObject);
							Editor.updateObjectsViewsGUI();
						}
					}
					// Geometry
					else if (draggedObject instanceof Geometry || draggedObject instanceof BufferGeometry)
					{
						if (object instanceof Mesh || object instanceof Points || object instanceof Line)
						{
							Editor.addAction(new ChangeAction(object, "geometry", draggedObject));
						}
					}
				}

				// Create audio emitter
				if (draggedObject instanceof Audio)
				{
					var audio = new AudioEmitter(draggedObject);
					audio.name = draggedObject.name;
					Editor.addObject(audio);
				}
			}
		};
	};

	/**
	 * Keyboard input object.
	 *
	 * @attribute keyboard
	 * @type {Keyboard}
	 */
	this.keyboard = new Keyboard();

	/**
	 * Mouse input object
	 *
	 * It is attached to the window object to capture movement outside of the tab division.
	 *
	 * @attribute mouse
	 * @type {Mouse}
	 */
	this.mouse = new Mouse(window, true);

	/**
	 * Raycaster object used for object picking.
	 *
	 * @attribute raycaster
	 * @type {Raycaster}
	 */
	this.raycaster = new Raycaster();

	/**
	 * Normalized mouse coordinates for raycasting.
	 *
	 * @attribute normalized
	 * @type {Vector2}
	 */
	this.normalized = new Vector2();

	/**
	 * Scene being edited in this tab.
	 *
	 * Can also be a regular 3D object.
	 *
	 * @attribute scene
	 * @type {Object3D}
	 */
	this.scene = null;

	/**
	 * The tool bar contains the selector for the transform tools and object placing icons.
	 *
	 * @attribute sideBar
	 * @type {SideBar}
	 */
	this.sideBar = new SideBar(this);

	/**
	 * Camera orientation cube.
	 *
	 * Used to preview the orientation of the editor camera.
	 *
	 * @attribute orientation
	 * @type {OrientationCube}
	 */
	this.orientation = new OrientationCube();

	/**
	 * Helper scene stored the object and editor preview objects.
	 *
	 * @attribute helperScene
	 * @type {Scene}
	 */
	this.helperScene = new Scene();
	this.helperScene.matrixAutoUpdate = false;

	/**
	 * Grid helper configured to match editor settings.
	 *
	 * @attribute gridHelperXYZ
	 * @type {GridHelper}
	 */
	this.gridHelperXYZ = new GridHelper(Editor.settings.editor.gridSize, Editor.settings.editor.gridSpacing, 0x888888);
	this.gridHelperXYZ.visible = Editor.settings.editor.gridEnabled;

	/**
	 * Grid helper configured to match editor settings.
	 *
	 * @attribute gridHelperXZY
	 * @type {GridHelper}
	 */
	this.gridHelperXZY = new GridHelper(Editor.settings.editor.gridSize, Editor.settings.editor.gridSpacing, 0x888888);
	this.gridHelperXZY.visible = Editor.settings.editor.gridEnabled;
	this.gridHelperXZY.rotateX(90 * THREE.Math.DEG2RAD);

	this.helperScene.add(this.gridHelperXZY);
	this.helperScene.add(this.gridHelperXYZ);

	const geometry = new PlaneGeometry( 1000, 1000 );

	this.helperPlaneXZY = new Mesh(geometry, new MeshBasicMaterial( {visible: true} ));
	this.helperPlaneXZY.name = 'helperPlane';
	this.helperPlaneXZY.visible = false;
	this.helperPlaneXYZ = new Mesh(geometry, new MeshBasicMaterial( {visible: true} ));
	this.helperPlaneXYZ.rotation.x = THREE.Math.DEG2RAD * -90;
	this.helperPlaneXYZ.name = 'helperPlane';
	this.helperPlaneXYZ.visible = false;

	this.helperCube = new Mesh(new BoxGeometry(1, 1, 1), new MeshPhongMaterial( {visible: true, color: 0xff0000, transparent: true, opacity: 0.3} ))	;
	this.helperCube.name = 'helperCube';

	/**
	 * Wireframe model used instead of standard cube when insert mode is activate
	 * Should be not null only in insert mode
	 */
	this.helperInsertModeObject = null;
	/**
	 * Axes helper configured to match editor settings.
	 *
	 * @attribute axisHelper
	 * @type {AxesHelper}
	 */
	this.axisHelper = new AxesHelper(Editor.settings.editor.gridSize);
	this.axisHelper.material.depthWrite = false;
	this.axisHelper.material.transparent = true;
	this.axisHelper.material.opacity = 1.0;
	this.axisHelper.visible = Editor.settings.editor.axisEnabled;
	this.helperScene.add(this.axisHelper);

	/**
	 * Object helper container.
	 *
	 * @attribute objectHelper
	 * @type {Group}
	 */
	this.objectHelper = new Group();
	this.objectHelper.matrixAutoUpdate = true;
	this.helperScene.add(this.objectHelper);

	/**
	 * Group where the object manipulation tools are drawn
	 *
	 * @attribute toolScene
	 * @type {Scene}
	 */
	this.toolScene = new Scene();
	this.toolScene.matrixAutoUpdate = false;

	/**
	 * Editor manipulation mode.
	 *
	 * @attribute mode
	 * @type {number}
	 */
	this.mode = SceneEditor.SELECT;

	/**
	 * Transform controls tool.
	 *
	 * @attribute transform
	 * @type {TransformControls}
	 */
	this.transform = new TransformControls(this.camera, null, this.mouse);
	this.transform.visible = false;
	this.toolScene.add(this.transform);

	/**
	 * Camera object used to visualize the scene.
	 *
	 * This object is attached to the scene as the defaultCamera, allowing it to be used for runtime when there is no default camera.
	 *
	 * Can be a an OrthographicCamera or PerspectiveCamera dependeing on the cameraMode value.
	 *
	 * @attribute camera
	 * @type {Camera}
	 */
	this.camera = null;

	/**
	 * Camera controls object used to manipulate the camera position.
	 *
	 * Can be EditorFreeControls, EditorOrbitControls or EditorPlanarControls.
	 *
	 * @attribute controls
	 * @type {Group}
	 */
	this.controls = null;
	this.controlsMode = -1;
	this.setCameraMode(SceneEditor.PERSPECTIVE);

	/**
	 * Transformation controls mode can be local or world.
	 *
	 * @attribute transformationSpace
	 * @type {DropdownList}
	 */
	this.transformationSpace = new DropdownList(this);
	this.transformationSpace.size.set(60, 30);
	this.transformationSpace.position.set(145, 5);
	this.transformationSpace.updatePosition(Component.BOTTOM_RIGHT);
	this.transformationSpace.updateSize();
	this.transformationSpace.addValue(Locale.local, TransformControls.LOCAL);
	this.transformationSpace.addValue(Locale.world, TransformControls.WORLD);
	this.transformationSpace.element.style.opacity = 0.5;
	this.transformationSpace.setOnChange(function()
	{
		var space = self.transformationSpace.getValue();
		Editor.settings.editor.transformationSpace = space;
		self.transform.space = space;
	});
	this.transformationSpace.element.onmouseenter = function()
	{
		this.style.opacity = 1.0;
	};
	this.transformationSpace.element.onmouseleave = function()
	{
		this.style.opacity = 0.5;
	};

	/**
	 * Dropdown to select the world navigation mode to use.
	 *
	 * @attribute navigation
	 * @type {DropdownList}
	 */
	this.navigation = new DropdownList(this);
	this.navigation.setAltText(Locale.cameraNavigation);
	this.navigation.size.set(100, 30);
	this.navigation.position.set(40, 5);
	this.navigation.updatePosition(Component.BOTTOM_RIGHT);
	this.navigation.updateSize();
	this.navigation.addValue(Locale.firstPerson, Settings.FIRST_PERSON);
	this.navigation.addValue(Locale.orbit, Settings.ORBIT);
	this.navigation.addValue(Locale.left, Settings.PLANAR_LEFT);
	this.navigation.addValue(Locale.right, Settings.PLANAR_RIGHT);
	this.navigation.addValue(Locale.front, Settings.PLANAR_FRONT);
	this.navigation.addValue(Locale.back, Settings.PLANAR_BACK);
	this.navigation.addValue(Locale.top, Settings.PLANAR_TOP);
	this.navigation.addValue(Locale.bottom, Settings.PLANAR_BOTTOM);
	this.navigation.element.style.opacity = 0.5;
	this.navigation.setOnChange(function()
	{
		Editor.settings.editor.navigation = self.navigation.getValue();
		self.updateCameraControls(Editor.settings.editor.navigation);
	});
	this.navigation.element.onmouseenter = function()
	{
		this.style.opacity = 1.0;
	};
	this.navigation.element.onmouseleave = function()
	{
		this.style.opacity = 0.5;
	};

	/**
	 * Button to toggle snap to grid functionality
	 *
	 * @method snapGridButton
	 * @type {ButtonIcon}
	 */
	this.snapGridButton = new ButtonIcon(this);
	this.snapGridButton.position.set(5, 40);
	this.snapGridButton.size.set(30, 30);
	this.snapGridButton.setImage(Global.FILE_PATH + "icons/misc/" + (Editor.settings.editor.snap ? "grid" : "freemove") + ".png");
	this.snapGridButton.setAltText(Locale.toggleSnapToGrid);
	this.snapGridButton.setImageScale(0.8, 0.8);
	this.snapGridButton.updateSize();
	this.snapGridButton.updatePosition(Component.BOTTOM_RIGHT);
	this.snapGridButton.element.style.borderRadius = "5px";
	this.snapGridButton.updateSyles({backgroundColor: "var(--panel-color)", opacity: 0.5}, {backgroundColor: "var(--panel-color)", opacity: 1.0});
	this.snapGridButton.setOnClick(function()
	{
		Editor.settings.editor.snap = !Editor.settings.editor.snap;
		self.transform.snap = Editor.settings.editor.snap;

		self.snapGridButton.setImage(Global.FILE_PATH + "icons/misc/" + (Editor.settings.editor.snap ? "grid" : "freemove") + ".png");
	});

	/**
	 * Button to toggle the camera mode between ORTHOGRAPHIC and PERSPECTIVE.
	 *
	 * @method cameraButton
	 * @type {ButtonIcon}
	 */
	this.cameraButton = new ButtonIcon(this);
	this.cameraButton.position.set(5, 5);
	this.cameraButton.size.set(30, 30);
	this.cameraButton.setImage(Global.FILE_PATH + "icons/misc/3d.png");
	this.cameraButton.setAltText(Locale.cameraMode);
	this.cameraButton.setImageScale(0.8, 0.8);
	this.cameraButton.updateSize();
	this.cameraButton.updatePosition(Component.BOTTOM_RIGHT);
	this.cameraButton.updateSyles({backgroundColor: "var(--panel-color)", opacity: 0.5}, {backgroundColor: "var(--panel-color)", opacity: 1.0});
	this.cameraButton.element.style.borderRadius = "5px";
	this.cameraButton.setOnClick(function()
	{
		self.setCameraMode();

		if (self.cameraMode === SceneEditor.ORTHOGRAPHIC)
		{
			self.cameraButton.setImage(Global.FILE_PATH + "icons/misc/2d.png");
		}
		else if (self.cameraMode === SceneEditor.PERSPECTIVE)
		{
			self.cameraButton.setImage(Global.FILE_PATH + "icons/misc/3d.png");
		}
	});

	/**
	 * The editor tool bar is used to select tool used to manipulate objects.
	 *
	 * @attribute toolBar
	 * @type {ToolBar}
	 */
	this.toolBar = new ToolBar(this);
	this.toolBar.setMode(Component.BOTTOM_LEFT);

	/**
	 * The editor insert mode tool bar is used to select objects for insert operation.
	 *
	 * @attribute toolBar
	 * @type {ToolBar}
	 */
	this.insertModeToolBar = new InsertModeToolBar(this);
	this.insertModeToolBar.setMode(Component.BOTTOM_LEFT);

	/**
	 * Event manager to handley keyboard shortcuts.
	 *
	 * @attribute manager
	 * @type {EventManager}
	 */
	this.manager = new EventManager();
	this.manager.add(document.body, "keydown", function(event)
	{
		var key = event.keyCode;

		if (event.ctrlKey)
		{
			if (self.container.focused)
			{
				if (key === Keyboard.NUM1)
				{
					self.selectTool(SceneEditor.SELECT);
				}
				else if (key === Keyboard.NUM2)
				{
					self.selectTool(SceneEditor.MOVE);
				}
				else if (key === Keyboard.NUM3)
				{
					self.selectTool(SceneEditor.SCALE);
				}
				else if (key === Keyboard.NUM4)
				{
					self.selectTool(SceneEditor.ROTATE);
				}
				else if (key === Keyboard.F)
				{
					self.focusObject();
				}
				else if (key === Keyboard.C)
				{
					Editor.copyObject();
				}
				else if (key === Keyboard.V)
				{
					Editor.pasteObject();
				}
				else if (key === Keyboard.X)
				{
					Editor.cutObject();
				}
			}
		}
	});

	this.selectedAreas = [];
	this.selectedWithAreaObjects = [];
	this.canvas.resetCanvas();
}

SceneEditor.ORTHOGRAPHIC = 20;
SceneEditor.PERSPECTIVE = 21;

SceneEditor.SELECT = 0;
SceneEditor.SELECT_MULTIPLE = 1;
SceneEditor.INSERT = 2;
SceneEditor.MOVE = 100;
SceneEditor.SCALE = 101;
SceneEditor.ROTATE = 102;

SceneEditor.prototype = Object.create(TabComponent.prototype);

SceneEditor.prototype.createRenderer = RendererCanvas.prototype.createRenderer;
SceneEditor.prototype.reloadContext = RendererCanvas.prototype.reloadContext;
SceneEditor.prototype.forceContextLoss = RendererCanvas.prototype.forceContextLoss;

SceneEditor.prototype.updateMetadata = function()
{
	if (this.scene !== null)
	{
		this.setName(this.scene.name);

		// Check if object has a parent
		if (this.scene.parent === null)
		{
			this.close();
			return;
		}

		// Check if object exists in parent
		var children = this.scene.parent.children;
		for (var i = 0; i < children.length; i++)
		{
			if (this.scene.uuid === children[i].uuid)
			{
				return;
			}
		}

		// If not found close tab
		if (i >= children.length)
		{
			this.close();
		}
	}
};

SceneEditor.prototype.activate = function()
{
	TabComponent.prototype.activate.call(this);

	this.canvas.createRenderer();
	this.updateSettings();

	this.mouse.setLock(false);

	this.mouse.create();
	this.manager.create();

	this.selectTool(SceneEditor.SELECT);
};

SceneEditor.prototype.deactivate = function()
{
	TabComponent.prototype.deactivate.call(this);

	this.mouse.dispose();
	this.manager.destroy();
};

/**
 * Update camera controller object.
 *
 * Select a new controls object based on the mode passed as argument and attach the editor camera to it.
 *
 * @method updateCameraControls
 * @param {number} mode Camera mode.
 */
SceneEditor.prototype.updateCameraControls = function(mode, coordsSystem)
{
	if (this.controlsMode === mode)
	{
		return;
	}

	if (!coordsSystem)
	{
		throw new Error('No coords system where it should be (case 3)');
	}

	this.controlsMode = mode;

	if (mode === Settings.FIRST_PERSON)
	{
		this.controls = new EditorFreeControls();
	}
	else if (mode === Settings.ORBIT)
	{
		this.controls = new EditorOrbitControls();
	}
	else
	{
		this.controls = new EditorPlanarControls(mode);
	}

	this.controls.coordsSystem = coordsSystem;
	this.controls.attach(this.camera);
};

SceneEditor.prototype.updateSettings = function()
{
	// Grid XYZ
	this.gridHelperXYZ.visible = Editor.settings.editor.gridEnabled;
	this.gridHelperXYZ.setSize(Editor.settings.editor.gridSize);
	this.gridHelperXYZ.setSpacing(Editor.settings.editor.gridSpacing);
	this.gridHelperXYZ.update();

	// Grid XZY
	this.gridHelperXZY.visible = Editor.settings.editor.gridEnabled;
	this.gridHelperXZY.setSize(Editor.settings.editor.gridSize);
	this.gridHelperXZY.setSpacing(Editor.settings.editor.gridSpacing);
	this.gridHelperXZY.update();

	// Axis
	this.axisHelper.visible = Editor.settings.editor.axisEnabled;

	// Orientation
	var size = Editor.settings.editor.cameraRotationCubeSize;
	this.orientation.viewport.size.set(size, size);

	// Controls
	this.navigation.setValue(Editor.settings.editor.navigation);

	// Tool
	this.transformationSpace.setValue(Editor.settings.editor.transformationSpace);
	this.transform.space = Editor.settings.editor.transformationSpace;
	this.transform.snap = Editor.settings.editor.snap;
	this.transform.translationSnap = Editor.settings.editor.gridSpacing;
	this.transform.rotationSnap = Editor.settings.editor.snapAngle;
};

SceneEditor.prototype.destroy = function()
{
	TabComponent.prototype.destroy.call(this);

	this.mouse.dispose();
	this.keyboard.dispose();
	this.transform.dispose();

	this.mouse.setLock(false);

	this.canvas.forceContextLoss();
};

SceneEditor.prototype.attach = function(scene)
{
	this.scene = scene;
	this.updateMetadata();

	if (this.camera !== null)
	{
		this.scene.defaultCamera = this.camera;
	}

	if (scene.parent.coordsSystem === Program.CS_XYZ)
	{
		this.camera.rotation.reorder('XYZ');
	}
	else
	{
		this.camera.rotation.reorder('XZY');
	}

	var coordsSystem = scene.parent.coordsSystem === Program.CS_XYZ ? 'xyz' : 'xzy';

	if (Editor.settings.editor.gridEnabled)
	{
		if (coordsSystem === 'xyz')
		{
			this.gridHelperXZY.visible = false;
			this.gridHelperXYZ.visible = true;
		}
		else
		{
			this.gridHelperXZY.visible = true;
			this.gridHelperXYZ.visible = false;
		}
	}
	else
	{
		this.gridHelperXZY.visible = false;
		this.gridHelperXYZ.visible = false;
	}

	if (coordsSystem === 'xyz')
	{
		this.scene.add(this.helperPlaneXYZ);
	}
	else
	{
		this.scene.add(this.helperPlaneXZY);
	}
	this.scene.add(this.helperCube);

	this.updateCameraControls(Editor.settings.editor.navigation, coordsSystem);
};

/**
 * Check if a scene or object is attached to the editor.
 *
 * @method isAttached
 * @param {Scene} scene Scene to verify if is attached to this tab.
 */
SceneEditor.prototype.isAttached = function(scene)
{
	return this.scene === scene;
};

/**
 * Focus the first currently selected object, if there is one.
 *
 * @method focusObject
 */
SceneEditor.prototype.focusObject = function()
{
	if (Editor.selection.length > 0 && Editor.selection[0].isObject3D === true)
	{
		this.controls.focusObject(Editor.selection[0]);
	}
	else
	{
		Editor.alert(Locale.selectObjectFirst);
	}
};

/**
 * Update scene editor logic.
 *
 * @method update
 */
SceneEditor.prototype.update = function()
{
	this.mouse.update();
	this.keyboard.update();

	var isEditingObject = this.transform.update();

	// Check if mouse is inside canvas
	if (this.mouse.insideCanvas())
	{
		// Update selection
		if (this.mode === SceneEditor.SELECT || this.mode === SceneEditor.SELECT_MULTIPLE || this.mode === SceneEditor.INSERT)
		{
			if (this.mouse.buttonJustPressed(Mouse.LEFT) || this.mode === SceneEditor.SELECT_MULTIPLE || this.mode === SceneEditor.INSERT)
			{
				this.selectObjectWithMouse();
			}
		}
		else
		{
			// If mouse double clicked select object
			if (this.mouse.buttonDoubleClicked(Mouse.LEFT))
			{
				this.selectObjectWithMouse();
			}
		}

		// Lock mouse when camera is moving
		if (Editor.settings.editor.lockMouse && FWE.runningOnDesktop())
		{
			if (!isEditingObject && (this.mouse.buttonJustPressed(Mouse.LEFT) || this.mouse.buttonJustPressed(Mouse.RIGHT) || this.mouse.buttonJustPressed(Mouse.MIDDLE)))
			{
				this.mouse.setLock(true);
			}
			else if (this.mouse.buttonJustReleased(Mouse.LEFT) || this.mouse.buttonJustReleased(Mouse.RIGHT) || this.mouse.buttonJustReleased(Mouse.MIDDLE))
			{
				this.mouse.setLock(false);
			}
		}

		if (isEditingObject)
		{
			Editor.gui.inspector.updateValues();
		}
		else
		{
			// Update controls
			this.controls.update(this.mouse, this.keyboard);

			// Update grid helper position
			this.gridHelperXYZ.position.x = this.controls.position.x - this.controls.position.x % Editor.settings.editor.gridSpacing;
			this.gridHelperXYZ.position.z = this.controls.position.z - this.controls.position.z % Editor.settings.editor.gridSpacing;

			// Update grid helper position
			this.gridHelperXZY.position.x = this.controls.position.x - this.controls.position.x % Editor.settings.editor.gridSpacing;
			this.gridHelperXZY.position.y = this.controls.position.y - this.controls.position.y % Editor.settings.editor.gridSpacing;
		}
	}

	// If has objects selected
	if (Editor.hasObjectSelected())
	{
		// Update object transformation matrix
		for (var i = 0; i < Editor.selection.length; i++)
		{
			if (Editor.selection[i].matrixAutoUpdate === false)
			{
				Editor.selection[i].updateMatrix();
			}
		}

		// Update object helper
		this.objectHelper.traverse(function(children)
		{
			children.update();
		});
	}

	this.render();

};

/**
 * Render all the editor scenes to the canvas using the renderer.
 *
 * Draws the attached scene/object after that it renders the helpers and tool scenes, the overlay orientation cube and then the camera previews.
 *
 * @method render
 */
SceneEditor.prototype.render = function()
{
	if (this.canvas.renderer === null)
	{
		console.warn("Freedom World Editor: SceneEditor renderer is null.", this);
		return;
	}

	var width = this.canvas.resolution.x;
	var height = this.canvas.resolution.y;
	var canvas = this.canvas.canvas;
	var renderer = this.canvas.renderer;

	renderer.autoClear = false;
	renderer.setViewport(0, 0, width, height);
	renderer.setScissor(0, 0, width, height);

	// Clear with scene background
	renderer.setClearColor(this.scene.background);
	renderer.clear(true, true, true);

	// Render scene
	renderer.render(this.scene, this.camera);

	if (this.canvas.cssRenderer !== null)
	{
		this.canvas.cssRenderer.render(this.scene, this.camera);
	}

	renderer.render(this.helperScene, this.camera);
	renderer.render(this.toolScene, this.camera);

	// Draw camera cube
	if (Editor.settings.editor.cameraRotationCube)
	{
		var code = this.orientation.raycast(this.mouse, canvas);

		if (code !== null && (this.mouse.buttonDoubleClicked(Mouse.LEFT) || this.mouse.buttonJustPressed(Mouse.MIDDLE)))
		{
			this.controls.setOrientation(code);
		}

		renderer.clear(false, true, false);
		this.orientation.updateRotation(this.controls);
		this.orientation.render(renderer, canvas);
	}

	// Camera preview
	if (Editor.settings.editor.cameraPreviewEnabled)
	{
		renderer.setScissorTest(true);

		var previewRatio = 16.0 / 9.0;

		var viewport = new Viewport();
		viewport.width = width;
		viewport.height = height;
		viewport.offset = new Vector2(10, 10);
		viewport.size = new Vector2(Editor.settings.editor.cameraPreviewSize * previewRatio, Editor.settings.editor.cameraPreviewSize);
		viewport.anchor = Editor.settings.editor.cameraPreviewPosition;
		viewport.mode = Viewport.ABSOLUTE;
		viewport.update();
		viewport.enable(renderer);

		// Preview camera
		if (Editor.selection[0] instanceof PerspectiveCamera || Editor.selection[0] instanceof OrthographicCamera)
		{
			renderer.clear(true, true, true);

			var camera = Editor.selection[0];
			camera.resize(width, height, viewport);
			camera.setupRenderer(renderer);
			camera.render(renderer, this.scene);
		}
		// Preview all cameras in use
		else if (this.scene.cameras !== undefined && this.scene.cameras.length > 0)
		{
			renderer.clear(true, true, true);

			for (var i = 0; i < this.scene.cameras.length; i++)
			{
				var camera = this.scene.cameras[i];
				camera.resize(width, height, viewport);
				camera.setupRenderer(renderer);
				camera.render(renderer, this.scene);
			}
		}
	}

	renderer.setScissorTest(false);
};

/**
 * Update raycaster position from editor mouse position.
 *
 * @method updateRaycasterFromMouse
 */
SceneEditor.prototype.updateRaycasterFromMouse = function()
{
	this.normalized.set(this.mouse.position.x / this.canvas.size.x * 2 - 1, -(this.mouse.position.y / this.canvas.size.y) * 2 + 1);
	this.raycaster.setFromCamera(this.normalized, this.camera);
};

function cleanAreaSelectionBoundingBoxes(th)
{
	th.selectedWithAreaObjects.forEach(function(child)
	{
		if (child.userData.selectionHelper)
		{
			th.scene.remove(child);
		}
	});
}

SceneEditor.prototype.clearMultipleSelections = function()
{
	var th = this;

	cleanAreaSelectionBoundingBoxes(this);

	this.selectedAreas.forEach(function(area)
	{
		th.scene.remove(area);
	});
	this.selectedAreas = [];
};

function onAreaSelectionStart(th, elem)
{
	th.areaSelectStartPoint = {
		x: Math.round(elem.point.x),
		y: Math.round(elem.point.y),
		z: Math.round(elem.point.z)
	};

	if (!th.keyboard.keyPressed(Keyboard.CTRL))
	{
		th.clearMultipleSelections();
	}
}


function onAreaSelectionEnd(th, elem, helperCube)
{
	var selectedArea = helperCube.clone();
	selectedArea.name = 'selectedArea';

	th.scene.add(selectedArea);
	th.selectedAreas.push(selectedArea);
	var selectedChildren = th.scene.children.filter(function(child)
	{
		if (!child.userData.selectable)
		{
			return false;
		}

		var lessX, lessY, biggerX, biggerY;

		if (th.areaSelectStartPoint.x > Math.round(elem.point.x))
		{
			lessX = Math.round(elem.point.x);
			biggerX = th.areaSelectStartPoint.x;
		}
		else
		{
			lessX = th.areaSelectStartPoint.x;
			biggerX = Math.round(elem.point.x);
		}

		if (Editor.getCoordsSystem() === 'xzy')
		{
			if (th.areaSelectStartPoint.y > Math.round(elem.point.y))
			{
				lessY = Math.round(elem.point.y);
				biggerY = th.areaSelectStartPoint.y;
			}
			else
			{
				lessY = th.areaSelectStartPoint.y;
				biggerY = Math.round(elem.point.y);
			}

			return child.position.x >= lessX && child.position.y >= lessY && child.position.x <= biggerX && child.position.y <= biggerY;
		}
		else
		{
			if (th.areaSelectStartPoint.z > Math.round(elem.point.z))
			{
				lessY = Math.round(elem.point.z);
				biggerY = th.areaSelectStartPoint.z;
			}
			else
			{
				lessY = th.areaSelectStartPoint.z;
				biggerY = Math.round(elem.point.z);
			}

			return child.position.x >= lessX && child.position.z >= lessY && child.position.x <= biggerX && child.position.z <= biggerY;
		}

	});

	selectedChildren.forEach(function(child)
	{
		var boundingBox = new THREE.Box3();
		boundingBox.setFromObject(child, true);
		const helper = new THREE.Box3Helper( boundingBox, 0xff0000 );
		helper.userData.selectionHelper = true;
		th.selectedWithAreaObjects.push(helper);

		th.scene.add(helper);
	});
}

function onClickInInsertMode(th, elem)
{
	if (th.insertModeToolBar.lastSelectedObject)
	{
		var newObj = th.insertModeToolBar.lastSelectedObject.clone(true);
		newObj.position.x = Math.round(elem.point.x);
		newObj.position.y = Math.round(elem.point.y);
		newObj.position.z = Math.round(elem.point.z);
		newObj.userData.selectable = true;
		th.scene.add(newObj);
	}
	else
	{
		Editor.alert(Locale.insertModeNoObjectToInsert);
	}
}

/**
 * Select objects mouse based on the mouse position.
 *
 * @method selectObjectWithMouse
 */
SceneEditor.prototype.selectObjectWithMouse = function()
{
	this.updateRaycasterFromMouse();

	var intersects = this.raycaster.intersectObjects(this.scene.children, true);

	if (intersects.length > 0)
	{
		var selectedObj = null;
		var helperCube = this.helperInsertModeObject ? this.helperInsertModeObject : this.helperCube;
		var th = this;

		if (this.helperInsertModeObject)
		{
			this.helperCube.visible = false;
		}

		intersects.forEach(function(elem)
		{

			if (elem.object.name === 'helperPlane')
			{
				if (th.mode === SceneEditor.SELECT_MULTIPLE || th.mode === SceneEditor.INSERT)
				{
					if (th.mode === SceneEditor.SELECT_MULTIPLE)
					{
						if (!th.mouse.buttonPressed(Mouse.LEFT))
						{
							if (th.areaSelectStartPoint)
							{
								// Mouse up here
								onAreaSelectionEnd(th, elem, helperCube);
							}

							th.areaSelectStartPoint = null;

							if (Editor.getCoordsSystem() === 'xzy')
							{
								helperCube.position.x = Math.round(elem.point.x);
								helperCube.position.y = Math.round(elem.point.y);
								helperCube.position.z = 0;
							}
							else
							{
								helperCube.position.x = Math.round(elem.point.x);
								helperCube.position.y = 0;
								helperCube.position.z = Math.round(elem.point.z);
							}

							helperCube.scale.x = 1;
							helperCube.scale.y = 1;
							helperCube.scale.z = 1;
						}
						else
						{
							if (th.areaSelectStartPoint)
							{
								if (Editor.getCoordsSystem() === 'xzy')
								{
									helperCube.position.x = (th.areaSelectStartPoint.x + Math.round(elem.point.x)) / 2;
									helperCube.position.y = (th.areaSelectStartPoint.y + Math.round(elem.point.y)) / 2;
									helperCube.position.z = 0;

									helperCube.scale.x = Math.abs(Math.round(elem.point.x) - th.areaSelectStartPoint.x) + 1;
									helperCube.scale.y = Math.abs(Math.round(elem.point.y) - th.areaSelectStartPoint.y) + 1;

									if (helperCube.scale.x === 0)
									{
										helperCube.scale.x = 1;
									}

									if (helperCube.scale.y === 0)
									{
										helperCube.scale.y = 1;
									}
								}
								else
								{
									helperCube.position.x = (th.areaSelectStartPoint.x + Math.round(elem.point.x)) / 2;
									helperCube.position.y = 0;
									helperCube.position.z = (th.areaSelectStartPoint.z + Math.round(elem.point.z)) / 2;

									helperCube.scale.x = Math.abs(Math.round(elem.point.x) - th.areaSelectStartPoint.x) + 1;
									helperCube.scale.z = Math.abs(Math.round(elem.point.z) - th.areaSelectStartPoint.z) + 1;

									if (helperCube.scale.x === 0)
									{
										helperCube.scale.x = 1;
									}

									if (helperCube.scale.z === 0)
									{
										helperCube.scale.z = 1;
									}
								}
							}
							else
							{
								// Mouse down here
								onAreaSelectionStart(th, elem);
							}
						}
					}
					else
					{
						// Button click in insert mode
						if (th.mouse.buttonJustPressed(Mouse.LEFT) && th.mode === SceneEditor.INSERT)
						{
							onClickInInsertMode(th, elem);
						}

						if (Editor.getCoordsSystem() === 'xzy')
						{
							helperCube.position.x = Math.round(elem.point.x);
							helperCube.position.y = Math.round(elem.point.y);
							helperCube.position.z = 0;
						}
						else
						{
							helperCube.position.x = Math.round(elem.point.x);
							helperCube.position.y = 0;
							helperCube.position.z = Math.round(elem.point.z);
						}
					}

					helperCube.visible = true;
				}
				else
				{
					helperCube.visible = false;
				}
			}
			else if (elem.object.name === 'helperCube')
			{
				// Just pass
			}
			else if (!selectedObj)
			{
				selectedObj = elem;
			}
		});

		if (this.mode === SceneEditor.SELECT && selectedObj)
		{
			if (this.keyboard.keyPressed(Keyboard.CTRL))
			{
				if (Editor.isSelected(selectedObj.object))
				{
					Editor.unselectObject(selectedObj.object);
				}
				else
				{
					Editor.addToSelection(selectedObj.object);
				}
			}
			else
			{
				Editor.selectObject(selectedObj.object);
			}
		}
	}
};

/**
 * Update raycaster with new x and y positions (normalized -1 to 1).
 *
 * @method updateRaycaster
 * @param {number} x
 * @param {number} y
 */
SceneEditor.prototype.updateRaycaster = function(x, y)
{
	this.normalized.set(x, y);
	this.raycaster.setFromCamera(this.normalized, this.camera);
};

/**
 * Set the editor camera projection mode (ortographic or perspective).
 *
 * @method setCameraMode
 * @param {number} mode
 */
SceneEditor.prototype.setCameraMode = function(mode)
{
	if (mode === this.cameraMode)
	{
		return;
	}

	if (mode === undefined)
	{
		mode = this.cameraMode === SceneEditor.PERSPECTIVE ? SceneEditor.ORTHOGRAPHIC : SceneEditor.PERSPECTIVE;
	}

	this.cameraMode = mode;

	var aspect = this.canvas !== null ? this.canvas.size.x / this.canvas.size.y : 1.0;

	if (this.cameraMode === SceneEditor.ORTHOGRAPHIC)
	{
		this.camera = new OrthographicCamera(10, aspect, OrthographicCamera.RESIZE_HORIZONTAL);
	}
	else if (this.cameraMode === SceneEditor.PERSPECTIVE)
	{
		this.camera = new PerspectiveCamera(60, aspect);
	}

	if (this.scene !== null)
	{
		this.scene.defaultCamera = this.camera;
	}

	this.transform.camera = this.camera;

	if (this.controls !== null)
	{
		this.controls.attach(this.camera);
		this.controls.reset();
	}
};

/**
 * Select transform tool, possible values are:
 * - SceneEditor.MOVE
 * - SceneEditor.SCALE
 * - SceneEditor.ROTATE
 *
 * @param selectTool
 * @param {number} tool Tool to select.
 */
SceneEditor.prototype.selectTool = function(tool)
{
	if (tool !== undefined)
	{
		this.mode = tool;
	}

	if (this.mode === SceneEditor.MOVE)
	{
		this.transform.setMode(TransformControls.TRANSLATE);
		this.transform.space = Editor.settings.editor.transformationSpace;
	}
	else if (this.mode === SceneEditor.SCALE)
	{
		this.transform.setMode(TransformControls.SCALE);
	}
	else if (this.mode === SceneEditor.ROTATE)
	{
		this.transform.setMode(TransformControls.ROTATE);
		this.transform.space = Editor.settings.editor.transformationSpace;
	}
	else if (this.mode === SceneEditor.SELECT || this.mode === SceneEditor.SELECT_MULTIPLE || this.mode === SceneEditor.INSERT)
	{
		this.transform.setMode(TransformControls.NONE);

		if (this.mode !== SceneEditor.SELECT)
		{
			while (Editor.selection.length > 0)
			{
				Editor.unselectObject(Editor.selection[0]);
			}
		}
	}

	if (this.mode !== SceneEditor.SELECT_MULTIPLE)
	{
		this.clearMultipleSelections();
	}

	this.sideBar.setVisibility(this.mode !== SceneEditor.INSERT);

	this.helperCube.visible = false;

	this.toolBar.selectTool(tool);

	if (this.mode === SceneEditor.INSERT)
	{
		if (this.insertModeToolBar.lastSelectedObject)
		{
			this.helperInsertModeObject = this.insertModeToolBar.lastSelectedObject.clone(true);
			this.helperInsertModeObject.material = this.helperInsertModeObject.material.map(function(material)
			{
				var newMaterial = material.clone();
				newMaterial.wireframe = true;
				return newMaterial;
			});

			this.scene.add(this.helperInsertModeObject);
		}

		this.insertModeToolBar.setVisibility(true);
		this.insertModeToolBar.updateInterface();
	}
	else
	{
		if (this.helperInsertModeObject)
		{
			this.scene.remove(this.helperInsertModeObject);
			this.helperInsertModeObject = null;
		}

		this.insertModeToolBar.setVisibility(false);
		this.insertModeToolBar.updateInterface();
	}
};

/**
 * Update the selection status of the tab.
 *
 * Select the adequate helper to debug selected objects and attach the objects to the transform tools.
 *
 * @method updateSelection
 */
SceneEditor.prototype.updateSelection = function()
{
	// Filter Object3D objects only (to exclude resources)
	var selectedObjects = [];
	for (var i = 0; i < Editor.selection.length; i++)
	{
		if (Editor.selection[i].isObject3D === true)
		{
			selectedObjects.push(Editor.selection[i]);
		}
	}

	this.transform.attach(selectedObjects);
	this.objectHelper.removeAll();

	for (var i = 0; i < selectedObjects.length; i++)
	{
		var object = selectedObjects[i];

		// Camera
		if (object instanceof Camera)
		{
			this.objectHelper.add(new CameraHelper(object));
			this.objectHelper.add(new ObjectIconHelper(object, Global.FILE_PATH + "icons/camera/camera.png"));
		}
		// Light
		else if (object instanceof Light)
		{
			// Directional light
			if (object instanceof DirectionalLight)
			{
				this.objectHelper.add(new DirectionalLightHelper(object, 1));
			}
			// Light probe
			else if (object instanceof LightProbe)
			{
				this.objectHelper.add(new LightProbeHelper(object, 2));
			}
			// Point light
			else if (object instanceof PointLight)
			{
				this.objectHelper.add(new PointLightHelper(object, 1));
			}
			// RectArea light
			else if (object instanceof RectAreaLight)
			{
				this.objectHelper.add(new RectAreaLightHelper(object));
			}
			// Spot light
			else if (object instanceof SpotLight)
			{
				this.objectHelper.add(new SpotLightHelper(object));
			}
			// Hemisphere light
			else if (object instanceof HemisphereLight)
			{
				this.objectHelper.add(new HemisphereLightHelper(object, 1));
			}
			// Ambient light
			else
			{
				this.objectHelper.add(new ObjectIconHelper(object, ObjectIcons.get(object.type)));
			}
		}
		// LensFlare
		else if (object instanceof LensFlare)
		{
			this.objectHelper.add(new ObjectIconHelper(object, ObjectIcons.get(object.type)));
		}
		// Skinned Mesh
		else if (object instanceof SkinnedMesh)
		{
			this.objectHelper.add(new SkeletonHelper(object.parent));
			this.objectHelper.add(new WireframeHelper(object, 0xFFFF00));
		}
		// Bone
		else if (object instanceof Bone)
		{
			this.objectHelper.add(new SkeletonHelper(object.parent));
			this.objectHelper.add(new ObjectIconHelper(object, ObjectIcons.get(object.type)));
		}
		// Mesh
		else if (object instanceof Mesh)
		{
			this.objectHelper.add(new WireframeHelper(object, 0xFFFF00));
		}
		// Line
		else if (object instanceof Line)
		{
			this.objectHelper.add(new LineHelper(object, 0xFFFF00));
		}
		// Points
		else if (object instanceof Points)
		{
			this.objectHelper.add(new PointsHelper(object, 0xFFFF00));
		}
		// Group
		else if (object instanceof Group)
		{
			this.objectHelper.add(new BoxHelper(object, 0xFFFF00));
			this.objectHelper.add(new ObjectIconHelper(object, ObjectIcons.get(object.type)));
		}
		// Object 3D
		else
		{
			this.objectHelper.add(new ObjectIconHelper(object, ObjectIcons.get(object.type)));
		}
	}
};

SceneEditor.prototype.updateVisibility = function()
{
	TabComponent.prototype.updateVisibility.call(this);
};

SceneEditor.prototype.updateSize = function()
{
	TabComponent.prototype.updateSize.call(this);

	this.sideBar.position.set(0, 0);
	this.sideBar.size.set(40, this.size.y);
	this.sideBar.updateInterface();

	this.toolBar.position.set(this.size.x / 2 - this.toolBar.size.x / 2, 5);
	this.toolBar.updateInterface();

	this.insertModeToolBar.position.set(this.size.x / 2 - this.insertModeToolBar.size.x / 2, this.size.y - this.insertModeToolBar.size.y - 5);
	this.insertModeToolBar.updateInterface();

	var width = this.size.x - this.sideBar.size.x;
	var height = this.size.y;

	this.canvas.position.set(this.sideBar.size.x, 0);
	this.canvas.size.set(width, height);
	this.canvas.updateInterface();

	if (this.camera !== null)
	{
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}
};

export {SceneEditor};
