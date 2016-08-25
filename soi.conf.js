
'use strict';

// 配置线上路径

// 资源表中包含的资源类型
soi.config.set('types', ['js', 'css']);
// 设置每次不利用编译缓存
soi.config.set('forceRescan', true);

soi.release.task('dev',
    {
      dir: './',
      mapTo: './dist/resource.json',
      domain: '',
      scandirs: ['src'],
      loaders: [
        new soi.Loaders.CSSLoader(),
        new soi.Loaders.JSLoader({
          preProcessors: [
            soi.processor['babel-jsx']
          ]
        })
      ],
      preserveComments: true

    })
    .addRule("src/**", {
      to : '/dist/static/res/'
    })
    .use('wrapper', {define: '__d'})
    .use('clean-css')
    .use('messid', {ext: ['js', 'css']})
    .use('uglify')
    .use('hash', {
      noname: false,
      encoding: 'hex',
      connector: '.'
    });