<?php

include_once 'third_party/src/__init__.php';
include_once 'views/TodoPageView.php';

define('BRISK_MAP_DIRECTORY', __DIR__ . DIRECTORY_SEPARATOR . 'dist');
define('BRISK_COMPILE_DIRECTORY', __DIR__);

$page = new TodoPageView('React • TodoMVC');
$page->render();
