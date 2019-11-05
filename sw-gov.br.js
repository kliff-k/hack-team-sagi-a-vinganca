var ID_APP_CACHE_STATIC='static02';
var ID_APP_CACHE_DYNAMIC='dynamic02'; //

var dominio_relativo='/';
if(self.location.href.indexOf('localhost')>0){
    dominio_relativo='/'+'hack-team-sagi-a-vinganca/';
}else{
    dominio_relativo='/'+'conta/';
}
var ambiente_app =dominio_relativo;


//array com os arquivos do shell da aplicação, para montagem do layout e carregamento mais rápido
// var ARR_FILES_SHELL_APP = [    
//     'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
//     '//barra.brasil.gov.br/barra_2.0.js',
//     'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
//     'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
//     ambiente_app+'css/estilos.css',
//     ambiente_app+'favicon.ico',
//     ambiente_app+'img/android-chrome-192x192.png',
//     ambiente_app+'img/android-chrome-512x512.png',
//     ambiente_app+'img/android-icon-144x144.png',
//     ambiente_app+'img/android-icon-192x192.png',
//     ambiente_app+'img/android-icon-36x36.png',
//     ambiente_app+'img/android-icon-48x48.png',
//     ambiente_app+'img/android-icon-72x72.png',
//     ambiente_app+'img/android-icon-96x96.png',
//     ambiente_app+'img/apple-icon-114x114.png',
//     ambiente_app+'img/apple-icon-120x120.png',
//     ambiente_app+'img/apple-icon-144x144.png',
//     ambiente_app+'img/apple-icon-152x152.png',
//     ambiente_app+'img/apple-icon-180x180.png',
//     ambiente_app+'img/apple-icon-57x57.png',
//     ambiente_app+'img/apple-icon-60x60.png',
//     ambiente_app+'img/apple-icon-72x72.png',
//     ambiente_app+'img/apple-icon-76x76.png',
//     ambiente_app+'img/apple-icon.png',
//     ambiente_app+'img/apple-icon-precomposed.png',
//     ambiente_app+'img/apple-touch-icon.png',
//     ambiente_app+'img/background4.jpg',
//     ambiente_app+'img/bg-hackathon.jpg',
//     ambiente_app+'img/favicon-16x16.png',
//     ambiente_app+'img/favicon-32x32.png',
//     ambiente_app+'img/favicon-96x96.png',
//     ambiente_app+'img/favicon.ico',
//     ambiente_app+'img/img_fn1.png',
//     ambiente_app+'img/img_fn1.psd',
//     ambiente_app+'img/logo-govbr-old-white.png',
//     ambiente_app+'img/ms-icon-144x144.png',
//     ambiente_app+'img/ms-icon-150x150.png',
//     ambiente_app+'img/ms-icon-310x310.png',
//     ambiente_app+'img/ms-icon-70x70.png',
//     ambiente_app+'img/safari-pinned-tab.svg',
//     ambiente_app+'img/spinner.gif',
//     ambiente_app+'img/undraw_app_installation_mbdv.svg',
//     ambiente_app+'img/undraw_in_sync_xwsa.svg',
//     ambiente_app+'img/undraw_personal_settings_kihd.png',
//     ambiente_app+'img/undraw_personal_settings_kihd.svg',
//     ambiente_app+'img/undraw_secure_server_s9u8.png',
//     ambiente_app+'img/undraw_secure_server_s9u8.svg',
//     ambiente_app+'img/undraw_Security_on_ff2u.svg',
//     ambiente_app+'index.html',
//     ambiente_app+'js/fetch.js',
//     ambiente_app+'js/funcoes.js',
//     ambiente_app+'js/plataform_.js',
//     ambiente_app+'js/promise.js',
//     ambiente_app+'lib/fontawesome-free-5.9.0-web/css/all.min.css',
//     ambiente_app+'lib/jquery/jquery.js',
//     ambiente_app+'lib/jquery/jquery.ui.js',
// ];

// //ambiente_app+'PremioRosaniCunha_2016_1.pdf',


// var ARR_URLS_DYNAMICS_SEMPRE_ATUALIZAR=[
    
// ];


// self.addEventListener('install', function(event){
//     console.log('[Service Worker] Installing Service Worker ...',event);
//     event.waitUntil(
//         caches.open(ID_APP_CACHE_STATIC)
//         .then(function(cache){
//             return cache.addAll(ARR_FILES_SHELL_APP);
//         })
//         .then(function(){
//             return self.skipWaiting();
//         })
//     )
// });

// self.addEventListener('activate', function(event){
//     console.log('[Service Worker] Activating Service Worker ...',event);
//     event.waitUntil(
//         caches.keys()
//         .then(function(keyList){
//             return Promise.all(keyList.map(function(key){  
//                 console.log('caches=>',key,ID_APP_CACHE_STATIC);
//                 if(key!==ID_APP_CACHE_STATIC){
//                     return caches.delete(key);
//                 }
//             }))
//         })
//     );
//     return self.clients.claim();
// });

// function isInArray(string, array) {
//     for (var i = 0; i < array.length; i++) {
        
//         if (array[i] === string) {
//         return true;
//         }
//     }
//     return false;
// }

// function isIndexOfArray(string, array) {
//     if(typeof string=='undefined' || string=='')
//         return false;

//     for (var i = 0; i < array.length; i++) {   
//         //console.log('teste=> ',string+' = '+array[i]);         
//       if (string.indexOf(array[i])>-1) {        
//         return true;
//       }else{
        
//       }
//     }
//     return false;
// }
// // self.addEventListener('fetch',function(event){
// //     event.respondWith(fetch(event.request));
// // });

// self.addEventListener('fetch', function(event){
//     if(isIndexOfArray(event.request.url,ARR_URLS_DYNAMICS_SEMPRE_ATUALIZAR)){          
//         event.respondWith(
//             caches.open(ID_APP_CACHE_DYNAMIC)
//             .then(function(cache){
//                 return fetch(event.request)
//                 .then(function(res){
//                     cache.put(event.request.url,res.clone());
//                     return res;
//                 })
//             })
//             .catch(function(err){
//                 console.log('não foi possível obter a SUPER URL, então retorna do cache',err);
                
//                 return caches.match(event.request)
//                 .then(function(response){
//                     if(response){
//                         return response;
//                     }else{
//                         return ;
//                     }
//                 })
                
//             })
//         )
//     }else if(isInArray(event.request.url, ARR_FILES_SHELL_APP)){
//         //console.log('cache statico:',event.request.url);
//         event.respondWith(
//             caches.match(event.request)
//         );
//     }else{
//         event.respondWith(
//             caches.match(event.request)
//             .then(function(response){
//                 if(response){
//                     return response;
//                 }else{
//                     return fetch(event.request)
//                     .then(function(res){
//                         return caches.open(ID_APP_CACHE_DYNAMIC)
//                         .then(function(cache){
//                             cache.put(event.request.url,res.clone());
//                             return res;
//                         });
//                     })
//                     .catch(function(err){
//                         //algo aconteceu de estranho
//                     })
//                 }
//             })
//         );
//     }
// });




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