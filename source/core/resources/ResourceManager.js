import {Object3D, Material, MeshBasicMaterial, SpriteMaterial, Sprite, Texture} from "three";
import {Video} from "./Video.js";
import {ResourceContainer} from "./ResourceContainer.js";
import {Resource} from "./Resource.js";
import {Image} from "./Image.js";
import {Font} from "./Font.js";
import {Audio} from "./Audio.js";

/**
 * Resource manager is used to manage available resources used by objects
 *
 * The resource manager is used to extend Object3D elements and is not meant to be used as a standalone.
 *
 * For standalone resource management use the resource container.
 *
 * @class ResourceManager
 * @module Resources
 * @extends {Object3D}
 */
function ResourceManager()
{
	Object3D.call(this);
	ResourceContainer.call(this);
}

ResourceManager.prototype = Object.create(Object3D.prototype);
Object.assign(ResourceManager.prototype, ResourceContainer.prototype);

/**
 * Dispose all the resources present in the resource manager.
 *
 * @method dispose
 */
ResourceManager.prototype.dispose = function()
{
	for (var i = 0; i < ResourceContainer.libraries.length; i++)
	{
		var library = ResourceContainer.libraries[i];

		for (var a in this[library])
		{
			if (this[library][a].dispose instanceof Function)
			{
				this[library][a].dispose();
			}
		}
	}
};

/**
 * Remove geometry from the list and replace by other.
 *
 * @method removeGeometry
 * @param {Resource} geometry
 */
ResourceManager.prototype.removeGeometry = function(geometry, defaultGeometry)
{
	this.traverse(function(child)
	{
		if (child.geometry !== undefined && child.geometry.uuid === geometry.uuid)
		{
			child.geometry = defaultGeometry;
		}
	});

	delete this.geometries[geometry.uuid];
};

/**
 * Get resource by name.
 *
 * @method getResourceByName
 * @param {string} name Resource name
 * @return {Resource} Resource if found else null
 */
ResourceManager.prototype.getResourceByName = function(name)
{
	for (var i in this.resources)
	{
		if (this.resources[i].name === name)
		{
			return this.resources[i];
		}
	}

	console.warn("Freedom World Editor: Resource " + name + " not found");
	return null;
};

/**
 * Add resource to resources manager.
 *
 * @method addResource
 * @param {Resource} Resource to add.
 */
ResourceManager.prototype.addResource = function(resource)
{
	if (resource instanceof Resource)
	{
		this.resources[resource.uuid] = resource;
	}
};

/**
 * Remove resource from font list.
 *
 * @method removeResource
 * @param {Resource} resource
 */
ResourceManager.prototype.removeResource = function(resource)
{
	delete this.resources[resource.uuid];
};

/**
 * Get image by name.
 *
 * @method getImageByName
 * @param {string} name Image name
 * @return {Image} Image if found else null
 */
ResourceManager.prototype.getImageByName = function(name)
{
	for (var i in this.images)
	{
		if (this.images[i].name === name)
		{
			return this.images[i];
		}
	}

	console.warn("Freedom World Editor: Resource " + name + " not found");
	return null;
};

/**
 * Remove image.
 *
 * @param {Image} image
 * @method removeImage
 */
ResourceManager.prototype.removeImage = function(image)
{
	if (image instanceof Image)
	{
		delete this.images[image.uuid];
	}
};


/**
 * Get video by name.
 *
 * @method getVideoByName
 * @param {string} name Video name
 * @return {Video} Video if found else null
 */
ResourceManager.prototype.getVideoByName = function(name)
{
	for (var i in this.videos)
	{
		if (this.videos[i].name === name)
		{
			return this.videos[i];
		}
	}

	console.warn("Freedom World Editor: Resource " + name + " not found");
	return null;
};

/**
 * Remove video.
 *
 * @param {Video} video
 * @method removeVideo
 */
ResourceManager.prototype.removeVideo = function(video)
{
	if (video instanceof Video)
	{
		delete this.videos[video.uuid];
	}
};

/**
 * Get material by its name.
 *
 * @method getMaterialByName
 * @param {string} name Material name
 * @return {Material} Material if found else null
 */
ResourceManager.prototype.getMaterialByName = function(name)
{
	for (var i in this.materials)
	{
		if (this.materials[i].name === name)
		{
			return this.materials[i];
		}
	}

	console.warn("Freedom World Editor: Resource " + name + " not found");
	return null;
};

/**
 * Add material to materials list.
 *
 * @method addMaterial
 * @param {Material} material Material to be added
 */
ResourceManager.prototype.addMaterial = function(material)
{
	if (material instanceof Material)
	{
 		this.materials[material.uuid] = material;
 	}
};

/**
 * Remove material from materials list, also receives default material used to replace.
 *
 * @method removeMaterial
 * @param {Material} material Material to be removed from manager.
 * @param {Material} defaultMeshMaterial Default mesh material to replace objects mesh materials.
 * @param {Material} defaultSpriteMaterial Defaul sprite material.
 */
ResourceManager.prototype.removeMaterial = function(material, defaultMeshMaterial, defaultSpriteMaterial)
{
	if (defaultMeshMaterial === undefined)
	{
		defaultMeshMaterial = new MeshBasicMaterial();
	}

	if (defaultSpriteMaterial === undefined)
	{
		defaultSpriteMaterial = new SpriteMaterial();
	}

	if (material instanceof Material)
	{
		delete this.materials[material.uuid];

		this.traverse(function(child)
		{
			if (child.material !== undefined && child.material.uuid === material.uuid)
			{
				if (child instanceof Sprite)
				{
					child.material = defaultSpriteMaterial;
				}
				else
				{
					child.material = defaultMeshMaterial;
				}
			}
		});
	}
};

/**
 * Get texture by name.
 *
 * @method getTextureByName
 * @param {string} name Texture name.
 * @return {Texture} Texture is found else null.
 */
ResourceManager.prototype.getTextureByName = function(name)
{
	for (var i in this.textures)
	{
		if (this.textures[i].name === name)
		{
			return this.textures[i];
		}
	}

	console.warn("Freedom World Editor: Resource " + name + " not found");
	return null;
};

/**
 * Add texture to texture list.
 *
 * @method addTexture
 * @param {Texture} texture
 */
ResourceManager.prototype.addTexture = function(texture)
{
	if (material instanceof Texture)
	{
 		this.textures[texture.uuid] = texture;
	}
};

/**
 * Remove texture from textures list (also receives default used to replace).
 *
 * @method removeTexture
 * @param {Texture} texture
 * @param {Texture} defaultTexture
 * @return {Texture} Texture if found, else null
 */
ResourceManager.prototype.removeTexture = function(texture, defaultTexture)
{
	if (defaultTexture === undefined)
	{
		defaultTexture = new Texture();
	}

	if (texture instanceof Texture)
	{
		delete this.textures[texture.uuid];

		this.traverse(function(child)
		{
			if (child.material !== undefined)
			{
				var material = child.material;

				if (material.map && material.map.uuid === texture.uuid)
				{
					material.map = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.bumpMap && material.bumpMap.uuid === texture.uuid)
				{
					material.bumpMap = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.normalMap && material.normalMap.uuid === texture.uuid)
				{
					material.normalMap = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.displacementMap && material.displacementMap.uuid === texture.uuid)
				{
					material.displacementMap = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.specularMap && material.specularMap.uuid === texture.uuid)
				{
					material.specularMap = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.emissiveMap && material.emissiveMap.uuid === texture.uuid)
				{
					material.emissiveMap = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.alphaMap && material.alphaMap.uuid === texture.uuid)
				{
					material.alphaMap = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.roughnessMap && material.roughnessMap.uuid === texture.uuid)
				{
					material.roughnessMap = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.metalnessMap && material.metalnessMap.uuid === texture.uuid)
				{
					material.metalnessMap = defaultTexture;
					material.needsUpdate = true;
				}
				if (material.envMap && material.envMap.uuid === texture.uuid)
				{
					material.envMap = null;
					material.needsUpdate = true;
				}
			}
		});
	}
};

/**
 * Get font by name.
 *
 * @method getFontByName
 * @param {string} name
 * @return {Font} Font if found, else null
 */
ResourceManager.prototype.getFontByName = function(name)
{
	for (var i in this.fonts)
	{
		if (this.fonts[i].name === name)
		{
			return this.fonts[i];
		}
	}

	console.warn("Freedom World Editor: Resource " + name + " not found");
	return null;
};

/**
 * Add font to fonts list.
 *
 * @method addFont
 * @param {Font} font
 */
ResourceManager.prototype.addFont = function(font)
{
	if (font instanceof Font)
	{
 		this.fonts[font.uuid] = font;
 	}
};

/**
 * Remove font from font list.
 *
 * @method removeFont
 * @param {Font} font
 * @param {Font} defaultFont
 */
ResourceManager.prototype.removeFont = function(font, defaultFont)
{
	if (defaultFont === undefined)
	{
		defaultFont = new Font();
	}

	if (font instanceof Font)
	{
		delete this.fonts[font.uuid];

		this.traverse(function(child)
		{
			if (child.font !== undefined && child.font.uuid === font.uuid)
			{
				child.setFont(defaultFont);
			}
		});
	}
};

/**
 * Get audio by name.
 *
 * @method getAudioByName
 * @param {string} name
 * @return {Audio} Audio if found, else null
 */
ResourceManager.prototype.getAudioByName = function(name)
{
	for (var i in this.audio)
	{
		if (this.audio[i].name === name)
		{
			return this.audio[i];
		}
	}

	console.warn("Freedom World Editor: Resource " + name + " not found");
	return null;
};

/**
 * Add audio to audio list.
 *
 * @param {Audio} audio
 * @method addAudio
 */
ResourceManager.prototype.addAudio = function(audio)
{
	if (audio instanceof Audio)
	{
 		this.audio[audio.uuid] = audio;
 	}
};

/**
 * Remove audio resource from the manager, replace on objects that are using it with another resource.
 *
 * @param {Audio} audio
 * @param {Audio} defaultAudio
 * @method removeAudio
 */
ResourceManager.prototype.removeAudio = function(audio, defaultAudio)
{
	if (defaultAudio === undefined)
	{
		defaultAudio = new Audio();
	}

	if (audio instanceof Audio)
	{
		delete this.audio[audio.uuid];

		this.traverse(function(child)
		{
			if (child.audio !== undefined && child.audio.uuid === audio.uuid)
			{
				child.setAudio(defaultAudio);
			}
		});
	}
};
export {ResourceManager};
