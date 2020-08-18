if (process.env.NODE_ENV === 'production') {
  console.log('foo');
}
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
