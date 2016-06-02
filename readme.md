# `ES2015` module detection in Node.js _(June 2016)_

## Intro

[`ES2015 Modules`](http://www.ecma-international.org/ecma-262/6.0/#sec-modules) are also called `ES6 modules` or `JavaScript modules`. They have been proposed by [the TC39](http://ecma-international.org/memento/TC39.htm) and it seems still up [for](https://github.com/tc39/ecma262/issues/368) [discussion](https://github.com/tc39/ecma262/issues/395).
MDN has an [extensive documentation](https://developer.mozilla.org/en/docs/web/javascript/reference/statements/import)
already. [Babel](http://babeljs.io/) is in wide use and contains a compiler plugin for [es6 modules](http://babeljs.io/docs/plugins/transform-es2015-modules-commonjs/).
Meteor has es6 module support [from 1.3](http://guide.meteor.com/structure.html#es2015-modules).
All but Node.js seem to officially support ES6 modules. The [Node TSC](https://nodejs.org/en/foundation/tsc/) has been discussing this issue for a while now. There have been [several proposals](https://github.com/nodejs/node/wiki/ES6-Module-Detection-in-Node) and one has become a [draft](https://github.com/nodejs/node-eps/blob/master/002-es6-modules.md). However some in the community feel that this solution is _not cool_ and ask [_in-defense-of-.js_](https://github.com/dherman/defense-of-dot-js) to reconsider this draft. This article should shed light on the problems and discusses the pro and cons of the given proposals.

## The Involved Parties

### TC39

The EcmaScript TC39 - Technical Commitee is a group of about
[20 respected members](https://ecma-international.doodle.com/poll/4aaaraya8c52eycv) that work on the specification of EcmaScript (aka. 
JavaScript). They have the power to make change the details of `ES2015 modules`
to work better with Node.js.

### Node TSC

The Node Technical Steering Committee is a group of [12 long-term contributors to Node.js](https://nodejs.org/en/foundation/tsc/) that make decisions on the 
future of Node.js. They decide on how the implementation of ES2016 modules will look like going forward.

### Node.js engineers

Once `ES2016 modules` are a unavoidable part of the Node ecosystem, depending on the implementation chosen the work for
every Node.js engineer to update their project will be different. Also developers need to interact with other developers
and as such interoperability is a key-concern for them as well.

### Frontend engineers

`ES2016 modules` are supposed to be also implemented by browsers. This has not 
[yet happened](https://developer.mozilla.org/en/docs/web/javascript/reference statements/import#Browser_compatibility) but it seems a little further away. 
Frontend developers though also tend to increasingly use npm packages that (which would in future).

### NPM

[NPM Inc.](https://www.npmjs.com/) maintains the system at the center of 
Node.js also called NPM. Their stake in this is that people will in future 
want to download packages with `CommonJS` and/or `ES2015 modules`. NPM also 
maintains the documentation of the
[`package.json`](https://docs.npmjs.com/files/package.json) which plays a 
center role in several proposals.

## The Issue

The ES6 module syntax _seems_ like it is just syntax sugar. And if it were 
then this discussion would be over for a long time already. Unfortunately 
details of the specification make ES6 modules a on a fundamental level 
incompatible to `CommonJS` modules that are used by Node.js. One file has to 
contain **either** a `CommonJS` module or a ES6 module.

NPM has roughly 300,000 packages. Those packages are written as
_(or compiled to)_ `CommonJS` modules. If `ES2015 modules` are introduced we 
would suddenly be facing packages that are not compatible with `CommonJS` and 
by extension not compatible with node versions that do not support
`ES2015 modules`.

This means we are left with 

 - `CommonJS` & `ES2015` module files
 - `CommonJS`-only/`CommonJS`+`ES2015`-mixed/`ES2015` packages

## The Proposals

### 1) ~~In-Source pragma~~ _(rejected)_

This detection would use some string in the file like `"use modules";` to
identify which module system should be used for this file.

_(Rejected due to complexity for tooling and implementation as well as due to the constant code tax - this string would need to be in every file)_

[more here](https://github.com/nodejs/node/wiki/ES6-Module-Detection-in-Node#option-1-in-source-pragma-rejected)

### 2) New file extension **(Node.js TSC draft)**

The type of the module (`CommonJS` or `ES2015`) is detected using the a 
special file ending. Several file endings have been discussed, in the end
`.mjs` has been identified as the best choice.


[more here](https://github.com/nodejs/node/wiki/ES6-Module-Detection-in-Node#option-2-new-file-extension-for-es6-modules)

### 3) ~~Content-Sniffing~~ _(rejected)_

The content would be pre-parsed to identify whether its a `CommonJS` or
`ES2015` module.

_(Rejected because the detection is fuzzy and could lead to user confusion and problems with tooling)_

[more here](https://github.com/nodejs/node/wiki/ES6-Module-Detection-in-Node#option-3-content-sniffing-in-node-semantics-rejected)

### 4) White-/Blacklist patterns in `package.json`

Patterns written in the `package.json` specify whether a file is a `CommonJS` 
or a `ES2015` module. There have been a few variants of this proposal with
more or less complex specifications.

[more here](https://github.com/nodejs/node/wiki/ES6-Module-Detection-in-Node#option-4-meta-in-packagejson)
and [here](https://github.com/dherman/defense-of-dot-js)

### 5) `CommonJS` or `ES2015` switch in `package.json`

One property in the `package.json` specifies the module type for all files
in the package (sub-packages excluded).

[more here](https://github.com/dherman/defense-of-dot-js/issues/10)

_(Note: this is originally variant 4f. Since the implementation consequences are very different it has been named 5.)_

## Comparisons

### Runtime

CPU cycles and Memory when running node (5=neglectible, 1=cpu-heavy).

| Proposal         |   | Explanation  |
|------------------|---|--------------|
| Extension        | 5 | Only the file-ending has to be tested, no other overhead | 
| White-/Blacklist | 2 | The file-name has to be tested against a potentially complicated list |
| ES2015 switch    | 4 | The first file of a is slower because the `package.json` needs to be read but every further file after has the same speed. |

### Implementation

Effort it takes to bring this implementation to Node.js (5=much, 1=little)

| Proposal         |   | Explanation  |
|------------------|---|--------------|
| Extension        | 5 | if/else switch, thats it. | 
| White-/Blacklist | 3 | Significantly more difficult than if/else |
| ES2015 switch    | 1 | It requires **NPM** to implement variants of packages into the package system. |

### Education

Effort to learn the new system. (5=easy, 1=hard)

| Proposal         |   | Explanation  |
|------------------|---|--------------|
| Extension        | 5 | File endings can be easily studied. | 
| White-/Blacklist | 2 | Trying to memorize this complex system is hard. |
| ES2015 switch    | 4 | Mostly straight forward, deployment of variants might be a bit harder to learn than if there were only extensions |

### Development

Increased development difficulty through the proposal. (5=almost-none, 1=a-lot)

| Proposal         |   | Explanation  |
|------------------|---|--------------|
| Extension        | 3 | Every developer has to setup his tools to work with the new file extension | 
| White-/Blacklist | 1 | It is not immediately clear which files are `ES2015` and which are `CommonJS`. The tools might mistake that just as much as developers |
| ES2015 switch    | 2 | The developer has to learn that there are different modes and has to look it up once per package he is working on. |

### Legacy Development

Effort for a developer now to use a `ES2015`-only module. (5=little, 1=much)

| Proposal         |   | Explanation  |
|------------------|---|--------------|
| Extension        | 4 | If a package decides to switch from `.js` to `.mjs` entirely the developers might need to adjust their import statements from `require('a-package/a-module.js') ` to `require('a-package/a-module.mjs)` if
no legacy support is present. | 
| White-/Blacklist | 3 | It is not immediately clear which files are `ES2015` and which are `CommonJS`. The tools might mistake that just as much as developers. |
| ES2015 switch    | 4 | Nothing changed but they have to know that old node.js version might not be supported with new packages. |

### Legacy Package Development

Effort a developer has to take to make her package legacy compatible.  (5=little, 1=much)

| Proposal         |   | Explanation  |
|------------------|---|--------------|
| Extension        | 3 | Always deploy the package with a `.mjs` and a `.js` file at the same place (with the same name). | 
| White-/Blacklist | 3 |  The developer has a lot of control over how the packages are built but at the same time she needs to gain control and remember how the system is setup. Human error can easily happen. |
| ES2015 switch    | 3 | The compiler will pretty much work like anywhere else except that it is easier to specify different dependencies for different variants. |

### Downloads

Change of a file-size per package. (5=good, 1=bad)

| Proposal         |   | Explanation  |
|------------------|---|--------------|
| Extension        | 1 | Has to contain every file twice for legacy packages. | 
| White-/Blacklist | 1 | Has to contain every file twice for legacy packages. |
| ES2015 switch    | 5 | Only the package is downloaded - no change in download-size. |

### Tooling

Impact that the change has on tools. (5=none, 1=a-lot)

## Further considerations

### `ES2016` modules without `package.json`

`Node.js` can be just called like this: `$ node some.js` in any given folder. 
The folder does not need to contain a `package.json` and as consequence
all of the proposals that rely on the `package.json` will not work.
Of the given proposals only a specific file-ending (like `.mjs`) can make sure 
that modern modules can easily be called from node directly. For the other 
proposals you might need something like `$ node --es6 some.js`. 

### Changing the `ES2015` specification

As mentioned a lot earlier: This discussion could have been avoided if 
the TC39 would be able to fix the parsing incompatibilities in the
specification a lot of this discussion would be void.

However: this is unlikely that this will happen because the TC39 worked hard 
to arrive at this specification and there are good reasons for the 
incompatibilities. _(Note: reference needed)_

### Possibilities of package variants

For `5)` package variants would need to be implemented in NPM. Once NPM 
packages has the infrastructure to support variants, those variants can give 
the opporunity to implement other things:

 - Frontend packages could be presented as a variant of a package containing
    the frontend part of a package.
 - Meteor packages that are now stored on
    [athmosphere](https://atmospherejs.com/) because they contain both frontend
    and backend packages. It would make it easier for Meteor to move to NPM.
 - If we run into future incompatibilities of JavaScript it would be possible
    to just add a variant type to NPM and we'd be done.
 - Variants could also be used to have other language packages in NPM: Python,
    C, Go,... that automatically provide Node bindings.

## Feedback

If you have any question feel free to chat on gitter.

You can also open a Issue or Pull Request on github.

And you can join this poll:

<script src="https://d3v9r9uda02hel.cloudfront.net/production/static/widgets.js"></script><noscript><a href="https://www.wedgies.com/question/574e872600f88e18001b3dc0">What ES2016 module implementation would you like to see in Node.js? 🤔 </a></noscript><div class="wedgie-widget" data-wd-pending data-wd-type="embed" data-wd-version="v1" id="574e872600f88e18001b3dc0" style="max-width: 640px; margin: 0px auto; width: 100%;"></div>
