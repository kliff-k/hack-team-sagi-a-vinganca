<?php

// Set webhook
// https://api.telegram.org/bot1017664403:AAFv3yj797EAHdleCSecDDKZuRJxJVUc3kc/setWebhook?url=https://hs2019st.com/govbr/bot/gov-bot.php

// Query info
// https://api.telegram.org/bot1017664403:AAFv3yj797EAHdleCSecDDKZuRJxJVUc3kc/getWebhookInfo

// Declare main variables
$token = "1017664403:AAFv3yj797EAHdleCSecDDKZuRJxJVUc3kc";
$bot = "https://api.telegram.org/bot".$token;

// Get request contents and relevant data
$content    = file_get_contents("php://input");
$update     = json_decode($content, true);
$update_id  = $update['update_id'];
$text       = $update['message']['text'];
$chat_date  = $update['message']['date'];
$message_id = $update['message']['message_id'];
$chat_id    = $update['message']['chat']['id'];
$first_name = $update['message']['chat']['first_name'];
$chat_type  = $update['message']['chat']['type'];
$location   = $update['message']['location'];

// Main - Treats the input and returns answer plus keyboard layout
if($location)
{

    $arrContextOptions=array(
        "ssl"=>array(
            "verify_peer"=>false,
            "verify_peer_name"=>false,
        ),
    );

    $result = json_decode(file_get_contents("https://aplicacoes.mds.gov.br/sagi/servicos/equipamentos?q=tipo_equipamento:CRAS&wt=json&fl=nome,telefone,endereco,georef_location,dist_estimada:geodist()&rows=2&sfield=georef_location&fq={!geofilt}&pt=".urlencode($location['latitude']).",".urlencode($location['longitude'])."&d=20&sort=geodist()%20asc",false,stream_context_create($arrContextOptions)),TRUE);

    if(!$result)
    {
        $response = 'Nenhum equipamento foi encontrado em um raio de 20KMs da sua localização.';
        $remove_keyboard = json_encode(["remove_keyboard" => TRUE]);
        file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&text=$response");
    }
    else
    {
        $response = 'Estes são os equipamentos mais próximos de você:';
        $remove_keyboard = json_encode(["remove_keyboard" => TRUE]);
        file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&text=$response");

        foreach ($result['response']['docs'] AS $value)
        {
            $response = urlencode("Nome: ".$value['nome']."\nEndereço: ".$value['endereco']."\nTelefone: ".$value['telefone']."\nDistância estimada: ".explode('.',$value['dist_estimada'])[0]." KMs");
            $latitude = explode(',', $value['georef_location'])[0];
            $longitude = explode(',', $value['georef_location'])[1];
            file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&text=$response");
            file_get_contents($bot."/sendLocation?chat_id=$chat_id&reply_markup=$remove_keyboard&latitude=$latitude&longitude=$longitude");
        }
    }

}
else
{
    switch ($text)
    {
        case '/start':
        case '/inicio':
        case '/oi':
            $response = 'Bem vindo à plataforma de serviços do governo brasileiro.';
            $remove_keyboard = json_encode(["remove_keyboard" => TRUE]);
            file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&text=$response");

            $result = json_decode(file_get_contents("https://hs2019st.com/govbr/solr-select.php?q=*:*&fl=id,nome_s&rows=4"),TRUE);
            $response = 'Esses são os serviços mais acessados ultimamente:';
            file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&text=$response");

            foreach ($result['response']['docs'] AS $value)
            {
                $response = '<a href="https://www.gov.br/pt-br/servicos/'.$value['id'].'">'.$value['nome_s'].'</a>';
                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&parse_mode=HTML&text=$response");
            }

            $response = urlencode("Como posso te ajudar?\nDigite o nome do serviço que deseja encontrar.\nOu envie uma localização para a lista de equipamentos mais próximos de você..");
            file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&text=$response");

            break;
        default:
            $result = json_decode(file_get_contents("https://hs2019st.com/govbr/solr-select.php?q=".urlencode($text)."&fl=id,nome_s&rows=4"),TRUE);
            $total = $result['response']['numFound'];

            $remove_keyboard = json_encode(["remove_keyboard" => TRUE]);

            if(!$total)
            {
                $response = urlencode("Não foram encontrados resultados para a sua busca.\nTente digitar /oi");
                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&text=$response");
            }

            if($total == 1)
            {
                $response = '<a href="https://www.gov.br/pt-br/servicos/'.$result['response']['docs'][0]['id'].'">'.$result['response']['docs'][0]['nome_s'].'</a>';
                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&parse_mode=HTML&text=$response");
            }

            if($total > 1 )
            {
                $response = urlencode("Foram encontrados $total serviços.\nSeguem os mais populares:");
                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&text=$response");

                $response = '<a href="https://www.gov.br/pt-br/servicos/'.$result['response']['docs'][0]['id'].'">'.$result['response']['docs'][0]['nome_s'].'</a>';
                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&parse_mode=HTML&text=$response");
                $response = '<a href="https://www.gov.br/pt-br/servicos/'.$result['response']['docs'][0]['id'].'">'.$result['response']['docs'][1]['nome_s'].'</a>';
                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&parse_mode=HTML&text=$response");
                $response = '<a href="https://www.gov.br/pt-br/servicos/'.$result['response']['docs'][0]['id'].'">'.$result['response']['docs'][2]['nome_s'].'</a>';
                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&parse_mode=HTML&text=$response");
                $response = '<a href="https://www.gov.br/pt-br/servicos/'.$result['response']['docs'][0]['id'].'">'.$result['response']['docs'][3]['nome_s'].'</a>';
                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=$remove_keyboard&parse_mode=HTML&text=$response");

                $result = json_decode(file_get_contents("https://hs2019st.com/govbr/solr-suggest.php?suggest=true&suggest.build=true&suggest.dictionary=nomeSuggester&wt=json&suggest.count=4&suggest.q=".urlencode($text)),TRUE);
                $response = 'Deseja refinar a sua busca? Tente um dos termos sugeridos:';

                $keyboard = [];

                foreach ($result['suggest']['nomeSuggester'][$text]['suggestions'] AS $value)
                {
                    $keyboard[] = [$value['term']];
                }

                $reply_keyboard = ['keyboard' => $keyboard, 'one_time_keyboard' => TRUE, 'resize_keyboard' => TRUE];

                file_get_contents($bot."/sendmessage?chat_id=$chat_id&reply_markup=".json_encode($reply_keyboard)."&text=$response");
            }

            break;
    }
}
