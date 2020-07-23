console.log(
  'dynamically importing stage 3 features, these should throw errors on browsers that dont support them but it should not crash babel parsing',
);

import('./stage-3-class-fields.js');
import('./stage-3-private-class-fields.js');
