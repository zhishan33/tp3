export function JSXAttribute(node: Object) {
  this.print(node.name, node);
  if (node.value) {
    this.token("=");
    this.print(node.value, node);
  }
}

export function JSXIdentifier(node: Object) {
  this.word(node.name);
}

export function JSXNamespacedName(node: Object) {
  this.print(node.namespace, node);
  this.token(":");
  this.print(node.name, node);
}

export function JSXMemberExpression(node: Object) {
  this.print(node.object, node);
  this.token(".");
  this.print(node.property, node);
}

export function JSXSpreadAttribute(node: Object) {
  this.token("{");
  this.token("...");
  this.print(node.argument, node);
  this.token("}");
}

export function JSXExpressionContainer(node: Object) {
  this.token("{");
  this.print(node.expression, node);
  this.token("}");
}

export function JSXText(node: Object) {
  this.token(node.value);
}

export function JSXElement(node: Object) {
  let open = node.openingElement;
  this.print(open, node);
  if (open.selfClosing) return;

  this.indent();
  for (let child of (node.children: Array<Object>)) {
    this.print(child, node);
  }
  this.dedent();

  this.print(node.closingElement, node);
}

function spaceSeparator() {
  this.space();
}

export function JSXOpeningElement(node: Object) {
  this.token("<");
  this.print(node.name, node);
  if (node.attributes.length > 0) {
    this.space();
    this.printJoin(node.attributes, node, { separator: spaceSeparator });
  }
  if (node.selfClosing) {
    this.space();
    this.token("/>");
  } else {
    this.token(">");
  }
}

export function JSXClosingElement(node: Object) {
  this.token("</");
  this.print(node.name, node);
  this.token(">");
}

export function JSXEmptyExpression() {}
