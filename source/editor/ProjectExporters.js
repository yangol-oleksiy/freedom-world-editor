import {StaticPair} from "@as-com/pson";
import {Base64Utils} from "../core/utils/binary/Base64Utils.js";
import {FileSystem} from "../core/FileSystem.js";
import {Global} from "./Global.js";
import {Editor} from "./Editor.js";

/**
 * Responsable for package and export of project data to different platforms.
 *
 * @static
 * @class Exporters
 */
function ProjectExporters() {}

ProjectExporters.ANDROID_RUN = 100;
ProjectExporters.ANDROID_EXPORT_UNSIGNED = 101;
ProjectExporters.ANDROID_EXPORT_SIGNED = 102;

/**
 * Editor temporary data folder, should be used for operations that require temporary file storage.
 *
 * Only available on desktop.
 *
 * @static
 * @attribute TEMP
 */
ProjectExporters.TEMP = "./temp";

/**
 * Export web project to a directory.
 *
 * Saves the project and exports the runtime to run the project.
 *
 * @static
 * @method exportWebProject
 * @param {string} dir Directory to export the project to.
 */
ProjectExporters.exportWebProject = function(dir)
{
	FileSystem.makeDirectory(dir);
	FileSystem.copyFile(Global.RUNTIME_PATH + "vr.png", dir + "/vr.png");
	FileSystem.copyFile(Global.RUNTIME_PATH + "ar.png", dir + "/ar.png");
	FileSystem.copyFile(Global.RUNTIME_PATH + "fullscreen.png", dir + "/fullscreen.png");
	FileSystem.copyFile(Global.RUNTIME_PATH + "logo.png", dir + "/logo.png");
	FileSystem.copyFile(Global.RUNTIME_PATH + "index.html", dir + "/index.html");
	FileSystem.copyFile(Global.RUNTIME_PATH + "nunu.min.js", dir + "/nunu.min.js");
	Editor.saveProgram(dir + "/app.nsp", true, true, true);
};

/**
 * Export a NWJS project folder.
 *
 * Only the runtime and javascript portion of the project.
 *
 * @static
 * @method exportNWJSProject
 * @param {string} dir Output directory.
 */
ProjectExporters.exportNWJSProject = function(dir, target)
{
	// Export web project
	ProjectExporters.exportWebProject(ProjectExporters.TEMP);

	var config = Editor.program.targetConfig;

	// Write package json with nwjs builder configuration
	FileSystem.writeFile(ProjectExporters.TEMP + "/package.json", JSON.stringify(
		{
			name: Editor.program.name,
			description: Editor.program.description,
			author: Editor.program.author,
			main: "index.html",
			window:
		{
			frame: config.desktop.frame,
			fullscreen: config.desktop.fullscreen,
			resizable: config.desktop.resizable
		},
			webkit:
		{plugin: false},
			build:
		{
			output: dir,
			outputPattern: "${PLATFORM}-${ARCH}",
			packed: true,
			// targets: ["zip", "nsis7z"],
			win:
			{
				productName: Editor.program.name,
				companyName: Editor.program.author
			}
		}
		}));

	// Build application
	var system = window.require("child_process");

	// Delete temporary folders
	if (FileSystem.fileExists(ProjectExporters.TEMP))
	{
		FileSystem.deleteFolder(ProjectExporters.TEMP);
	}
};

/**
 * Export NWJS windows project.
 *
 * @static
 * @method exportWindowsProject
 * @param {string} dir Output directory.
 */
ProjectExporters.exportWindows = function(dir)
{
	ProjectExporters.exportNWJSProject(dir, "win-x64");
};

/**
 * Export NWJS linux project.
 *
 * @static
 * @method exportLinuxProject
 * @param {string} dir Output directory.
 */
ProjectExporters.exportLinux = function(dir)
{
	ProjectExporters.exportNWJSProject(dir, "linux-x64");
};

/**
 * Export NWJS macOS project.
 *
 * @static
 * @method exportMacOSProject
 * @param {string} dir Output directory.
 */
ProjectExporters.exportMacOS = function(dir)
{
	ProjectExporters.exportNWJSProject(dir, "mac-x64");
};

export {ProjectExporters};
