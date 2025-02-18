import * as fs from 'fs';
import { logger } from './logger';
import path from 'path';
import { DiscordPath } from './types';

function findWindowsDiscordPath(appName: string): string | undefined {
	const appData = process.env.APPDATA;
	if (!appData) return undefined;

	const basePath = path.join(appData, 'Local', appName);
	return fs.existsSync(basePath) && !fs.existsSync(path.join(basePath, '.dead'))
		? path.resolve(basePath)
		: undefined;
}

function findLinuxDiscordPath(appName: string): string | undefined {
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	if (!homeDir) return undefined;

	const possiblePaths = [
		path.join(homeDir, '.config', appName),
		path.join(homeDir, '.local', 'share', appName),
		`/usr/local/bin/${appName}`,
		`/usr/bin/${appName}`
	]
	//change to this later https://github.com/replugged-org/replugged/blob/main/scripts/inject/platforms/linux.mts#L81

	for (const p of possiblePaths) {
		if (fs.existsSync(p) && !fs.lstatSync(p).isSymbolicLink()) { //Check if it's not a symlink cuz shit could break ≡[。。]≡
			return p;
		}
	}
	return undefined;
}

export function getDiscordPath(): DiscordPath | null {
	const discordPath: DiscordPath = {};

	switch (process.platform) {
		case "linux":
			discordPath.stable = findLinuxDiscordPath("discord");
			discordPath.canary = findLinuxDiscordPath("discord-canary");
			discordPath.ptb = findLinuxDiscordPath("discord-ptb");
			break;
		case "win32":
			discordPath.stable = findWindowsDiscordPath("Discord");
			discordPath.canary = findWindowsDiscordPath("DiscordCanary");
			discordPath.ptb = findWindowsDiscordPath("DiscordPTB");
			break;
		default:
			logger.error("Unsupported OS:", process.platform);
			process.exit(1);
	}

	// Check if at least one path was found. Return null if none are available.
	if (Object.values(discordPath).some(p => p !== undefined)) {
		logger.info("Located discord:", discordPath)
		return discordPath;
	} else {
		return null;
	}
}


