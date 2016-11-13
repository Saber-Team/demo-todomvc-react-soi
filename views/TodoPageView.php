<?php

class TodoPageView extends BriskWebPage {

  public function getDomAttributes()
  {
    // TODO: Implement getDomAttributes() method.
  }

  public function setDomAttributes($attributes)
  {
    // TODO: Implement setDomAttributes() method.
  }

  function willRender() {
    require_static('src/static/css/base.css');
    require_static('src/static/css/index.css');
    require_static('src/lib/modux.js');
    require_static('src/lib/classNames.js');
    require_static('src/lib/react.js');
    require_static('src/lib/react.dom.js');
    require_static('src/static/js/index.js');
  }

  function renderAsHTML() {
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
      BriskDomProxy::escapeHtml($this->getTitle()),
      $this->renderResourcesOfType('css'),
      new BriskSafeHTML($body),
      $this->renderResourcesOfType('js'));
  }

}