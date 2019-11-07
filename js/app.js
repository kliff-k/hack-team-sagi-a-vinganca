var deferredPrompt;

//var cpfUsuario = 34894692464; //pega o cpf do usuário da session storage
var cpfUsuario = 34379665966; //pega o cpf do usuário da session storage

if(!window.Promise){
    window.Promise = Promise;
}

var dominio_relativo='/';
if(self.location.href.indexOf('localhost')>0){
    dominio_relativo='/'+'hack-team-sagi-a-vinganca/';
}else{
    dominio_relativo='/'+'govbr/';
}
var ambiente_app =dominio_relativo;


if(typeof(sessionStorage) == 'undefined')
{
    sessionStorage = {
        getItem: function(){},
        setItem: function(){},
        clear: function(){},
        removeItem: function(){}
    };
}

if('serviceWorker' in navigator){
    navigator.serviceWorker
    .register(ambiente_app+'sw-gov.br.js',{scope: ambiente_app})    
    .then(function(){
        console.log("Service Worker registered com sucesso.");
    })
    .catch(function(err){
        console.log("[Service Worker] Falha ao tentar registrar o Service Worker",err);
    });
}

/*
    Prompt de instalação do aplicativo
*/
window.addEventListener('beforeinstallprompt',function(event){
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});


//var promise = new Promise(function(resolve, reject){
//    setTimeout(function(){
//        //reject({code: 500, message: 'An error occurred!'});
//    },3000);
//});



function displayConfirmNotification(){
    if('serviceWorker' in navigator){
        navigator.serviceWorker.ready
        .then(function(swreg){
            var options={
                body:'!!!!!',
                icon:dominio_relativo+'img/favicon-32x32.png',
                image: '',
                dir:'ltr',
                lang:'pt-BR',
                vibrate:[100,50,200],
                badge: dominio_relativo+'img/favicon-32x32.png',
                tag: 'confirm-notification',
                renotify: true,
                actions: [
                    {action: 'confirm', title:'Okay', icon: dominio_relativo+'img/favicon-32x32.png'},
                    {action: 'cancel', title:'Canbcel', icon: dominio_relativo+'img/favicon-32x32.png'}
                ]
            };
            swreg.showNotification('Successfully subscribed (from SW)!',options);
        });
    }
    
}

function askForNotificationPermission(){    
    Notification.requestPermission(function(result){
        console.log('User Choice',result);
        if(result !=='granted'){
            console.log('No notification permission granted');
        }else{
            console.log('Notification permission granted'); 
            displayConfirmNotification();
        }
    })
}
// var enableNotificationsbuttons = document.querySelectorAll('.enable-notifications');
// console.log(enableNotificationsbuttons);


