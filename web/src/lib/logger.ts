type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private readonly isDevelopment = process.env.NODE_ENV === "development";
    private readonly isProduction = process.env.NODE_ENV === "production";

    private formatMessage(
        level: LogLevel,
        message: string,
        context?: LogContext
    ): string {
        // Simple format for development, no timestamps or excessive formatting
        if (this.isDevelopment) {
            return context && Object.keys(context).length > 0
                ? `${message} ${JSON.stringify(context, null, 2)}`
                : message;
        }

        // More detailed format for production logging
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        if (context && Object.keys(context).length > 0) {
            return `${prefix} ${message} ${JSON.stringify(context)}`;
        }

        return `${prefix} ${message}`;
    }

    debug(message: string, context?: LogContext): void {
        // Only show debug logs in development, and only for important debugging
        // Most debug logs will be suppressed to reduce clutter
        if (this.isDevelopment && process.env.LOG_LEVEL === "debug") {
            console.log(`🔍 ${this.formatMessage("debug", message, context)}`);
        }
    }

    info(message: string, context?: LogContext): void {
        // Only show important info messages
        if (this.isDevelopment) {
            console.log(`ℹ️  ${this.formatMessage("info", message, context)}`);
        } else {
            console.log(this.formatMessage("info", message, context));
        }
    }

    warn(message: string, context?: LogContext): void {
        console.warn(`⚠️  ${this.formatMessage("warn", message, context)}`);
    }

    error(
        message: string,
        error?: Error | unknown,
        context?: LogContext
    ): void {
        const errorContext = {
            ...context,
            ...(error instanceof Error && {
                error: {
                    message: error.message,
                    stack: this.isDevelopment ? error.stack : undefined,
                    name: error.name,
                },
            }),
        };

        console.error(
            `❌ ${this.formatMessage("error", message, errorContext)}`
        );
    } // Extension-specific logger with prefix
    extension = {
        debug: (message: string, context?: LogContext) => {
            // Only log critical extension debugging
            if (message.includes("error") || message.includes("failed")) {
                this.debug(`[EXTENSION] ${message}`, context);
            }
        },
        info: (message: string, context?: LogContext) => {
            // Only log high-level extension operations
            if (
                message.includes("Processing") ||
                message.includes("completed") ||
                message.includes("failed")
            ) {
                this.info(`🔌 Extension: ${message}`, context);
            }
        },
        warn: (message: string, context?: LogContext) =>
            this.warn(`[EXTENSION] ${message}`, context),
        error: (
            message: string,
            error?: Error | unknown,
            context?: LogContext
        ) => this.error(`[EXTENSION] ${message}`, error, context),
    };

    // Video processing logger with prefix
    video = {
        // debug: (message: string, context?: LogContext) => {
        //     // Suppress most video debug logs
        // },
        info: (message: string, context?: LogContext) => {
            this.info(`🎥 Video: ${message}`, context);
        },
        warn: (message: string, context?: LogContext) =>
            this.warn(`[VIDEO] ${message}`, context),
        error: (
            message: string,
            error?: Error | unknown,
            context?: LogContext
        ) => this.error(`[VIDEO] ${message}`, error, context),
    };

    // Database logger with prefix
    db = {
        // debug: (message: string, context?: LogContext) => {
        //     // Suppress all DB debug logs - they're too noisy
        // },
        info: (message: string, context?: LogContext) =>
            this.info(`[DB] ${message}`, context),
        warn: (message: string, context?: LogContext) =>
            this.warn(`[DB] ${message}`, context),
        error: (
            message: string,
            error?: Error | unknown,
            context?: LogContext
        ) => this.error(`[DB] ${message}`, error, context),
    };

    // Streak logger with prefix
    streak = {
        info: (message: string, context?: LogContext) =>
            this.info(`[STREAK] ${message}`, context),
        error: (
            message: string,
            error?: Error | unknown,
            context?: LogContext
        ) => this.error(`[STREAK] ${message}`, error, context),
    };

    // Practice mode logger with prefix
    practice = {
        info: (message: string, context?: LogContext) =>
            this.info(`🎯 Practice: ${message}`, context),
        warn: (message: string, context?: LogContext) =>
            this.warn(`[PRACTICE] ${message}`, context),
        error: (
            message: string,
            error?: Error | unknown,
            context?: LogContext
        ) => this.error(`[PRACTICE] ${message}`, error, context),
    };
}

export const logger = new Logger();
