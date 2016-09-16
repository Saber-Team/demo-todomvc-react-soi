<?php

class TodoMVCPageView extends BriskPageView {

    public function loadGlobalResources() {
        $this->requireResource('src/static/css/base.css');
        $this->requireResource('src/static/css/index.css');
        $this->requireResource('src/lib/modux.js');
        $this->requireResource('src/lib/classNames.js');
        $this->requireResource('src/lib/react.js');
        $this->requireResource('src/lib/react.dom.js');
        $this->requireResource('src/static/js/index.js');
    }

    //渲染页面成html
    public function renderAsHTML() {

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