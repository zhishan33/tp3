export default function ({ types: t }) {
  function build(node, nodes, scope) {
    let first = node.specifiers[0];
    if (!t.isExportNamespaceSpecifier(first) && !t.isExportDefaultSpecifier(first)) return;

    let specifier = node.specifiers.shift();
    let uid = scope.generateUidIdentifier(specifier.exported.name);

    let newSpecifier;
    if (t.isExportNamespaceSpecifier(specifier)) {
      newSpecifier = t.importNamespaceSpecifier(uid);
    } else {
      newSpecifier = t.importDefaultSpecifier(uid);
    }

    nodes.push(t.importDeclaration([newSpecifier], node.source));
    nodes.push(t.exportNamedDeclaration(null, [t.exportSpecifier(uid, specifier.exported)]));

    build(node, nodes, scope);
  }

  return {
    inherits: require("babel-plugin-syntax-export-extensions"),

    visitor: {
      ExportNamedDeclaration(path) {
        let { node, scope } = path;
        let nodes = [];
        build(node, nodes, scope);
        if (!nodes.length) return;

        if (node.specifiers.length >= 1) {
          nodes.push(node);
        }
        path.replaceWithMultiple(nodes);
      }
    }
  };
}
