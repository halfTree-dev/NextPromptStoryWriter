import type { GameLevel } from './types/scripts/gameLevel';

declare global {
	var level: GameLevel;
	var logger: {
		info(message: string, ...meta: unknown[]): void;
		warn(message: string, ...meta: unknown[]): void;
		error(message: string, ...meta: unknown[]): void;
		debug(message: string, ...meta: unknown[]): void;
	};
	var data: Record<string, unknown>;

	// 以下为 storyLoader 在 vm 上下文中显式注入的全局对象。
	var console: Console;
	var Math: Math;
	var Date: DateConstructor;
	var JSON: JSON;
	var Object: ObjectConstructor;
	var Array: ArrayConstructor;
	var String: StringConstructor;
	var Number: NumberConstructor;
	var Boolean: BooleanConstructor;
}

export {};
