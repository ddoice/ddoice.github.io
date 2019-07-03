
let counter = 0;
let prev = 0;

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  console.log('sw.js install')
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {

  console.log('sw.js activate')

  setInterval(async () => {

    caches.keys().then(function (names) {
      for (let name of names)
        caches.delete(name);
    });

    // const bg = self.registration.backgroundFetch.fetch(`my-fetch ${counter}`, ['/data.json'], {  title: 'json fake data'});
    // const temp = await self.registration.backgroundFetch.get(`my-fetch ${counter}`);

    const ts = Math.floor(Date.now() / 1000);
    const data = await fetch(`./data.json?${ts}`).then(res=>res.json())

    if(prev!== 0 && prev !== data.length) {
      self.registration.showNotification(`Changed! (${counter++}) - json.length: ${data.length} - ${ts}`, {
        tag: 'renotify',
        renotify: true
      });
    }

    prev = data.length;

    //console.log('data', bg, temp)
    //console.log('self.backgroundFetch', self.registration.backgroundFetch)
    
  }, 5000)

});




