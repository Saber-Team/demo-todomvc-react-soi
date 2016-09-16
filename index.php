<?php

require_once 'third_party/src/__init__.php';
require_once 'views/TodoMVCPageView.php';

$page = new TodoMVCPageView('React • TodoMVC');
$page->setPrintType(BriskPrintType::$NO_MAP);

header('Content-Type', 'text/html');

echo $page->render();
