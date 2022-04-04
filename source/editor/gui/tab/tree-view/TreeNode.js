import {Vector2, Object3D, Mesh, SkinnedMesh, InstancedMesh, Vector3, Quaternion, Math, Material, Camera} from "three";
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";
import {BufferGeometryUtils} from "three/examples/jsm/utils/BufferGeometryUtils";
import {Locale} from "../../../locale/LocaleManager.js";
import {PhysicsGenerator} from "../../../../core/utils/PhysicsGenerator.js";
import {ObjectUtils} from "../../../../core/utils/ObjectUtils.js";
import {Model} from "../../../../core/resources/Model.js";
import {Script} from "../../../../core/objects/script/Script.js";
import {PythonScript} from "../../../../core/objects/script/PythonScript.js";
import {LuaScript} from "../../../../core/objects/script/LuaScript.js";
import {Scene} from "../../../../core/objects/Scene.js";
import {Program} from "../../../../core/objects/Program.js";
import {PhysicsObject} from "../../../../core/objects/physics/PhysicsObject.js";
import {ParticleEmitter} from "../../../../core/objects/particle/ParticleEmitter.js";
import {Group} from "../../../../core/objects/misc/Group.js";
import {LightProbe} from "../../../../core/objects/lights/LightProbe.js";
import {ObjectLoader} from "../../../../core/loaders/ObjectLoader.js";
import {ObjectIcons} from "../../../utils/ObjectIcons.js";
import {Loaders} from "../../../Loaders.js";
import {SwapAction} from "../../../history/action/objects/SwapAction.js";
import {RemoveAction} from "../../../history/action/objects/RemoveAction.js";
import {MoveAction} from "../../../history/action/objects/MoveAction.js";
import {AddAction} from "../../../history/action/objects/AddAction.js";
import {ChangeAction} from "../../../history/action/ChangeAction.js";
import {ActionBundle} from "../../../history/action/ActionBundle.js";
import {SceneEditor} from "../scene-editor/SceneEditor.js";
import {ParticleEditor} from "../particle-editor/ParticleEditor.js";
import {ScriptEditor} from "../code/ScriptEditor.js";
import {PythonScriptEditor} from "../code/PythonScriptEditor.js";
import {LuaScriptEditor} from "../code/LuaScriptEditor.js";
import {CameraEditor} from "../camera/CameraEditor.js";
import {DragBuffer} from "../../DragBuffer.js";
import {Editor} from "../../../Editor.js";
import {TabComponent} from "../../../components/tabs/TabComponent.js";
import {ContextMenu} from "../../../components/dropdown/ContextMenu.js";
import {DocumentBody} from "../../../components/DocumentBody.js";
import {Component} from "../../../components/Component.js";
import {NodeScript} from "../../../../core/Main.js";
import {NodeEditor} from "../node-editor/NodeEditor.js";

/**
 * Represents a tree node element.
 *
 * A tree node is placed inside a tree view or inside another tree node.
 *
 * @class TreeNode
 * @param {TreeNode} container Parent tree node.
 */
function TreeNode(container)
{
	// Container
	this.container = container;

	// Attributes
	this.size = new Vector2(0, 0);
	this.position = new Vector2(0, 0);
	this.visible = true;

	// Object attached
	this.object = null;
	this.uuid = null;
	this.folded = false;
	this.selected = false;

	// Children and parent tree nodes
	this.parent = null;
	this.children = [];
	this.level = 0;

	// Element
	this.element = document.createElement("div");
	this.element.style.position = "absolute";
	this.element.draggable = true;
	this.element.style.left = "0px";
	this.element.style.height = "20px";
	this.element.style.width = "100%";
	this.element.style.cursor = "pointer";
	this.element.style.boxSizing = "border-box";
	this.container.element.appendChild(this.element);

	// Arrow
	this.arrow = document.createElement("img");
	this.arrow.draggable = false;
	this.arrow.style.position = "absolute";
	this.arrow.style.opacity = 0.5;
	this.arrow.style.width = "15px";
	this.arrow.style.height = "15px";
	this.arrow.style.left = "5px";
	this.arrow.style.top = "3px";
	this.element.appendChild(this.arrow);

	// Icon
	this.icon = document.createElement("img");
	this.icon.draggable = false;
	this.icon.style.position = "absolute";
	this.icon.style.pointerEvents = "none";
	this.icon.style.width = "15px";
	this.icon.style.height = "15px";
	this.icon.style.left = "25px";
	this.icon.style.top = "3px";
	this.element.appendChild(this.icon);

	// Label
	this.label = document.createElement("span");
	this.label.style.overflow = "hidden";
	this.label.style.position = "absolute";
	this.label.style.pointerEvents = "none";
	this.label.style.whiteSpace = "nowrap";
	this.label.style.top = "3px";
	this.element.appendChild(this.label);

	// Label text
	this.labelText = document.createTextNode("");
	this.label.appendChild(this.labelText);

	var self = this;
	var dragState = TreeNode.NONE;

	this.arrow.onmouseenter = function()
	{
		this.style.opacity = 1.0;
	};

	this.arrow.onmouseleave = function()
	{
		this.style.opacity = 0.5;
	};

	this.arrow.onclick = function(event)
	{
		event.stopPropagation();

		self.updateFoldedState(!self.folded);
	};

	this.element.onmouseenter = function()
	{
		if (!self.selected)
		{
			self.styleMouseOver();
		}
	};

	this.element.onmouseleave = function()
	{
		if (!self.selected)
		{
			self.styleNormal();
		}
	};

	this.element.ondragstart = function(event)
	{
		if (!self.object.locked)
		{
			event.dataTransfer.setData("uuid", self.object.uuid);
			DragBuffer.push(self.object);
		}
	};

	this.element.ondragend = function(event)
	{
		event.preventDefault();

		dragState = TreeNode.NONE;
		self.clearBorder();

		if (!self.object.locked)
		{
			DragBuffer.pop(self.object.uuid);
		}
	};

	this.element.ondragleave = function()
	{
		event.preventDefault();

		dragState = TreeNode.NONE;
		self.clearBorder();
	};

	this.element.oncontextmenu = function(event)
	{
		if (!self.object.locked)
		{
			// Scene and program flags
			var isProgram = self.object instanceof Program;
			var isScene = self.object instanceof Scene;

			// Context menu
			var context = new ContextMenu(DocumentBody);
			context.size.set(150, 20);
			context.position.set(event.clientX, event.clientY);

			// Open editor
			if (isScene)
			{
				context.addOption(Locale.sceneEditor, openSceneTab);
			}
			else if (isProgram)
			{
				context.addOption(Locale.createScene, function()
				{
					Editor.addDefaultScene();
				});
			}
			else if (self.object.isObject3D === true)
			{
				context.addOption(Locale.objectEditor, openSceneTab);

				if (self.object instanceof Script)
				{
					context.addOption(Locale.scriptEditor, openScriptTab);
				} else if (self.object instanceof LuaScript) {
					context.addOption(Locale.scriptEditor, openLuaScriptTab);
				}
				else if (self.object instanceof ParticleEmitter)
				{
					context.addOption(Locale.particleEditor, openParticleTab);
				}
			}

			if (self.object instanceof LightProbe)
			{
				context.addOption(Locale.calculateProbe, function()
				{
					self.object.generate();
				});
			}

			// Group objects
			context.addOption(Locale.groupObjects, function()
			{
				// TODO <USE THE MOVE ACTIONS INSTEAD TO KEEP EVERYTHING ON THE SAME POSITION>

				var actions = [];
				var group = new Group();
				var parent = self.object.parent;
				var found = false;

				for (var i = 0; i < Editor.selection.length; i++)
				{
					if (Editor.selection[i] instanceof Object3D)
					{
						actions.push(new RemoveAction(Editor.selection[i]));
						group.add(Editor.selection[i]);

						if (Editor.selection[i] === self.object)
						{
							found = true;
						}
					}
				}

				if (!found)
				{
					actions.push(new RemoveAction(self.object));
					group.add(self.object);
				}

				actions.push(new AddAction(group, parent));
				Editor.addAction(new ActionBundle(actions));
			});

			// Recalculate Origin
			context.addOption(Locale.centerOrigin, function()
			{
				ObjectUtils.centerGeometryOrigin(self.object);
			});

			// Rename
			context.addOption(Locale.rename, function()
			{
				Editor.renameObject(self.object);
			});

			// Delete
			if (!isProgram)
			{
				context.addOption(Locale.delete, function()
				{
					Editor.deleteObject(self.object);
				});
			}

			// Mesh specific stuff
			if (self.object instanceof Mesh || self.object instanceof SkinnedMesh || self.object instanceof InstancedMesh)
			{
				// If mesh has a geometry attached
				if (self.object.geometry !== undefined)
				{
					// Generate a convex hull for this geometry
					context.addOption(Locale.convexHull, function()
					{
						var geometry = self.object.geometry.clone();
						geometry = BufferGeometryUtils.mergeVertices(geometry);

						const vertices = [];
						const positionAttribute = geometry.getAttribute("position");

						for (var i = 0; i < positionAttribute.count; i++)
						{
							const vertex = new Vector3();
							vertex.fromBufferAttribute(positionAttribute, i);
							vertices.push(vertex);
						}

						var quickhull = new ConvexGeometry(vertices);
						Editor.addAction(new ChangeAction(self.object, "geometry", quickhull));
					});

					// Generate normals for the attached geometry
					context.addOption(Locale.computeNormals, function()
					{
						var geometry = self.object.geometry.clone();
						geometry.computeVertexNormals();
						Editor.addAction(new ChangeAction(self.object, "geometry", geometry));
					});

					// Apply transformation to geometry
					context.addOption(Locale.applyTransformation, function()
					{
						var geometry = self.object.geometry.clone();
						geometry.applyMatrix4(self.object.matrixWorld);

						var actions = [];
						actions.push(new ChangeAction(self.object, "geometry", geometry));
						actions.push(new ChangeAction(self.object, "position", new Vector3(0, 0, 0)));
						actions.push(new ChangeAction(self.object, "scale", new Vector3(1, 1, 1)));
						actions.push(new ChangeAction(self.object, "quaternion", new Quaternion(0, 0, 0, 1)));
						Editor.addAction(new ActionBundle(actions));
					});
				}
			}

			// Convert mesh to instanced mesh
			if (self.object instanceof Mesh && self.object.geometry !== undefined)
			{
				context.addOption(Locale.toInstancedMesh, function()
				{
					var instanced = new InstancedMesh(self.object.geometry, self.object.material, 1);
					instanced.position.copy(self.object.position);
					instanced.scale.copy(self.object.scale);
					instanced.quaternion.copy(self.object.quaternion);

					Editor.addAction(new SwapAction(self.object, instanced));
				});
			}

			// Add physics to object
			if (self.object instanceof Mesh || self.object instanceof SkinnedMesh)
			{
				// Add physics object
				function createPhysics(object, mode)
				{
					var physics = new PhysicsObject();
					physics.addShape(PhysicsGenerator.createShape(object, mode));
					physics.name = object.name;
					physics.position.copy(object.position);
					physics.quaternion.copy(object.quaternion);

					object.position.set(0, 0, 0);
					object.quaternion.set(0, 0, 0, 1);

					var actions = [];
					actions.push(new SwapAction(object, physics, true));
					actions.push(new AddAction(object, physics));
					Editor.addAction(new ActionBundle(actions));
				}

				var physics = context.addMenu("Add physics");

				physics.addOption(Locale.box, function()
				{
					createPhysics(self.object, PhysicsGenerator.Type.BOX);
				});

				physics.addOption(Locale.sphere, function()
				{
					createPhysics(self.object, PhysicsGenerator.Type.SPHERE);
				});

				physics.addOption(Locale.cylinder, function()
				{
					createPhysics(self.object, PhysicsGenerator.Type.CYLINDER);
				});

				physics.addOption(Locale.convexHull, function()
				{
					createPhysics(self.object, PhysicsGenerator.Type.HULL);
				});
			}

			// Change attribute of an object and all its children
			function setObjectAttribute(object, attribute, value)
			{
				var actions = [];

				if (object[attribute] !== undefined)
				{
					actions.push(new ChangeAction(object, attribute, value));
				}

				object.traverse(function(child)
				{
					actions.push(new ChangeAction(child, attribute, value));
				});

				return actions;
			};

			if (!isScene && !isProgram)
			{
				var autoUpdate = context.addMenu(Locale.static);

				// Set object and children to static mode
				autoUpdate.addOption(Locale.static, function()
				{
					var actions = setObjectAttribute(self.object, "matrixAutoUpdate", false);
					Editor.addAction(new ActionBundle(actions));
				});

				// Set object and children to dynamic mode
				autoUpdate.addOption(Locale.dynamic, function()
				{
					var actions = setObjectAttribute(self.object, "matrixAutoUpdate", true);
					Editor.addAction(new ActionBundle(actions));
				});

				var shadow = context.addMenu(Locale.shadows);

				// Set object and children shadow casting mode
				shadow.addOption(Locale.enable, function()
				{
					var cast = setObjectAttribute(self.object, "castShadow", true);
					var receive = setObjectAttribute(self.object, "receiveShadow", true);
					Editor.addAction(new ActionBundle(cast.concat(receive)));
				});

				// Set object and children shadow casting mode
				shadow.addOption(Locale.disable, function()
				{
					var cast = setObjectAttribute(self.object, "castShadow", false);
					var receive = setObjectAttribute(self.object, "receiveShadow", false);
					Editor.addAction(new ActionBundle(cast.concat(receive)));
				});

				// Duplicate object
				context.addOption(Locale.duplicate, function()
				{
					var object = new ObjectLoader().parse(self.object.toJSON());
					object.traverse(function(child)
					{
						child.uuid = Math.generateUUID();
					});
					Editor.addAction(new AddAction(object, self.object.parent));
				});

				// Copy object
				context.addOption(Locale.copy, function()
				{
					Editor.copyObject(self.object);
				});

				// Cut object
				context.addOption(Locale.cut, function()
				{
					Editor.cutObject(self.object);
				});
			}

			if (!isProgram)
			{
				// Paste object form clipboard
				context.addOption(Locale.paste, function()
				{
					Editor.pasteObject(self.object);
				});
			}

			context.updateInterface();
		}
	};

	this.element.ondragover = function(event)
	{
		event.preventDefault();

		if (DragBuffer.buffer[0] instanceof TabComponent)
		{
			return;
		}

		if (!self.object.locked)
		{
			// Object drag
			if (DragBuffer.buffer[0] instanceof Object3D)
			{
				if (event.layerY < 5)
				{
					dragState = TreeNode.ABOVE;
				}
				else if (event.layerY > 15)
				{
					dragState = TreeNode.BELLOW;
				}
				else
				{
					dragState = TreeNode.INSIDE;
				}

				self.setBorder(dragState);
			}
			// Resources, files, etc
			else
			{
				dragState = TreeNode.INSIDE;
				self.setBorder(dragState);
			}
		}
	};

	// Drop event (fired on the drop target)
	this.element.ondrop = function(event)
	{
		event.preventDefault();
		self.clearBorder();

		if (self.object.locked)
		{
			return;
		}

		// Collect element from buffer
		var uuid = event.dataTransfer.getData("uuid");
		var object = DragBuffer.get(uuid);

		// Object 3D
		if (object instanceof Object3D)
		{
			if (object === self.object)
			{
				Editor.alert(Locale.cannotAddItself);
				return;
			}
			else if (object.contains(self.object))
			{
				Editor.alert(Locale.cannotAddToChildren);
				return;
			}
			else
			{
				var selfIsScene = self.object instanceof Scene;
				var selfIsProgram = self.object instanceof Program;
				var dragIsScene = object instanceof Scene;

				// Above
				if (dragState === TreeNode.ABOVE)
				{
					if (dragIsScene && selfIsScene || !dragIsScene && !selfIsProgram && !selfIsScene)
					{
						var index = self.object.parent.children.indexOf(self.object);
						Editor.addAction(new MoveAction(object, self.object.parent, index));
					}
				}
				// Bellow
				else if (dragState === TreeNode.BELLOW)
				{
					if (dragIsScene && selfIsScene || !dragIsScene && !selfIsProgram && !selfIsScene)
					{
						var index = self.object.parent.children.indexOf(self.object) + 1;
						Editor.addAction(new MoveAction(object, self.object.parent, index));
					}
				}
				// Inside
				else // if(dragState === TreeNode.INSIDE)
				{
					if (selfIsScene && !dragIsScene || dragIsScene && selfIsProgram || !selfIsScene && !selfIsProgram && !dragIsScene)
					{
						Editor.addAction(new MoveAction(object, self.object));
					}
				}
			}
		}
		// Material
		else if (object instanceof Material)
		{
			var actions = [];
			self.object.traverse(function(children)
			{
				if (children.material !== undefined)
				{
					actions.push(new ChangeAction(children, "material", object));
				}
			});

			if (actions.length > 0)
			{
				Editor.addAction(new ActionBundle(actions));
			}
		}
		// Dragged file
		else if (event.dataTransfer.files.length > 0)
		{
			var files = event.dataTransfer.files;
			for (var i = 0; i < files.length; i++)
			{
				var file = files[i];

				if (Model.fileIsModel(file))
				{
					Loaders.loadModel(file, self.object);
				}
			}
		}
	};

	this.element.onclick = function(event)
	{
		if (event.shiftKey && Editor.selection.length > 0 && Editor.selection[Editor.selection.length - 1].isObject3D === true)
		{
			var object = Editor.selection[Editor.selection.length - 1];

			var selecting = false;
			var done = false;

			Editor.program.traverse(function(child)
			{
				if (done === true)
				{
					return;
				}

				if (selecting === false)
				{
					if (child === object || child === self.object)
					{
						if (!Editor.isSelected(child))
						{
							Editor.addToSelection(child);
						}
						selecting = true;
					}
				}
				else
				{
					if (child === object || child === self.object)
					{
						if (!Editor.isSelected(child))
						{
							Editor.addToSelection(child);
						}

						selecting = false;
						done = true;
					}
					else
					{
						Editor.addToSelection(child);
					}
				}
			});
		}
		else if (event.ctrlKey)
		{
			if (Editor.isSelected(self.object))
			{
				Editor.unselectObject(self.object);
			}
			else
			{
				Editor.addToSelection(self.object);
			}
		}
		else
		{
			Editor.selectObject(self.object);
		}
	};

	this.element.ondblclick = function()
	{
		if (!self.object.locked)
		{
			if (self.object instanceof PythonScript)
			{
				openTab(PythonScriptEditor, self.object);
			}
			else if (self.object instanceof Script)
			{
				openTab(ScriptEditor, self.object);
			}
			else if (self.object instanceof LuaScript)
			{
				openTab(LuaScriptEditor, self.object);
			}
			else if (self.object instanceof Scene)
			{
				openTab(SceneEditor, self.object);
			}
			else if (self.object instanceof ParticleEmitter)
			{
				openTab(ParticleEditor, self.object);
			}
			else if (self.object instanceof Camera)
			{
				openTab(CameraEditor, self.object);
			}
			else if (self.object instanceof NodeScript)
			{
				openTab(NodeEditor, self.object);
			}
			else
			{
				self.updateFoldedState(!self.folded);
			}
		}
	};

	// Auxiliary method to open a new tab and attach a object to it.
	function openTab(Constructor, object)
	{
		var tab = Editor.gui.tab.getTab(Constructor, object);
		if (tab === null)
		{
			tab = Editor.gui.tab.addTab(Constructor, true);
			tab.attach(self.object);
		}
		tab.select();
	}

	function openSceneTab()
	{
		openTab(SceneEditor, self.object);
	}

	function openScriptTab()
	{
		openTab(ScriptEditor, self.object);
	}

	function openLuaScriptTab()
	{
		openTab(LuaScriptEditor, self.object);
	}

	function openParticleTab()
	{
		openTab(ParticleEditor, self.object);
	}
}

TreeNode.ARROW_DOWN = "files/icons/misc/arrow_down.png";
TreeNode.ARROW_RIGHT = "files/icons/misc/arrow_right.png";

/**
 * Default value.
 *
 * @static
 * @attribute NONE
 */
TreeNode.NONE = -1;

/**
 * Place inside the object.
 *
 * @static
 * @attribute INSIDE
 */
TreeNode.INSIDE = 0;

/**
 * Place above object.
 *
 * @static
 * @attribute ABOVE
 */
TreeNode.ABOVE = 1;

/**
 * Place bellow object.
 *
 * @static
 * @attribute BELLOW
 */
TreeNode.BELLOW = 2;

TreeNode.prototype = Object.create(Component.prototype);

/**
 * Clear node element border.
 *
 * @method clearBorder
 */
TreeNode.prototype.clearBorder = function()
{
	this.element.style.border = null;
	this.element.style.borderTop = null;
	this.element.style.borderBottom = null;
};


/**
 * Set base style of the tree node.
 *
 * @method styleNormal
 */
TreeNode.prototype.styleNormal = function()
{
	this.element.style.backgroundColor = null;
};

/**
 * Set style for node selected.
 *
 * @method styleSelected
 */
TreeNode.prototype.styleSelected = function()
{
	this.element.style.backgroundColor = "var(--button-over-color)";
};

/**
 * Set style of the node on mouse over
 *
 * @method styleMouseOver
 */
TreeNode.prototype.styleMouseOver = function()
{
	this.element.style.backgroundColor = "var(--bar-color)";
};

/**
 * Set selection state of this tree node.
 *
 * @method setSelected
 * @param {boolean} selected If true set selected, otherwise se unselected.
 */
TreeNode.prototype.setSelected = function(selected)
{
	this.selected = selected;

	if (this.selected === true)
	{
		this.styleSelected();
	}
	else
	{
		this.styleNormal();
	}
};

/**
 * Set node border.
 *
 * @method setBorder
 * @param {number} place Border position.
 */
TreeNode.prototype.setBorder = function(place)
{
	this.clearBorder();

	if (place === TreeNode.ABOVE)
	{
		this.element.style.borderTop = "1px solid var(--color-gray-light)";
	}
	else if (place === TreeNode.BELLOW)
	{
		this.element.style.borderBottom = "1px solid var(--color-gray-light)";
	}
	else if (place === TreeNode.INSIDE)
	{
		this.element.style.border = "1px solid var(--color-gray-light)";
	}
};

/**
 * Attach a object to this tree element, the icon and name of the node is set automatically.
 *
 * @method attach
 * @param {Object3D} object
 */
TreeNode.prototype.attach = function(object)
{
	this.object = object;
	this.object.gui = {node: this};

	this.uuid = object.uuid;
	this.folded = object.folded;
	this.setSelected(Editor.isSelected(object));

	this.element.draggable = !object.locked;
	this.labelText.data = object.name;
	this.icon.src = this.object.locked ? ObjectIcons.locked : ObjectIcons.get(object.type);
	this.arrow.src = this.folded ? TreeNode.ARROW_RIGHT : TreeNode.ARROW_DOWN;
};

/**
 * Add tree element from object.
 *
 * @method addObject
 * @param {Object3D} object
 */
TreeNode.prototype.addObject = function(object)
{
	var element = new TreeNode(this.container);
	element.attach(object);
	element.parent = this;
	this.children.push(element);
	return element;
};

/**
 * Add tree node from object.
 *
 * @method insertObject
 * @param {Object3D} object
 * @param {number} index
 */
TreeNode.prototype.insertObject = function(object, index)
{
	var element = new TreeNode(this.container);
	element.attach(object);
	element.parent = this;
	this.children.splice(index, 0, element);
	return element;
};

/**
 * Remove element using its uuid.
 *
 * @method removeElementUUID
 */
TreeNode.prototype.removeElementUUID = function(uuid)
{
	for (var i = 0; i < this.children.length; i++)
	{
		if (this.children[i].uuid === uuid)
		{
			break;
		}
	}

	if (i < this.children.length)
	{
		var element = this.children[i];
		this.children.splice(i, 1);
		return element;
	}

	return null;
};

/**
 * Update folded state for this tree element.
 *
 * @method updatedFoldedState
 * @param {boolean} folded.
 */
TreeNode.prototype.updateFoldedState = function(folded)
{
	if (folded !== undefined)
	{
		this.folded = folded;
	}

	this.object.folded = this.folded;
	this.arrow.src = this.folded ? TreeNode.ARROW_RIGHT : TreeNode.ARROW_DOWN;
	this.container.updateChildPosition();
};

/**
 * Expand all elements from this node to the root.
 *
 * @method expandToRoot
 */
TreeNode.prototype.expandToRoot = function()
{
	var parent = this.parent;

	while (parent !== null)
	{
		parent.updateFoldedState(false);
		parent.setVisibility(true);
		parent = parent.parent;
	}

	this.element.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
};

TreeNode.prototype.destroy = function()
{
	if (this.container.element.contains(this.element))
	{
		this.container.element.removeChild(this.element);
	}

	for (var i = 0; i < this.children.length; i++)
	{
		this.children[i].destroy();
	}
};

TreeNode.prototype.updateInterface = function()
{
	if (this.visible)
	{
		var offset = this.level * 20;

		// Arrow
		if (this.object.isEmpty())
		{
			this.arrow.style.display = "none";
		}
		else
		{
			this.arrow.style.display = "block";
			this.arrow.style.left = 5 + offset + "px";
		}

		this.icon.style.left = 25 + offset + "px";
		this.label.style.left = 45 + offset + "px";
		this.labelText.data = this.object.name;

		this.element.style.display = "block";
		this.element.style.top = this.position.y + "px";

		for (var i = 0; i < this.children.length; i++)
		{
			this.children[i].updateInterface();
		}
	}
	else
	{
		this.element.style.display = "none";
	}
};

export {TreeNode};
