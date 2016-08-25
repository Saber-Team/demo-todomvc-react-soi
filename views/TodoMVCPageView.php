<?php

class TodoMVCPageView extends BriskPageView {

    //渲染页面成html
    public function renderAsHTML() {
        $this->requireResource('src/static/css/base.css', 'brisk');
        $this->requireResource('src/static/css/index.css', 'brisk');
        $this->requireResource('src/lib/kernel.js', 'brisk');
        $this->requireResource('src/lib/classNames.js', 'brisk');
        $this->requireResource('src/lib/react-with-addons.js', 'brisk');
        $this->requireResource('src/static/js/index.js', 'brisk');

        $body = <<<EOTEMPLATE
<section class="todoapp"></section>
<footer class="info">
    <p>Double-click to edit a todo</p>
    <p>Created by <a href="http://github.com/petehunt/">petehunt</a></p>
    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
</footer>
EOTEMPLATE;

        return (string)hsprintf(
            $this->getTemplateString(),
            phutil_escape_html($this->getTitle()),
            $this->renderResourcesOfType('css'),
            new PhutilSafeHTML($body),
            $this->renderResourcesOfType('js'));
    }

}