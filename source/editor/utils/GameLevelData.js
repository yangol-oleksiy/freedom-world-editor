import {Editor} from '../Editor.js';
/**
 * Stores and manages icons of the object types available in the platform.
 *
 * @static
 * @class GameLevelData
 */
function GameLevelData()
{
	this.objectsCache = {};
	this.lastInsertedX = null;
	this.lastInsertedY = null;
}

GameLevelData.prototype.processSceneObjectsBeforeSetting = function(scene, newObj, objOptions, key)
{
	if (!this.objectsCache[key])
	{
		this.objectsCache[key] = [];
	}

	var th = this;

	// Removing objects from scene if needed
	this.objectsCache[key].forEach(function(oldObj)
	{
		th.processSceneObjectBeforeSettingNewOne(scene, newObj, objOptions, key, oldObj.object, oldObj.options);
	});
};

GameLevelData.prototype.processSceneObjectsAfterSetting = function(scene, newObj, objOptions, key)
{
	// Removing objects from cache if we removed objects from scene
	this.objectsCache[key] = this.objectsCache[key].filter(function(obj)
	{
		return Boolean(obj.object.getScene());
	});
};


// Copied from here https://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
// Return elements of array a that are also in b in linear time:
function intersect(a, b)
{
	return a.filter(Set.prototype.has, new Set(b));
}

GameLevelData.prototype.processSceneObjectBeforeSettingNewOne = function(scene, newObj, objOptions, key, oldObj, oldObjOptions)
{
	// Deleting messy objects
	var types1 = objOptions.itemTypes ? objOptions.itemTypes : [];
	var types2 = oldObjOptions.itemTypes ? oldObjOptions.itemTypes : [];
	var intersection = intersect(types1, types2);

	if (intersection.length > 0)
	{
		// So only one tile can be at one position, or only one tree can be at one position, old objects should be deleted
		scene.remove(oldObj);
	}
};

GameLevelData.prototype.setSceneObject = function(scene, obj, objOptions = {})
{
	if (obj.rotation.x !== 0 || obj.rotation.y !== 0 || obj.rotation.z !== 0)
	{
		var newObj = new THREE.Object3D();
		newObj.add(obj);
		newObj.name = 'rotationFixObject';
		newObj.userData.isRotationFixObject = true;
		newObj.position.copy(obj.position);
		newObj.parent = scene;

		obj.position.x = 0;
		obj.position.y = 0;
		obj.position.z = 0;

		obj = newObj;
	}

	if (objOptions.initialScale) {
		obj.scale.x = objOptions.initialScale;
		obj.scale.y = objOptions.initialScale;
		obj.scale.z = objOptions.initialScale;
	}

	obj.userData.selectable = true;

	var key = Editor.getCoordsSystem() === 'xzy'
		? obj.position.x + '_' + obj.position.y
		: obj.position.x + '_' + obj.position.z;

	this.processSceneObjectsBeforeSetting(scene, obj, objOptions, key);

	this.objectsCache[key].push({
		object: obj,
		options: objOptions
	});

	scene.add(obj);

	this.processSceneObjectsAfterSetting(scene, obj, objOptions, key);

	this.lastInsertedX = obj.position.x;
	this.lastInsertedY = Editor.getCoordsSystem() === 'xzy' ? obj.position.y : obj.position.z;

	return obj;
};

export {GameLevelData};
