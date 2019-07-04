
let poller;
let counter = 0;
let prev = 0;
let log = [];


function addLog(counter, length) {
  const date = new Date().toISOString().split('.')[0].replace(/T/g, ' ');
  log.push({ date, counter, length });
}

function startPoller() {

  clearInterval(poller);
  poller = setInterval(async () => {

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

    sendMessageAll(JSON.stringify({ content: [log[log.length - 1]], target: '#live' }));


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

}

function stopPoller() {
  clearInterval(poller);
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
  startPoller();
});


self.addEventListener('message', function (event) {
  //console.log("SW Received Message: " + event.data);
  const { data: type } = event;
  console.log('message received!', type, JSON.stringify(log))
  type === 'log' && sendMessageAll(JSON.stringify({ content: log, target: '#err' }))
  type === 'start' && startPoller();
  type === 'stop' && stopPoller();
});

async function sendMessageAll(data) {
  self.clients.matchAll().then(all => all.forEach(client => {
    client.postMessage(data);
  }));
}


