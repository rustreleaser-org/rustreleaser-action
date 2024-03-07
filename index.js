const os = require("os");
const core = require("@actions/core");
const tc = require("@actions/tool-cache");

async function setup() {
	// Get version of tool to be installed
	const version = core.getInput("version");

	// Download the specific version of the tool, e.g. as a tarball
	const download = getDownloadURL(version);

	try {
		const pathToTarball = await tc.downloadTool(download);

		const extract = download.endsWith(".zip") ? tc.extractZip : tc.extractTar;
		const pathToCLI = await extract(pathToTarball);

		console.log(`Extracted to ${pathToCLI}`);

		// Expose the tool by adding it to the PATH
		core.addPath(pathToCLI);
	} catch (error) {
		core.setFailed(
			`Binary is not available for the specified version: ${version} on ${os.arch()}_${os.platform()} (${error})`
		);
	}
}

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

function getDownloadURL(version) {
	const platform = os.platform();
	const extension = platform === "win32" ? "zip" : "tar.gz";
	const filename = `rr_${version}_${mapArch(os.arch())}_${mapOS(platform)}`;
	return `https://github.com/cestef/rustreleaser/releases/download/${version}/${filename}.${extension}`;
}

module.exports = setup;

if (require.main === module) {
	setup();
}
