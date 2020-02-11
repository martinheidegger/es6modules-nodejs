#!/usr/bin/env node
const path = require('path')

const sass = require('node-sass')
const jade = require('jade')
const md = require('markdown-it')({
  html: true,
  linkify: true
})
  .use(require('markdown-it-contents'))
  .use(require('markdown-it-hashtag'))
  .use(require('markdown-it-attrs'))
  .use(require('markdown-it-header-sections'))
  .use(require('markdown-it-link-target'))

const fs = require('fs')
const sassFile = path.join(__dirname, '..', 'build', 'index.css')
var includePaths = require('bourbon').includePaths
  .concat(require('bourbon-neat').includePaths)
  .concat(path.join(path.dirname(require.resolve('Bitters')), 'core'))
includePaths.push(__dirname)

fs.writeFileSync(path.join(__dirname, '..', 'build', 'CNAME'), 'es2015-node.js.org\n')

const sassData = sass.renderSync({
  file: path.join(__dirname, 'index.scss'),
  includePaths: includePaths.map(function (pth) {
    pth = path.relative(process.cwd(), pth)
    return pth
  }),
  outFile: sassFile
})

fs.writeFileSync(
  sassFile,
  sassData.css
)

fs.writeFileSync(
  path.join(__dirname, '..', 'build', 'index.html'),
  jade.renderFile(path.join(__dirname, 'index.jade'), {
    markdown: md.render('{!toc}\n\n' + fs.readFileSync(path.join(__dirname, '..', 'readme.md'), 'utf-8'))
  })
)
