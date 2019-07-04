
let counter = 0;
let prev = 0;
let log = [];


function addLog(counter, length) {
  const date = new Date().toISOString().split('.')[0].replace(/T/g, ' ');
  log.push({ date, counter, length });
}

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  console.log('sw.js install')
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {

  event.waitUntil(self.clients.claim()); // Become available to all pages

  console.log('sw.js activate')

  setInterval(async () => {

    console.log('interval')

    caches.keys().then(function (names) {
      for (let name of names)
        caches.delete(name);
    });

    // const bg = self.registration.backgroundFetch.fetch(`my-fetch ${counter}`, ['/data.json'], {  title: 'json fake data'});
    // const temp = await self.registration.backgroundFetch.get(`my-fetch ${counter}`);

    const ts = Math.floor(Date.now() / 1000);
    const data = await fetch(`./data.json?${ts}`).then(res => res.json());

    console.log('sw', data.length, counter)

    addLog(counter, data.length)

    //sendMessageAll(data.length)

    if (prev !== 0 && prev !== data.length) {
      self.registration.showNotification(`Changed! (${counter}) - json.length: ${data.length} - ${ts}`, {
        tag: 'renotify',
        renotify: true
      });
    }

    prev = data.length;

    counter += 1;

    //console.log('data', bg, temp)
    //console.log('self.backgroundFetch', self.registration.backgroundFetch)

  }, 5000)

});


self.addEventListener('message', function (event) {
  //console.log("SW Received Message: " + event.data);
  console.log('message received!')
  sendMessageAll(JSON.stringify(log))
});

async function sendMessageAll(data) {
  self.clients.matchAll().then(all => all.forEach(client => {
    client.postMessage(data);
  }));
}


