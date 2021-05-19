<?php

define('FEED', $_SERVER['DOCUMENT_ROOT'] . '/posts/index.json');

const LOCALES = [
    'es' => 'es_ES',
    'en' => 'en_US',
    'fr' => 'fr_FR',
    'pt' => 'pt_ES',
    'it' => 'it_IT',
    'ca' => 'ca_ES',
    'eu' => 'eu_ES',
];

const TEMPLATE = <<<TEMPLATE
<!doctype html>
<html lang="%%LANGUAGE%%">
    <head>
        <meta charset="utf-8">

        <meta name="description" content="%%DESCRIPTION%%">
        <meta name="author" content="Jaime Gómez-Obregón">

        <meta property="og:title" content="%%TITLE%%">
        <meta property="og:type" content="article">
        <meta property="og:description" content="%%DESCRIPTION%%">
        <meta property="og:image" content="%%IMAGE%%">
        <meta property="og:width" content="%%WIDTH%%">
        <meta property="og:height" content="%%HEIGHT%%">
        <meta property="og:url" content="%%URL%%">
        <meta property="og:site_name" content="Jaime Gómez-Obregón">
        <meta property="og:locale" content="%%LOCALE%%">

        <meta property="article:published_time" content="%%DATE%%">

        <meta name="twitter:card" content="%%CARD%%">
        <meta name="twitter:site" content="@JaimeObregon">
        <meta name="twitter:creator" content="@JaimeObregon">
        <meta name="twitter:image" content="%%IMAGE%%">
        <meta name="twitter:image:alt" content="%%TITLE%%">

        <title>%%TITLE%%</title>
    </head>
    <body>
        <img src="%%IMAGE%%">
        <h1>%%TITLE%%</h1>
        <p>%%DESCRIPTION%%</p>
    </body>
</html>
TEMPLATE;

$contents = file_get_contents(FEED);
$json = json_decode($contents, true);
$slug = preg_replace('#^/#', '', $_SERVER['REQUEST_URI']);

$article = array_filter($json['items'], fn($item) => $item['id'] === $slug);
$article = reset($article);

if (empty($article)) {
    $header = sprintf('Location: https://%s/', $_SERVER['HTTP_HOST']);
    header($header);
    die;
}

$file = sprintf($_SERVER['DOCUMENT_ROOT'] . '/posts/%s/poster.png', $slug);
if (file_exists($file)) {
    $image = sprintf('https://%s/posts/%s/poster.png', $_SERVER['HTTP_HOST'], $slug);
    list($card, $width, $height) = ['summary_large_image', 2400, 1260];

}
else {
    $image = sprintf('https://%s/assets/jaime.jpg', $_SERVER['HTTP_HOST']);
    list($card, $width, $height) = ['summary', 319, 319];
}

$language = $article['language'];

$replacements = [
    '%%TITLE%%' => $article['title'],
    '%%DESCRIPTION%%' => $article['content_text'],
    '%%IMAGE%%' => $image,
    '%%URL%%' => $article['url'],
    '%%LANGUAGE%%' => $language,
    '%%LOCALE%%' => array_key_exists($language, LOCALES) ? LOCALES[$language] : $language,
    '%%DATE%%' => $article['date_published'],
    '%%CARD%%' => $card,
    '%%WIDTH%%' => $width,
    '%%HEIGHT%%' => $height,
];

$substitutions = array_map(fn($value) => htmlspecialchars($value), array_values($replacements));
$response = str_replace(array_keys($replacements), $substitutions, TEMPLATE);

echo $response;
