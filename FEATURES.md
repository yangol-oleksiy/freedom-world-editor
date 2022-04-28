# Feature set

* [x] Create scene
* [ ] Edit scene
  * [x] Place single object in select mode
  * [x] Delete selected object in select mode
  * [x] Place single object in insert mode
  * [x] Sequential place objects in insert mode
  * [x] Select multiple objects in select area mode
  * [x] Delete selected objects in select area mode
  * [x] Insert multiple objects in select area mode
  * [x] Rotate object on Z axis (vertical)
  * [x] Move object on scene
  * [ ] Scale objects
  * [ ] Move multiple objects
  * [ ] Rotate selected area
* [x] Navigate scene
  * [x] Move camera on scene during editing
  * [x] Rotate scene
  * [x] Side camera
  * [x] Top camera
* [x] Save scene
* [x] Load scene
* [x] Load objects library internal function
* [ ] Library features
  * [x] Choose object name (item option **name**)
	* [x] Choose object 3d model (item option **model**)
    * [x] Import object in fbx model format
  * [x] Choose object icon path to display in menu (item option **iconPath**)
  * [x] Flags (boolean item options)
    * [x] Flag **completePreview** for previewing object before insert in wireframe mode or complete mode
    * [x] Flag **pluginInsert** to enable/disable inserting object in select mode
    * [x] Flag **pluginInsertMode** to enable/disable inserting object in insert mode
  * [x] Choose object item types (array) option **itemTypes**
    * [x] **tile** item type for 1x1 meter objects and guaranties other tile objects are removed on place before inserting new one
    * [x] Other item types (**tree**, **house** etc.)
  * [x] Classify library object to XZY or XYZ coordinate system so it can be imported properly (option **coordinatesSystem** with value "**XZY**" or "**XYZ**")
  * [x] Setting initial scale (**initialScale** item option) for library object
  * [x] Choose icon base path for library (root option **iconsBase**), so icons paths can be relative
