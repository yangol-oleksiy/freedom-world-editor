import {Global} from "../../../../Global.js";
import {Editor} from "../../../../Editor.js";

/**
 * Functions related to multiple selection mode
 *
 * @class MultipleSelection
 */
function MultipleSelection()
{
}

MultipleSelection.selectedWithAreaObjects = [];

MultipleSelection.addBoundingBoxToSelectedObject = function(scene, child)
{
	var boundingBox = new THREE.Box3();
	boundingBox.setFromObject(child, true);
	const helper = new THREE.Box3Helper( boundingBox, 0xff0000 );
	helper.userData.selectionHelper = true;

	this.selectedWithAreaObjects.push(helper);

	child.userData.connectedSelectHelper = helper;

	scene.add(helper);
};

MultipleSelection.maybeDeleteBoundingBoxForObject = function(prnt, object)
{
	if (object.userData.connectedSelectHelper)
	{
		prnt.remove(object.userData.connectedSelectHelper);
		delete object.userData.connectedSelectHelper;
	}
};

MultipleSelection.clearAreaSelectionBoundingBoxes = function(th)
{
	this.selectedWithAreaObjects.forEach(function(child)
	{
		if (child.userData.selectionHelper)
		{
			th.scene.remove(child);
		}
	});
};

export {MultipleSelection};
