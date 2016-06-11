#!/bin/bash
root=$(dirname $(dirname $0))
cd $root/build
rm -rf .git
git init .
git add .
git commit -m "Automatic deploy"
git remote add origin git@github.com:martinheidegger/es6modules-nodejs.git
git push -f origin refs/heads/master:refs/heads/gh-pages
