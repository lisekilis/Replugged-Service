import { PathLike } from "node:fs";

export interface DiscordPath {
	stable?:PathLike,
	canary?:PathLike,
	ptb?:PathLike,
}