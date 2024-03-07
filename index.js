const core = require("@actions/core");
const tc = require("@actions/tool-cache");

async function setup() {
	// Get version of tool to be installed
	const version = core.getInput("version");

	// Download the specific version of the tool, e.g. as a tarball
	const download = getDownloadObject(version);
	const pathToTarball = await tc.downloadTool(download.url);

	const extract = download.url.endsWith(".zip") ? tc.extractZip : tc.extractTar;
	const pathToCLI = await extract(pathToTarball);

	// Expose the tool by adding it to the PATH
	core.addPath(path.join(pathToCLI, download.binPath));
}

const os = require("os");
const path = require("path");

function mapArch(arch) {
	const mappings = {
		x64: "x86_64",
		arm64: "aarch64",
	};
	return mappings[arch] || arch;
}

function mapOS(os) {
	const mappings = {
		darwin: "apple-darwin",
		linux: "unknown-linux-gnu",
		win32: "pc-windows-msvc",
	};
	return mappings[os] || os;
}

function getDownloadObject(version) {
	const platform = os.platform();
	const extension = platform === "win32" ? "zip" : "tar.gz";
	const filename = `rr_${version}_${mapArch(os.arch())}_${mapOS(platform)}`;
	const binPath = platform === "win32" ? "bin" : path.join(filename, "bin");
	const url = `https://github.com/cestef/rustreleaser/releases/download/${version}/${filename}.${extension}`;
	return {
		url,
		binPath,
	};
}

module.exports = setup;

if (require.main === module) {
	setup();
}
