# Freedom world editor

- Freedom World Editor is an open source scene editor for Freedom World online role playing game.
- Freedom World Editor is forked from nunuStudio project https://github.com/tentone/nunuStudio
- Powered by [three.js](https://github.com/mrdoob/three.js).
- Fully featured visual editor, supports a wide range of file formats, the tools are open source and completely free to use for both personal and commercial usage.
- Visual scene editor, code editor, visual tools to edit textures, materials, particle emitters and a powerful scripting API that allows the creation of complex applications using [JavaScript](https://www.javascript.com/) or [Python](https://www.python.org/).
- Fully featured [web version](https://www.nunustudio.org/build/editor/index.html) of the original nunuStudio editor is available on the nunuStudio project page.

<img src="https://raw.githubusercontent.com/tentone/nunuStudio/master/source/page/src/assets/github/web.png">

- nunuStudio [API Documentation](https://nunustudio.org/docs) with full details about the inner working of every module are available. These can also be generated from the project source code by running `npm run docs`.
- To build the project first install [Node.js LTS](https://nodejs.org/en/) and NPM:
  - The building system generates minified builds for the runtime and for the editor
  - Documentation generation uses [YuiDocs](https://yui.github.io/yuidoc/)
  - Install dependencies from npm by running `npm install --legacy-peer-deps` and additional non-npm packages using `npm run napa`
  - Build  editor, runtime and documentation, run `npm run build`


### Screenshots

<img src="https://raw.githubusercontent.com/tentone/nunuStudio/master/source/page/src/assets/github/2.png"><img src="https://raw.githubusercontent.com/tentone/nunuStudio/master/source/page/src/assets/github/3.png">
<img src="https://raw.githubusercontent.com/tentone/nunuStudio/master/source/page/src/assets/github/4.png"><img src="https://raw.githubusercontent.com/tentone/nunuStudio/master/source/page/src/assets/github/1.png">
<img src="https://raw.githubusercontent.com/tentone/nunuStudio/master/source/page/src/assets/github/5.png"><img src="https://raw.githubusercontent.com/tentone/nunuStudio/master/source/page/src/assets/github/6.png">


### Features

- Visual application editor
  - Drag and drop files directly into the project (images, video, models, ...)
  - Manage project resources.
  - Edit material, textures, shaders, code, ...
- Built on [three.js](https://threejs.org/) library
  - Real time lighting and shadow map support
  - three.js libraries can be imported into the editor
  - Wide range of file formats supported (gltf, dae, obj, fbx, 3ds, ...)
- Compatible with [WebXR](https://www.w3.org/TR/webxr/) for Virtual Reality and Augmented Reality


- The project uses [Webpack](https://webpack.js.org/) to build and bundle its code base.
  - The building system generates minified builds for the runtime and for the editor
  - JavaScript is optimized and minified using [Uglify](https://www.npmjs.com/package/uglify-js)
  - Documentation generation uses [YuiDocs](https://yui.github.io/yuidoc/)
- To build the project first install [Java](https://www.oracle.com/java/technologies/javase-jdk8-downloads.html), [Node.js](https://nodejs.org/en/) and NPM and ensure that java command is working properly.
- Install dependencies from npm by running `npm install` some dependencies are not available on npm and have to be installed by running `npm install napa`
- Install the dependencies for the project webpage running `cd source/page && npm install`
- Build  editor, runtime and documentation, run `npm run build`

### License

- The project is distributed under a MIT license that allow for commercial usage of the platform without any cost.
- The license is available on the project GitHub page
