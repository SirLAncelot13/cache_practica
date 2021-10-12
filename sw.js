console.log("Holiwi")
const CACHE_STATIC_NAME = 'static-v1'
const CACHE_DYNAMIC_NAME = 'dynamic-v1'
const CACHE_INMUTABLE_NAME = 'inmutable-v1'

function cleanCache(cacheName, sizeItems) {
    caches.open(cacheName)
        .then(cache => {
            cache.keys().then(keys => {
                console.log(keys)
                if (keys.length >= sizeItems) {
                    cache.delete(keys[0]).then(() => {
                        cleanCache(cacheName, sizeItems)
                    })
                }
            })
        })
}

self.addEventListener('install', (event) => {
    console.log("SW: Nuevo");

    // Crear el cache y almacenar el appShell
    const promesaCache = caches.open(CACHE_STATIC_NAME).then((cache) => {
        return cache.addAll([
            '/cache_practica/',
            '/cache_practica/index.html',
            '/cache_practica/css/page.css',
            "/cache_practica/img/cheems-memes-9.jpg",
            "/cache_practica/js/app.js"
        ])
    })

    const promInmutable = caches.open(CACHE_INMUTABLE_NAME).then(cacheInmu => {
        return cacheInmu.addAll([
            'https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.js'
        ])
    })

    event.waitUntil(Promise.all([promesaCache, promInmutable]))

})

self.addEventListener('fetch', (event) => {
    // 2-. cache with network fallback (primero busca en cache, si no busca en la red)
    const respuesta = caches.match(event.request)
        .then(resp => {
            // Si la respuesta existe en cache
            if (resp) {
                return resp;
            }
            console.log("No esta en cache", event.request.url)
            //voy a la red
            return fetch(event.request)
                .then(respNet => {
                    caches.open(CACHE_DYNAMIC_NAME)
                        .then((cache) => {
                            cache.put(event.request, respNet).then(() => {
                                cleanCache(CACHE_DYNAMIC_NAME, 5)
                            })
                        })
                    return respNet.clone();
                });
        })
    event.respondWith(respuesta)

    //1-. Only cache
    //event.respondWith(caches.match(event.request)); 
})