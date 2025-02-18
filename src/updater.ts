import * as fs from 'fs';
import path from 'path';
import { logger } from './logger';
import * as os from 'os';

const updateCheckInverval = 5 * 60 * 1000; // Check every 5 minutes
const repluggedURL = {
	manifest: "https://replugged.dev/api/v1/store/dev.replugged.Replugged",
	download: "https://replugged.dev/api/v1/store/dev.replugged.Replugged.asar?type=install"
}
const configDir = path.join(process.env.APPDATA!,'roaming/replugged/')// temporary constant configDir

async function checkForUpdates() {
	try {
		const manifestPath = path.join(configDir, "replugged.json");
		const asarPath = path.join(configDir, "replugged.asar");

		let currentVersion: string | undefined;
		if (fs.existsSync(manifestPath)) {
			const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
			currentVersion = manifest.version;
		}

		const manifestResponse = await fetch(repluggedURL.manifest);
		if (!manifestResponse.ok) {
			console.error("Failed to fetch manifest:", manifestResponse.status, manifestResponse.statusText);
			return;
		}

		const latestManifest = await manifestResponse.json();

		if (!currentVersion || currentVersion !== latestManifest.version) {
		console.log("Update available! Downloading...");
        
		const res = await fetch(repluggedURL.download, {
			method: "GET",
		});

		if (!res.ok) {
			throw new Error(`Failed to download Replugged: ${res.status} ${res.statusText}`);
		}

		console.log("Saving to disk");

		if (!(fs.existsSync(configDir))) { // Ensure config directory exists
			fs.mkdirSync(configDir);
		}

		logger.debug(`Writing ${asarPath}`);
		fs.writeFileSync(asarPath, res); // fucked? possibly download to os.tmpdir() instead of memory ψ(._. )>
		logger.debug(`Writing ${manifestPath}`);
		fs.writeFileSync(manifestPath, JSON.stringify(latestManifest)); // Write the new manifest

		console.log("Update completed successfully.");
		// Optionally, emit a system notification or other alert here.

	  	} else {
			console.log("No update available.");
	  	}
	} catch (error) {
		console.error("Error checking for updates:", error);
	}
}

// Initial check
checkForUpdates();

// Set up interval for subsequent checks
setInterval(checkForUpdates, updateCheckInverval);
export function updateCheck() {

}
export function downloadReplugged() {

}