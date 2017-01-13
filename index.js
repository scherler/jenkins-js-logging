// See https://tfennelly.github.io/jenkins-js-storage
const storage = require('@jenkins-cd/storage');
const jenkinsNS = storage.jenkinsNamespace();
const logging = jenkinsNS.subspace('logging');
const categories = logging.subspace('categories');

//
// Make sure the console log functions are supported in the environment.
//
if (!console.debug) {
    console.debug = console.log;
}
if (!console.info) {
    console.info = console.log;
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
 * Defines simple logging levels i.e. {@link Level.DEBUG}, {@link Level.LOG}, {@link Level.INFO}, {@link Level.WARN}, {@link Level.ERROR}.
 * <p>
 * Do not construct this class; just use the above listed static property enums.
 * @constructor
 * @see <a href="./global.html#setLogLevel">setLogLevel</a>.
 */
function Level() {
    throw new Error('Unexpected construction of the Level class. Please use the static property enums i.e. Level.DEBUG etc.');
}
/**
 * Debug log level (console.debug).
 */
Level.DEBUG = { id: 'DEBUG', precedence: 0 };
/**
 * Log log level (console.log).
 */
Level.LOG = { id: 'LOG', precedence: 1 };
/**
 * Info log level (console.info).
 */
Level.INFO = { id: 'INFO', precedence: 2 };
/**
 * Warn log level (console.warn).
 */
Level.WARN = { id: 'WARN', precedence: 3 };
/**
 * Error log level (console.error).
 */
Level.ERROR = { id: 'ERROR', precedence: 4 };

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
    if (level !== Level.ERROR && level !== Level.WARN && level !== Level.INFO && level !== Level.LOG && level !== Level.DEBUG) {
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
     * Is the {@link Level#LOG Level.LOG} logging level enabled for this logger instance.
     * <p>
     * Shorthand for <code>logger.isEnabled(Level.LOG)</code>.
     * @returns {boolean} True if the level is enabled, otherwiser false.
     * @example
     * if (logger.isLogEnabled()) {
     *     logger.log('Log a message for x and y values: ', x , y);
     * }
     */
    isLogEnabled: function () {
        return this.isEnabled(Level.LOG);
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
            console.debug.apply(console, logArgs(Level.DEBUG, this.category, arguments));
        }
    },

    /**
     * Log an "log" level message.
     * @param {...*} message Message arguments.
     */
    log: function (message) {
        if (this.isEnabled(Level.LOG)) {
            console.log.apply(console, logArgs(Level.LOG, this.category, arguments));
        }
    },

    /**
     * Log an info message.
     * @param {...*} message Message arguments.
     */
    info: function (message) {
        if (this.isEnabled(Level.INFO)) {
            console.info.apply(console, logArgs(Level.INFO, this.category, arguments));
        }
    },

    /**
     * Log a warn message.
     * @param {...*} message Message arguments.
     */
    warn: function (message) {
        if (this.isEnabled(Level.WARN)) {
            console.warn.apply(console, logArgs(Level.WARN, this.category, arguments));
        }
    },

    /**
     * Log an error message.
     * @param {...*} message Message arguments.
     */
    error: function (message) {
        // Error messages are always logged. No need to check.
        console.error.apply(console, logArgs(Level.ERROR, this.category, arguments));
    }
};

function logArgs(level, category, callArgs) {
    if (!callArgs || callArgs.length === 0) {
        return callArgs;
    }

    // Make an array copy of the callArgs - it's not
    // a real array (it's "array-like").
    const callArgsCopy = [];
    for (var i = 0; i < callArgs.length; i++) {
        callArgsCopy.push(callArgs[i]);
    }

    // Create the message prefix, concatenating the log info with
    // the first string arg. This will allow formatted log strings
    // to still work.
    var prefix = '[' + level.id + ' - ' + category + '] ';
    if (typeof callArgsCopy[0] === 'string') {
        prefix += callArgsCopy.shift();
    }

    // Put them all back on the "array-like" args object
    // and return it.
    callArgs[0] = prefix;
    for (var ii = 0; ii < callArgsCopy.length; ii++) {
        callArgs[ii + 1] = callArgsCopy[ii];
    }

    return callArgs;
}

/**
 * Create a {Logger} instance for the specified category.
 * @param {string} category The category name. Use dot separated naming convention to create a category hierarchy (ala Log4J).
 * @returns {Logger} The {Logger} instance.
 */
exports.logger = function(category) {
    return new Logger(category);
};
