var ID_APP_CACHE_STATIC='static001';
var ID_APP_CACHE_DYNAMIC='dynamic001'; //

var dominio_relativo='/';
if(self.location.href.indexOf('localhost')>0){
    dominio_relativo='/'+'hack-team-sagi-a-vinganca/';
}else{
    dominio_relativo='/'+'govbr/';
}
var ambiente_app =dominio_relativo;

var ARR_FILES_SHELL_APP = [    
    ambiente_app+'index.html',
    ambiente_app+'login.html',
    //ambiente_app+'consulta.html',
    ambiente_app+'js/funcoes.js',
    ambiente_app+'css/estilos.css',
    // ambiente_app+'css/estilos_pen.gov.br.css',
    // ambiente_app+'css/reset-cachekey-32594c0dfcb4f2fb7564c33b7aa5de24.css',
    // ambiente_app+'css/reset-cachekey-32594c0dfcb4f2fb7564c33b7aa5de24.css',
    ambiente_app+'css/boostrap-4.3.1.css',
    // ambiente_app+'css/resourceplone.formwidget.datetimestyles-cachekey-4c78bbb70d44ae7b8344ecbec9841656.css',
    // ambiente_app+'css/ploneCustom-cachekey-5279e876330c8dd83447d1a0ac1c2267.css',
    // ambiente_app+'css/ploneCustom-cachekey-5279e876330c8dd83447d1a0ac1c2267.css',
    // ambiente_app+'css/resourcegovbr.policycanais-cachekey-d99a5d9fc7da1823d911e9728dd42c3a.css',
    // 'https://use.fontawesome.com/releases/v5.5.0/css/all.css',
    // '//code.jquery.com/jquery-1.8.3.min.js',
    // '//cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
    // '//barra.brasil.gov.br/barra_2.0.js',
    // ambiente_app+'css/govbrtheme-8562fb3.css',
    // ambiente_app+'js/OwlCarousel2-2.3.4/dist/assets/owl.carousel.min.css',
    // ambiente_app+'js/OwlCarousel2-2.3.4/dist/assets/owl.theme.default.min.css',
    // ambiente_app+'js/OwlCarousel2-2.3.4/dist/owl.carousel.min.js',
    ambiente_app+'js/govbrtheme.js',
    ambiente_app+'manifest.json',
    ambiente_app+'favicon.ico',
    ambiente_app+'img/android-chrome-192x192.png',
    ambiente_app+'img/android-chrome-512x512.png',
    ambiente_app+'img/android-icon-144x144.png',
    ambiente_app+'img/android-icon-192x192.png',
    ambiente_app+'img/android-icon-36x36.png',
    ambiente_app+'img/android-icon-48x48.png',
    ambiente_app+'img/android-icon-72x72.png',
    ambiente_app+'img/android-icon-96x96.png',
    ambiente_app+'img/apple-icon-114x114.png',
    ambiente_app+'img/apple-icon-120x120.png',
    ambiente_app+'img/apple-icon-144x144.png',
    ambiente_app+'img/apple-icon-152x152.png',
    ambiente_app+'img/apple-icon-180x180.png',
    ambiente_app+'img/apple-icon-57x57.png',
    ambiente_app+'img/apple-icon-60x60.png',
    ambiente_app+'img/apple-icon-72x72.png',
    ambiente_app+'img/apple-icon-76x76.png',
    ambiente_app+'img/apple-icon.png',
    ambiente_app+'img/apple-icon-precomposed.png',
    ambiente_app+'img/apple-touch-icon.png',
    ambiente_app+'img/background4.jpg',
    ambiente_app+'img/bg-hackathon.jpg',
    ambiente_app+'img/favicon-16x16.png',
    ambiente_app+'img/favicon-32x32.png',
    ambiente_app+'img/favicon-96x96.png',
    ambiente_app+'img/favicon.ico',
    ambiente_app+'img/img_fn1.png',
    ambiente_app+'img/img_fn1.psd',
    ambiente_app+'img/logo-govbr-old-white.png',
    ambiente_app+'img/ms-icon-144x144.png',
    ambiente_app+'img/ms-icon-150x150.png',
    ambiente_app+'img/ms-icon-310x310.png',
    ambiente_app+'img/ms-icon-70x70.png',
    ambiente_app+'img/safari-pinned-tab.svg',
    ambiente_app+'img/spinner.gif',
    ambiente_app+'img/undraw_app_installation_mbdv.svg',
    ambiente_app+'img/undraw_in_sync_xwsa.svg',
    ambiente_app+'img/undraw_personal_settings_kihd.png',
    ambiente_app+'img/undraw_personal_settings_kihd.svg',
    ambiente_app+'img/undraw_secure_server_s9u8.png',
    ambiente_app+'img/undraw_secure_server_s9u8.svg',
    ambiente_app+'img/undraw_Security_on_ff2u.svg',
    ambiente_app+'js/fetch.js',
    ambiente_app+'js/plataform_.js',
    ambiente_app+'js/promise.js',
    // ambiente_app+'lib/fontawesome-free-5.9.0-web/css/all.min.css',
    // ambiente_app+'lib/jquery/jquery.js',
    // ambiente_app+'lib/jquery/jquery.ui.js',
    // ambiente_app+'lib/jquery/jquery.ui.js',
    // ambiente_app+'img/hack_espj.png',
    // ambiente_app+'img/hack_geral.png',
    // ambiente_app+'img/hack_geral0.png',
    // ambiente_app+'img/hack_informacao.png',
    // ambiente_app+'img/hack_jornalismo.png',
    // ambiente_app+'img/hack_libras.png',
    // ambiente_app+'img/hack_monitoramento.png',
    // ambiente_app+'img/hack_noticias.png',
    // ambiente_app+'img/hack_pnae.png',
    // ambiente_app+'img/hack_saude.png',
    // ambiente_app+'img/hack_tempo_real.png',
    // ambiente_app+'img/img1.png',
    // ambiente_app+'img/img2.png',
    // ambiente_app+'img/img3.png',
    // ambiente_app+'img/img4.png',
    // ambiente_app+'img/img5.png'
];



var ARR_URLS_DYNAMICS_SEMPRE_ATUALIZAR=[
    'https://hs2019st.com/'
];


self.addEventListener('install', function(event){
    
    event.waitUntil(
        caches.open(ID_APP_CACHE_STATIC)
        .then(function(cache){
            return cache.addAll(ARR_FILES_SHELL_APP);
        })
        .then(function(){
            return self.skipWaiting();
        })
    )
});

self.addEventListener('activate', function(event){
    console.log('[Service Worker] Activating Service Worker ...',event);
    event.waitUntil(
        caches.keys()
        .then(function(keyList){
            return Promise.all(keyList.map(function(key){  
                console.log('caches=>',key,ID_APP_CACHE_STATIC);
                if(key!==ID_APP_CACHE_STATIC){
                    return caches.delete(key);
                }
            }))
        })
    );
    return self.clients.claim();
});

function isInArray(string, array) {
    for (var i = 0; i < array.length; i++) {
        
        if (array[i] === string) {
        return true;
        }
    }
    return false;
}

function isIndexOfArray(string, array) {
    if(typeof string=='undefined' || string=='')
        return false;

    for (var i = 0; i < array.length; i++) {   
        //console.log('teste=> ',string+' = '+array[i]);         
      if (string.indexOf(array[i])>-1) {        
        return true;
      }else{
        
      }
    }
    return false;
}
//self.addEventListener('fetch',function(event){
//    event.respondWith(fetch(event.request));
//});

self.addEventListener('fetch', function(event){
    if(isIndexOfArray(event.request.url,ARR_URLS_DYNAMICS_SEMPRE_ATUALIZAR)){          
        event.respondWith(
            caches.open(ID_APP_CACHE_DYNAMIC)
            .then(function(cache){
                return fetch(event.request)
                .then(function(res){
                    cache.put(event.request.url,res.clone());
                    return res;
                })
            })
            .catch(function(err){
                //console.log('não foi possível obter a SUPER URL, então retorna do cache',err);                
                return caches.match(event.request)
                .then(function(response){
                    if(response){
                        return response;
                    }else{
                        return ;
                    }
                })
                
            })
        )
    }else if(isInArray(event.request.url, ARR_FILES_SHELL_APP)){
        //console.log('cache statico:',event.request.url);
        event.respondWith(
            caches.match(event.request)
        );
    }else{
        event.respondWith(
            caches.match(event.request)
            .then(function(response){
                if(response){
                    return response;
                }else{
                    return fetch(event.request)
                    .then(function(res){
                        return caches.open(ID_APP_CACHE_DYNAMIC)
                        .then(function(cache){
                            cache.put(event.request.url,res.clone());
                            return res;
                        });
                    })
                    .catch(function(err){
                        //algo aconteceu de estranho
                    })
                }
            })
        );
    }
});




self.addEventListener('notificationclick',function(event){
    var notification = event.notification;
    var action = event.action;

    console.log(notification);

    if(action=='confirm'){
        console.log('Confirm was chosen');
        notification.close();
    }else{
        console.log(action);
        notification.close();
    }
});


self.addEventListener('notificationclose',function(event){
    //
});