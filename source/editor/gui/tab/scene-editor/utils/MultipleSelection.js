import {Global} from "../../../../Global.js";
import {Editor} from "../../../../Editor.js";
import {Keyboard} from "../../../../../core/input/Keyboard.js";

/**
 * Functions related to multiple selection mode
 *
 * @class MultipleSelection
 */
function MultipleSelection()
{
}

MultipleSelection.selectedWithAreaObjects = [];
MultipleSelection.selectedAreas = [];

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
			if (th.scene)
			{
				th.scene.remove(child);
			}
		}
	});
};


MultipleSelection.clearMultipleSelections = function(th)
{
	MultipleSelection.clearAreaSelectionBoundingBoxes(th);

	MultipleSelection.selectedAreas.forEach(function(area)
	{
		th.scene.remove(area);
	});

	MultipleSelection.selectedAreas = [];
};

MultipleSelection.doEachSelectedField = function(func)
{
	MultipleSelection.selectedAreas.forEach(function(area)
	{
		if (Editor.getCoordsSystem() === 'xzy')
		{
			var minX = Math.min(area.userData.startPoint.x, area.userData.endPoint.x);
			var maxX = Math.max(area.userData.startPoint.x, area.userData.endPoint.x);
			var minY = Math.min(area.userData.startPoint.y, area.userData.endPoint.y);
			var maxY = Math.max(area.userData.startPoint.y, area.userData.endPoint.y);

			for (var i=minX;i<=maxX;i++)
			{
				for (var j=minY;j<=maxY;j++)
				{
					func(i, j);
				}
			}
		}
		else
		{
			Editor.alert('Unimplemented');
		}
	});
};

MultipleSelection.confirmSelectedArea = function(th, elem, helperCube)
{
	/*
	 * Cloning selected area so it will stay after selection action
	 */
	var selectedArea = helperCube.clone();
	selectedArea.name = 'selectedArea';

	th.scene.add(selectedArea);

	/*
	 * Storing selected area in our object for easy manipulations later
	 */
	MultipleSelection.selectedAreas.push(selectedArea);

	/*
	 * Storing start point along with end point for later operations
	 */
	selectedArea.userData.startPoint = Object.assign({}, th.areaSelectStartPoint);
	selectedArea.userData.endPoint = {
		x: Math.round(elem.point.x),
		y: Math.round(elem.point.y),
		z: Math.round(elem.point.z)
	};

	/*
	 * Getting existing objects actually selected (inside of selection rectangle)
	 */
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

	if (!th.keyboard.keyPressed(Keyboard.CTRL))
	{
		// Reset selection
		Editor.selection = [];
	}

	selectedChildren.forEach(function(child)
	{
		Editor.selection.push(child);

		MultipleSelection.addBoundingBoxToSelectedObject(th.scene, child);
	});
};

export {MultipleSelection};
