<?php

require_once 'third_party/src/__init__.php';
require_once 'views/TodoMVCPageView.php';

$page = new TodoMVCPageView('React • TodoMVC');

header('Content-Type', 'text/html');

echo $page->render();
