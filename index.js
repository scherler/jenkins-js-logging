// See https://tfennelly.github.io/jenkins-js-storage
const storage = require('@jenkins-cd/storage');
const jenkinsNS = storage.jenkinsNamespace();
const logging = jenkinsNS.subspace('logging');
const categories = logging.subspace('categories');

// Make sure the console log functions are supported in the environment.
if (!console.debug) {
    console.debug = console.log;
}
if (!console.warn) {
    console.warn = console.log;
}
if (!console.error) {
    console.error = console.log;
}

/**
 * Log Level enum.
 * <p>
 * Defines simple logging levels i.e. {@link Level.DEBUG}, {@link Level.INFO}, {@link Level.WARN}, {@link Level.ERROR}.
 * <p>
 * Do not construct this class; just use the above listed static property enums.
 * @constructor
 * @see <a href="./global.html#setLogLevel">setLogLevel</a>.
 */
function Level() {
    throw new Error('Unexpected construction of the Level class. Please use the static property enums i.e. Level.DEBUG etc.');
}
/**
 * Debug log level.
 */
Level.DEBUG = { id: 'DEBUG', precedence: 0 };
/**
 * Info log level.
 */
Level.INFO = { id: 'INFO', precedence: 1};
/**
 * Warn log level.
 */
Level.WARN = { id: 'WARN', precedence: 2 };
/**
 * Error log level.
 */
Level.ERROR = { id: 'ERROR', precedence: 3 };

exports.Level = Level;

/**
 * Get the categories {StorageNamespace}.
 * <p>
 * External entities should not directly store anything in this namespace.
 * @returns {StorageNamespace} See https://tfennelly.github.io/jenkins-js-storage/.
 * @see <a href="./global.html#setLogLevel">setLogLevel</a>.
 */
exports.getCategoriesStorageNS = function() {
    return categories;
};

/**
 * Set the log {Level} for a logging category.
 * @param {string} category The category name. Use dot separated naming convention to create a category hierarchy (ala Log4J).
 * @param {Level} level The logging level for the category.
 */
exports.setLogLevel = function(category, level) {
    if (level !== Level.ERROR && level !== Level.WARN && level !== Level.INFO && level !== Level.DEBUG) {
        throw new Error('Unexpected arg type for "level". Expected one of the predefined Level enums.');
    }
    categories.set(category, level.id);
};

/**
 * Create a new Logger instance for the specified category.
 * @param {string} category The category name. Use dot separated naming convention to create a category hierarchy (ala Log4J).
 * @constructor
 * @example
 * const logging = require('@jenkins-cd/logging');
 * const logger = logging.logger('org.jenkinsci.sse');
 *
 * if (logger.isDebugEnabled()) {
 *     logger.debug('Log a message for x and y values: ', x , y);
 * }
 */
function Logger(category) {
    if (category === undefined) {
        throw new Error('Cannot create logger. Log "category" name must be specified.');
    }
    this.category = category;

    const logLevelId = categories.get(category, {checkDotParent: true});
    this.logLevel = Level[logLevelId];
    // If there's no log level set for the category, or it's set to some
    // spurious value, then default it to 'ERROR' and store it.
    if (!logLevelId || !Level[logLevelId]) {
        this.logLevel = Level.ERROR;
        categories.set(category, Level.ERROR.id);
    } else {
        this.logLevel = Level[logLevelId];
    }
}
Logger.prototype = {

    /**
     * Is the specific logging level enabled for this logger instance.
     * @param {Level} level The logging level.
     * @returns {boolean} True if the level is enabled, otherwiser false.
     * @example
     * if (logger.isEnabled(Level.DEBUG)) {
     *     logger.debug('Log a message for x and y values: ', x , y);
     * }
     */
    isEnabled: function(level) {
        return level.precedence >= this.logLevel.precedence;
    },

    /**
     * Is the {@link Level#DEBUG Level.DEBUG} logging level enabled for this logger instance.
     * <p>
     * Shorthand for <code>logger.isEnabled(Level.DEBUG)</code>.
     * @returns {boolean} True if the level is enabled, otherwiser false.
     * @example
     * if (logger.isDebugEnabled()) {
     *     logger.debug('Log a message for x and y values: ', x , y);
     * }
     */
    isDebugEnabled: function () {
        return this.isEnabled(Level.DEBUG);
    },

    /**
     * Is the {@link Level#INFO Level.INFO} logging level enabled for this logger instance.
     * <p>
     * Shorthand for <code>logger.isEnabled(Level.INFO)</code>.
     * @returns {boolean} True if the level is enabled, otherwiser false.
     * @example
     * if (logger.isInfoEnabled()) {
     *     logger.info('Log a message for x and y values: ', x , y);
     * }
     */
    isInfoEnabled: function () {
        return this.isEnabled(Level.INFO);
    },

    /**
     * Is the {@link Level#WARN Level.WARN} logging level enabled for this logger instance.
     * <p>
     * Shorthand for <code>logger.isEnabled(Level.WARN)</code>.
     * @returns {boolean} True if the level is enabled, otherwiser false.
     * @example
     * if (logger.isWarnEnabled()) {
     *     logger.warn('Log a message for x and y values: ', x , y);
     * }
     */
    isWarnEnabled: function () {
        return this.isEnabled(Level.WARN);
    },

    /**
     * Log a debug message.
     * @param {...*} message Message arguments.
     */
    debug: function (message) {
        if (this.isEnabled(Level.DEBUG)) {
            console.debug.apply(console, [this.category].concat(arguments));
        }
    },

    /**
     * Log an info message.
     * @param {...*} message Message arguments.
     */
    info: function (message) {
        if (this.isEnabled(Level.INFO)) {
            console.log.apply(console, [this.category].concat(arguments));
        }
    },

    /**
     * Log a warn message.
     * @param {...*} message Message arguments.
     */
    warn: function (message) {
        if (this.isEnabled(Level.WARN)) {
            console.warn.apply(console, [this.category].concat(arguments));
        }
    },

    /**
     * Log an error message.
     * @param {...*} message Message arguments.
     */
    error: function (message) {
        // Error messages are always logged. No need to check.
        console.error.apply(console, [this.category].concat(arguments));
    }
};

/**
 * Create a {Logger} instance for the specified category.
 * @param {string} category The category name. Use dot separated naming convention to create a category hierarchy (ala Log4J).
 * @returns {Logger} The {Logger} instance.
 */
exports.logger = function(category) {
    return new Logger(category);
};
