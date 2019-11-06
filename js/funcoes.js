function simulaLoginGovBr(){
    
    var cpf = $("#j_username").val();
    var nome = "";
    
    var arrnomes=["José Pereira","Maria da Silva", 
    "Ione de Rezende", "Pedro Machado",
    "Amarildo Nogueira"];
    var arrphotos=["img1.png","img2.png", 
    "img3.png", "img4.png",
    "img5.png"];
    numInicial = 0;
    numFinal = (arrnomes.length);
    numRandom = Math.floor((Math.random()*(numFinal-numInicial))+numInicial);
    var nome = arrnomes[numRandom];
    var photo = arrphotos[numRandom];

    if(sessionStorage){
        
        sessionStorage.setItem("cpf",cpf);
        sessionStorage.setItem("nome",nome);
        sessionStorage.setItem("photo",photo);
    }else{
        console.log("Navegador não suporta session storage");
        alert("Não foi possível realizar o login - navegador sem suporte a sessionStorage");
    }
    self.location.href = 'index.html';

}
function abreMensagemInstalacaoSistema(){ 
    setTimeout(function(){
        if (deferredPrompt) {
            console.log('instalar aplicação');
            deferredPrompt.prompt();
           
            deferredPrompt.userChoice.then(function(choiceResult) {
            //   console.log(choiceResult.outcome);    
              if (choiceResult.outcome === 'dismissed') {
                //getGeraLogApp('nao-instalou-app');
                console.log('Usuário recusou a instalação do aplicativo na tela inicial');
              } else {
                console.log('Usuário adicionou o aplicativo a sua tela inicial');
                //getGeraLogApp('instalou-app');
              }
            });
        
            deferredPrompt = null;
          }
    },4000);
    
}


function goToDiv(dv){
    if(dv=='')
        return false;
    $("html, body").animate({
        scrollTop: eval($(dv).offset().top-95)
    }, 500);
  
}

function getImagemQrCode2Fatores(){
    var url='https://www.hs2019st.com/conta/qrcode.php';

    fetch(url)
    .then(function(result){
        return result.text();
    })
    .then(function(text){
        text = text.replace('</ br>','');
        $("#local-qr-code").html(text);
    }).catch(function(err){
        console.log('não foi possível obter o QRCode',err);
    })
}

function goTabItem(tb,item){
    if(typeof tb=='undefined')
        return false;
    $('#'+tb).click();

    if(typeof item=='undefined')
        return false;
    
    setTimeout(function(){
        goToDiv('#'+item);
    },700);
}

function formataData(dt){
    var arr = dt.split(' ');
    var arr0 = arr[0].split('-');

    var new_data = arr0[2]+'/'+arr0[1]+'/'+arr0[0]+' '+arr[1];
    return new_data;
}
function getCardsTelaPrincipal(qtd){  
    
    $("#owl-items-cards").html('<div class="item-carregando"><i class="fa fa-spinner fa-spin"></i>&nbsp;carregando...</div>');
    
    var url = 'https://hs2019st.com/govbr/rest/api/banner';

    fetch(url)
    .then(function(result){
        if(result)
            res = result.json();
        else
            res = false;
        return res;
    })
    .then(function(data){
        console.log(data);
        
        var objs = data.response.docs;
       
        var numFound =0;
        var txt = '';
        if(objs && typeof objs!='undefined'){
             numFound = objs.length;
             if(numFound>0){
                 for(var i=0;i<objs.length;i++){
                     var ob = objs[i];
                     var id = ob.id;
                     var nome = ob.nome_s;
                     var icone = '';
                     var views = ob.views_i;
                     var views = ob.palavras_chaves_s;
                     var orgao = ob.orgao_s;
                     var likes = ob.likes_i;
                     var descricao = ob.descricao_s;
                     if(typeof id=='undefined' || !id || id=='null'){
                         continue;
                     }

                     var tam_string = nome.length;
                     var maximo=80;
                     if(tam_string>maximo){
                        nome = nome.substr(0,maximo-3)+'...';
                     }
                     let strcard='<div id="">'+
                                '    <div class="card" style="text-align: center">'+
                                '        <img class="card-img" src="img/enem.png" alt="Card image">'+
                                '        <div class="card-img-overlay" style="">'+
                                '            <!-- <h4 class="card-title">'+nome+'</h4> -->'+
                                '            <div class="card-text">'+nome+
                                '            </div>'+
                                '            <p><button class="btn br-button btn-outline-primary"'+
                                '                    type="button">Acessar</button></p>'+
                                '        </div>'+
                                '    </div>'+
                                '</div>';
                    txt+=strcard;
                 }
             }
        }
       
        

        if(numFound<=0 && txt!=''){
            $(".owl-carousel").html('<div style="margin-bottom:15px" class="br-alert is-warning is-inverted mt-3">'+
            '<div class="icon">'+
            '  <i class="fas fa-exclamation-triangle"></i>'+
            '  <span class="sr-only">Atenção!</span>'+
            '</div>'+
            '<div class="content">'+
            '  <span>Nenhum destaque encontrado para o perfil selecionado.</span>'+
            '</div>'+
            '<div class="close">'+
            '  <button type="button">'+
            '    <i class="fas fa-times"></i>'+
            '    <span class="sr-only">Fechar</span>'+
            '  </button>'+
            '</div>'+
          '</div>');
        }else{
            

            $(".owl-carousel").html(txt);
            setTimeout(function(){
                $(".owl-carousel").owlCarousel({
                    // stagePadding: 50,
                    loop: true,
                    margin: 10,
                    nav: true,
                    responsive: {
                        0: {
                            items: 1,
                            nav: false
                        },
                        600: {
                            items: 3,
                            nav: false
                        },
                        1000: {
                            items: 4,
                            nav: true,
                            loop: false
                        }
                    }
                });
            },130);
        
        }

        
    })
    .catch(function(err){
        $("#local-atividades").html('<div>Nenhum registro de acesso encontrado</div>');
    });
}


function getUltimosAcessosJson(qtd){  
    $("#local-atividades").html('<div><i class="fa fa-spinner fa-spin"></i>&nbsp;carregando...</div>');
    var url = 'https://www.hs2019st.com/rest/api/ultimos_acessos_externos/'+cpfUsuario;

    fetch(url)
    .then(function(result){
        if(result)
            res = result.json();
        else
            res = false;
        return res;
    })
    .then(function(data){
        return processaJsonAtividades(data,qtd);
    })
    .catch(function(err){
        $("#local-atividades").html('<div>Nenhum registro de acesso encontrado</div>');
    });
}

function processaJsonAtividades(data,qtd){
    if(!qtd || typeof qtd=='undefined' || qtd=='null' || qtd==null){
        qtd=0;
    }

    if(!data || data.length<=0){
        $("#local-atividades").html('<span>Nenhum registro encontrado...</span>');    
        return false;
    }

    var txt='';
    if(qtd>0){
        if(qtd>data.length)
            qtd = data.length;
    }else{
        qtd = data.length;
    }
    for(var i=0; (i<qtd);i++){
        var dt = formataData(data[i].data_evento);
        var cidade = data[i].nome_municipio_sem_acento;
        var uf = data[i].sigla_uf;
        var dispositivo = 'Google Chrome';
        
        txt+='<div class="lista-atividade '+(i==0?' font-weight-bold':'')+'"><i class="fa fa-check-circle text-primary"></i>&nbsp;'+dt+', '+cidade+'/'+uf+'</div>';
    }
    $("#local-atividades").html(txt);
}



function getAcessosSuspeitosJson(qtd){  
    $("#local-atividades-suspeitas").html('<div><i class="fa fa-spinner fa-spin"></i>&nbsp;carregando...</div>');
    var url = 'https://www.hs2019st.com/rest/api/notificacoes/'+cpfUsuario;

    fetch(url)
    .then(function(result){
        if(result)
            res = result.json();
        else
            res = false;
        return res;
    })
    .then(function(data){
        return processaJsonAtividadesSuspeitas(data,qtd);
    })
    .catch(function(err){
        $("#local-atividades").html('<div>Nenhum atividade suspeita encontrada.</div>');
    });
}

function processaJsonAtividadesSuspeitas(data,qtd){
    if(!qtd || typeof qtd=='undefined' || qtd=='null' || qtd==null){
        qtd=0;
    }

    if(data.length<=0){
        $("#local-atividades-suspeitas").html('<span>Nenhuma atividade suspeita encontrada.</span>');    
        return false;
    }

    

    var txt='';
    if(qtd>0){
        if(qtd>data.length)
            qtd = data.length;
    }else{
        qtd = data.length;
    }
    for(var i=0; (i<qtd);i++){
        var dt = formataData(data[i].data_evento);
        
        var dispositivo = 'Google Chrome';

        var ds_acao = data[i].acao;;
        var notificacao = data[i].ds_notificacao;;
        var id_notificacao = data[i].id_notificacao;
        
        var cls = getColorNotificacaoByIdNotificacao(id_notificacao);
        txt+='<div class="lista-atividade '+(i==0?' font-weight-bold':'')+
        '"><i class="fa fa-exclamation-triangle '+cls+'"></i>&nbsp;'+dt+
        ', '+notificacao+'</div>';
    }


    $("#local-atividades-suspeitas").html(txt);
}

function getColorNotificacaoByIdNotificacao(id){
    var cls='';
    switch(id){
        case 1: cls= 'text-secondary';break;
        case 2: cls= 'text-warning';break;
        case 3: cls= 'text-danger';break;
    }
    return cls;
}


function mostraOcultaNotificacoes(){
    var obj=$("#lc-item-notificacao");
    var pos = $("p").position();
    console.log(pos);
    var t = 0+85;
    var l = 850;

    if($(window).width()<l){
        l=0;
    }



    
    
    
    $("#dvItemsNotificacao").css({top: t, left: l});
    $("#dvItemsNotificacao").toggle();
}



function getInfoUsuarioJson(){
    var url = "https://www.hs2019st.com/rest/api/dados_usuario/"+cpfUsuario;
    
    fetch(url)
    .then(function(result){
        
        return result.json();
    })
    .then(function(objJson){
        let nome=objJson[0].nm_usuario;
        let cpf=objJson[0].cpf;
        
        $("#lblNomeDoUsuario").html(nome);
    })
    .catch(function(err){
        console.log("Erro ao tentar obter as informações do Usuário.",err);
        return false;
    });
}



function getTabelaAcessos(){    
    
    var url = 'https://www.hs2019st.com/rest/api/ultimos_acessos_externos/'+cpfUsuario;

    fetch(url)
    .then(function(result){
        return result.json();
    })
    .then(function(data){
        var txt='';
        if(data.length==0){
            var txt='<tr>';
            txt+='  <td colspan="6">Nenhuma atividade de acesso encontrada.</td>';            
            txt+='</tr>'; 
            $("#tblAcessosUsuario").html(txt);
            return false;
        }
        for(var i=0; i<data.length;i++){
            let obj = data[i];

            let data_hora = formataData(obj.data_evento);

            let local = obj.nome_municipio_sem_acento+'/'+obj.sigla_uf;

            let device =generateRandomBrowser(); 
            let ip =obj.header_remote_address;
            let servico =obj.modulo;

            //let texto_btn_acao='<button type="button" class="btn btn-outline-success  btn-sm"><i class="text-success fa fa-thumbs-up"></i>&nbsp; Fui eu</button>';
            let texto_btn_acao='&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-outline-danger  btn-sm">Não&nbsp;fui&nbsp;eu&nbsp;<i class="text-danger fa fa-thumbs-down"></i></button>';

            txt+='<tr>';
            txt+='  <td>'+data_hora+'</td>';
            txt+='  <td>'+local+'</td>';
            txt+='  <td>'+device+'</td>';
            txt+='  <td>'+ip+'</td>';
            txt+='  <td>'+servico+'</td>';
            txt+='  <td>'+texto_btn_acao+'</td>';
            txt+='</tr>';
        }   
        $("#tblAcessosUsuario").html(txt);
    })
    .catch(function(){
        var txt='<tr>';
            txt+='  <td colspan="6">Nenhuma atividade de acesso encontrada.</td>';
            
            txt+='</tr>'; 
            $("#tblAcessosUsuario").html(txt);   
    })
      
}


function getTabelaAcessosSuspeitos(lim){    
    // $("#tr").html('<div><i class="fa fa-spinner fa-spin"></i>&nbsp;carregando...</div>');
    var url = 'https://www.hs2019st.com/rest/api/notificacoes/'+cpfUsuario;

    if(typeof lim=='undefined' || parseInt(lim)<=0){
        lim=0;
    }

    fetch(url)
    .then(function(result){
        return result.json();
    })
    .then(function(data){
        var txt='';
        
        if(data.length==0){
            var txt='<tr>';
            txt+='  <td colspan="5">Nenhuma 1atividade de acesso encontrada.</td>';            
            txt+='</tr>'; 
            $("#tblAcessosUsuarioSuspeito").html(txt);
            return false;
        }
        if(data.length<lim){
            lim = data.length;
        }

        for(var i=0; i<lim;i++){
            let obj = data[i];

            let data_hora = formataData(obj.data_evento);

            var dt = formataData(data[i].data_evento);
        
            

            let ds_acao = data[i].acao;;
            let notificacao = data[i].ds_notificacao;;
            let id_notificacao = data[i].id_notificacao;
            let modulo = data[i].modulo;
            
            let cls = getColorNotificacaoByIdNotificacao(id_notificacao);
            let device =generateRandomBrowser();
            cls = '<i class="fa fa-exclamation-triangle '+cls+'"></i>';

           

            //let texto_btn_acao='<button type="button" class="btn btn-outline-success  btn-sm"><i class="text-success fa fa-thumbs-up"></i>&nbsp; Fui eu</button>';
            let texto_btn_acao='&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-outline-danger  btn-sm">Não&nbsp;fui&nbsp;eu&nbsp;<i class="text-danger fa fa-thumbs-down"></i></button>';

            txt+='<tr>';
            txt+='  <td>'+cls+'</td>';
            txt+='  <td>'+data_hora+'</td>';
            txt+='  <td>'+device+'</td>';
            txt+='  <td>'+modulo+'</td>';
            txt+='  <td>'+notificacao+'</td>';            
            txt+='  <td>'+texto_btn_acao+'</td>';
            txt+='</tr>';
        }   
        $("#tblAcessosUsuarioSuspeito").html(txt);
    })
    .catch(function(err){
        var txt='<tr>';
            txt+='  <td colspan="5">Nenhuma atividade de acesso encontrada.</td>';
            
            txt+='</tr>'; 
            $("#tblAcessosUsuarioSuspeito").html(txt);
            console.log('erro ao tentar executar os acessos',err);   
    })
      
}


function generateRandomBrowser(){
    var arr = ['Firefox','Google Chrome 74','Google Chrome mobile 74',
    'Webkit 75','Opera','Internet Explorer','Microsoft Edge','DuckduckGo', 'Unknown', 
    'Firefox Mobile','Samsumg Galaxy S5','Motorola g6','Xiamo mi A2'];

    return arr[Math.floor(Math.random()*arr.length)];    
}


function initSidenav() {
    // $("#sidenav").mCustomScrollbar({
    //     theme: "minimal"
    // });

    let close_callback = function(){
        $('#sidenav').removeClass('active');
        $('#sidenav-overlay').removeClass('active');
    };

    $('#sidenav-overlay').on('click', close_callback);
    $('#sidenav a').on('click', close_callback);
    $(window).resize(close_callback);

    $('#sidenav-toggle').on('click', function(){
        $('#sidenav').addClass('active');
        $('#sidenav-overlay').addClass('active');
    });
}

$(()=>{
    $('#search-wrapper').each((i,e)=>{
        let $search_wrapper = $(e);
        let $search_input = $search_wrapper.find('#search-input');
        let $suggestion_wrapper = $search_wrapper.find('#search-suggestion-wrapper');
        let $suggestion_list = $suggestion_wrapper.find('#search-suggestion-list');

        // Função que testa se a lisat de sugestões deve ser exibida
        function toggleSuggestions() {
            if ($search_input.is(':focus') && $suggestion_list.children().length)
                $search_wrapper.addClass('show-suggestions');
            else
                $search_wrapper.removeClass('show-suggestions');
        }

        $search_input
            .on('input', ()=>{
                let query = $search_input[0].value;

                $.ajax({
                    method: 'GET',
                    url: 'https://hs2019st.com/govbr/solr-suggest.php?suggest=true&suggest.build=true&suggest.dictionary=nomeSuggester&wt=json&suggest.count=10',
                    data: {
                        'suggest.q': query
                    },
                    dataType: 'json',
                    success: (response)=>{
                        let suggestions = response.suggest.nomeSuggester[query].suggestions;
                        $suggestion_list.empty();
                        suggestions.forEach((element)=>{
                            $suggestion_list.append(
                                '<li>' +
                                element.term +
                                '</li>'
                            );
                        });

                        $suggestion_list.children().each((i, e)=> {
                            let $e = $(e);
                            $e.on('mousedown', ()=>{
                                $search_input.val($e.text());
                            });
                        });

                        toggleSuggestions();
                    }
                });
            })
            .on('focus', toggleSuggestions)
            .on('blur', ()=>{
                setTimeout(toggleSuggestions, 1);
            });
    });
    $('#search-form').on('submit', ()=>{
        localStorage.setItem('termo_busca', $('#search-input')[0].value);
    });
});