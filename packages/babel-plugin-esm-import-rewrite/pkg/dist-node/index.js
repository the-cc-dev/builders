'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var nodeFs = _interopDefault(require('fs'));
var url = _interopDefault(require('url'));
var nodePath = _interopDefault(require('path'));

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function getLineCol(node) {
  const loc = node.loc.start; //   return chalk.dim(`[${loc.line}:${loc.column}]`);

  return `[${loc.line}:${loc.column}]`;
}

function validateDynamicImportArguments(path) {
  if (path.parent.arguments.length !== 1) {
    return new Set([`${getLineCol(path.node)} "\`import()\` only accepts 1 argument, but got ${path.parent.arguments.length}`]);
  }

  const _path$parent$argument = _slicedToArray(path.parent.arguments, 1),
        argNode = _path$parent$argument[0];

  if (argNode.type !== 'StringLiteral') {
    return new Set([`${getLineCol(path.node)} Pika expects strings as \`import()\` arguments. Treating this as an absolute file path.`]);
  }

  return new Set();
}

const BareIdentifierFormat = /^((?:@[^\/]+\/)?[^\/]+)(\/.*)?$/;
function transform({}) {
  function rewriteImport(specifier, {
    opts,
    file
  }) {
    const deps = opts.deps,
          addExtensions = opts.addExtensions;

    try {
      url.parse(specifier);
    } catch (err) {
      return;
    } // URL w/o protocol


    if (specifier.substr(0, 2) === '//') {
      return; // Leave it alone
    } // Local path


    if (['.', '/'].indexOf(specifier.charAt(0)) >= 0) {
      if (addExtensions) {
        const extname = nodePath.extname(specifier);

        if (extname === '.js') {
          return;
        }

        if (extname) {
          console.warn('Unexpected file extension:', specifier);
          return;
        }

        const resolvedPath = nodePath.resolve(nodePath.dirname(file.opts.filename), specifier);

        try {
          const stat = nodeFs.lstatSync(resolvedPath);

          if (stat.isDirectory()) {
            return specifier + '/index.js';
          }
        } catch (err) {// do nothing
        }

        return specifier + '.js';
      }

      return;
    } // A 'bare' identifier


    const match = BareIdentifierFormat.exec(specifier);

    if (deps && match) {
      const packageName = match[1]; // const file = match[2] || '';

      return deps[packageName];
    }
  }

  return {
    visitor: {
      'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(path, {
        opts,
        file
      }) {
        if (!path.node.source) {
          return;
        }

        const rewrittenSpecifier = rewriteImport(path.node.source.value, {
          opts,
          file
        });

        if (rewrittenSpecifier) {
          path.node.source.value = rewrittenSpecifier;
        }
      },

      Import(path, {
        opts,
        file
      }) {
        const errors = validateDynamicImportArguments(path);

        if (errors.size > 0) {
          return;
        }

        const _path$parent$argument = _slicedToArray(path.parent.arguments, 1),
              importPath = _path$parent$argument[0];

        const rewrittenSpecifier = rewriteImport(importPath.value, {
          opts,
          file
        });

        if (rewrittenSpecifier) {
          importPath.value = rewrittenSpecifier;
        }
      }

    }
  };
}

exports.default = transform;
