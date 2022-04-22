
# Freedom World Editor

## The main goal of Freedom World Editor

### In short

**Freedom World Editor** (**FWE**) is a mapmaking tool and it is about placing, managing map objects on a 2d/3d game grid.
And it tends to be extensible enough for everything other, map-related and project-specific.

### What maps can be made using Freedom World Editor ?

Has potential to be used in 90+% of games you make.
Can be easily used for near 30% of games at this point.
Hard to use for some games once but easy if you'll adapt editor for your needs. So usability of **FWE** software depends much on developer who uses it.

#### Well suited for
Top-down games (simple RTS, RPG, shooters), platformers,
any other games with grid structure of levels.

#### Hard to use for
* Any games with hex grid. Hex grid is not supported now but could be.
* Games with many unique models on level.

#### Not suited for
* Complex (heightmap-based) terrain editing. It's not supported now. No terrain editing but you can place some terrain inside of editor as an object. Also you are able to create and use some plugin for terrain.
* Creating unique design buildings (it's complex feature and shouldn't be done soon)

## Multi project tool

Freedom World Editor is designed to be used for any game project in general.
This is why it called **Freedom** World Editor.

This could be accomplished because of editor design.

Here are base concepts which give **FWE** flexibility and power.

* Libraries concept (flexibility for level designers mostly)
* Placeholders concept (flexibility for developers and level designers)
* Open source and extensibility (flexibility for game developers mostly)
 * Simple level import/export format (ability connecting to other software)

### Libraries concept

Objects you can place on a map are organized into libraries.

**Library of objects** is a set of 3d models in specific format and configuration that glues all in one and allows all the libraries to appear inside of editor.

Libraries can be created once and be open sourced and shared or unavailable to others.

You can use one library for dark gothic game and other library for nice and light nature scenes. Libraries created once and can be reusable. So it's a subject for sharing and contributing. And also you can create different maps/games based on different libraries.

#### Libraries examples
* Game based libraries
	* Library of 2d tiles for platformer
	* Library of 3d objects for some RTS
	* etc...
* Game setting based libraries
	* Library of objects in multiplication setting
	* Library of objects in dark setting
	* etc...
* Scene specific libraries
	* Library of nature objects (trees, plants etc)
	* Library of house objects (table, chair etc)
	* Library of wrecks to use it in post-apocalyptic worlds
	* etc...
* Game specific libraries
	* Library with unique objects that can't be reused because of closing source
	* Library of placeholder objects for specific game logic

So if you are game developer you are configuring **FWE** for using specific libraries, extend it as you need and you can deliver **simple game-specific unique level editor** to level designers.

And that is much power and flexibility.

### Placeholders concept

**FWE** is good for managing objects of few types.  If you need a wood part with 10 unique trees there is no point to make library of 10 trees for it. It is an option but there are other options.

You can
* Create area placeholder object and programmatically place 10 different trees on that area during level run. So you'll see some placeholder object during level design
* Using single placeholder object of "tree" type and programmatically make different trees during level run. So during level design you'll see single tree type 10 times but during level running you'll see different trees.
* Make a plugin "random tree" so you'll have single button "tree" to place trees but any tree will have option to choose different model in place

There is much potential in using placeholders concept and it gives editor flexibility and power.

### Open source and extensibility

Currently **FWE** is open source software so you can do almost anything you want with it. **MIT** license gives a lot of freedom.
You need to know **JavaScript** to extend editor.

There are some plans to make API for plugin making but currently only modifications to the source is the way.

### Simple level import/export format
Any object of level is a simple data consisting of

* Coordinates
* Rotation
* Object type

So it's easy to import/export levels using json structure.
