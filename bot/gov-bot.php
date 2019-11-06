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

// Main - Treats the input and returns answer plus keyboard layout

switch ($text)
{
    case '/start':
        $response = 'Como posso te ajudar? Digite o nome do serviço que deseja encontrar.';
        break;
    default:
        $result = json_decode(file_get_contents("http://hs2019st.com:8983/solr/servicos/select?q=*:*&views_i%20desc&fq=palavra_chave_ss:'$text'"),TRUE);
        $response = var_dump($result);
        break;
}
file_put_contents('../../bot_logs/log',$text.' -> '.$response);
file_get_contents($bot."/sendmessage?chat_id=$chat_id&text=$response");
