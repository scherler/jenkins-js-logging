# Jenkins client-side Logging

Client-side Logging APIs for Jenkins.

This API supports <u>_hierarchical logging categories_</u> i.e. if the log [Level] for a category is not configured (see [setLogLevel]), the log [Level] for that category will come from the "dot parent" category i.e. if you create a logger for category "`a.b.c`", but "`a.b.c`" is not configured with a log [Level], it will check and use the log level configured on "`a.b`" etc.

## logger(category)
Create a [Logger] instance for logging to the specified category.

* <u>category</u>: The log category for the logger. See above notes on _hierarchical logging categories_. 

__Note__: The [Logger] instance will default to [Level.ERROR] if the category is not configured (and none of it's "dot parents").

```javascript
const logging = require('@jenkins-cd/logging');
const logger = logging.logger('org.jenkinsci.sse');

// Log messages ...
if (logger.isDebugEnabled()) {
    logger.debug('Log a message for x and y values: ', x , y);
}
```

See the [Logger] class for detail on the [Logger] methods.
 
## setLogLevel(category, [level])
Set the logging [Level] for the specified log category. 

* <u>category</u>: The log category to be configured. See above notes on _hierarchical logging categories_. 
* <u>level</u>: The log [Level].

This function is intended for use by browser tooling (e.g. Chrome Developer Extension) for configuring the log levels.

```javascript
const logging = require('@jenkins-cd/logging');

logging.setLogLevel('org.jenkinsci.sse', logging.Level.DEBUG);
```
 
## getCategoriesStorageNS
Get the [`StorageNamespace`](https://www.npmjs.com/package/@jenkins-cd/storage) used to store log level configurations.

This function is intended for use by browser tooling (e.g. Chrome Developer Extension) for configuring the log levels.

[Level]: ./Level.html
[Level.ERROR]: ./Level.html#ERROR
[Logger]: ./Logger.html
[setLogLevel]: ./global.html#setLogLevel
[@jenkins-cd/storage]: https://www.npmjs.com/package/@jenkins-cd/storage