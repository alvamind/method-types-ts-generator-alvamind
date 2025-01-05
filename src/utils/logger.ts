import chalk from 'chalk';

export type LogLevel = 'silent' | 'info' | 'debug';

export class Logger {
    private static instance: Logger;
    private currentLevel: LogLevel = 'silent';

    private constructor() { }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    setLevel(level: LogLevel): void {
        this.currentLevel = level;
    }

    debug(message: string): void {
        if (this.currentLevel === 'debug') {
            console.log(chalk.gray(`[DEBUG] ${message}`));
        }
    }

    info(message: string): void {
        if (this.currentLevel === 'info' || this.currentLevel === 'debug') {
            console.log(message);
        }
    }

    success(message: string): void {
        if (this.currentLevel !== 'silent') {
            console.log(chalk.green(message));
        }
    }

    error(message: string): void {
        console.error(chalk.red(message));
    }
}

export const logger = Logger.getInstance();
