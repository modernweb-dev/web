const { namedFoo, namedBar } = require('./named-exports');

module.exports.requiredNamedFoo = namedFoo;
module.exports.requiredNamedBar = namedBar;
