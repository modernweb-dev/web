console.log('my-app.js');

setTimeout(() => import('./lazy-1.js'), 100);
setTimeout(() => import('./lazy-2.js'), 1000);
