/* eslint max-len: 0 */

import find from "lodash/find";
import findLast from "lodash/findLast";
import isInteger from "lodash/isInteger";
import repeat from "lodash/repeat";
import Buffer from "./buffer";
import * as n from "./node";
import Whitespace from "./whitespace";
import * as t from "babel-types";

const SCIENTIFIC_NOTATION = /e/i;
const ZERO_DECIMAL_INTEGER = /\.0+$/;
const NON_DECIMAL_LITERAL = /^0[box]/;

export type Format = {
  shouldPrintComment: (comment: string) => boolean;
  retainLines: boolean;
  retainFunctionParens: boolean;
  comments: boolean;
  auxiliaryCommentBefore: string;
  auxiliaryCommentAfter: string;
  compact: boolean | "auto";
  minified: boolean;
  quotes: "single" | "double";
  concise: boolean;
  indent: {
    adjustMultilineComment: boolean;
    style: string;
    base: number;
  }
};

export default class Printer {
  constructor(format, map, tokens) {
    this.format = format || {};
    this._buf = new Buffer(map);
    this._whitespace = tokens.length > 0 ? new Whitespace(tokens) : null;
  }

  format: Format;
  inForStatementInitCounter: number = 0;

  _buf: Buffer;
  _whitespace: Whitespace;
  _printStack: Array<Node> = [];
  _indent: number = 0;
  _insideAux: boolean = false;
  _printedCommentStarts: Object = {};
  _parenPushNewlineState: ?Object = null;
  _printAuxAfterOnNextUserNode: boolean = false;
  _printedComments: WeakSet = new WeakSet();
  _endsWithInteger = false;
  _endsWithWord = false;

  generate(ast) {
    this.print(ast);
    this._maybeAddAuxComment();

    return this._buf.get();
  }

  /**
   * Increment indent size.
   */

  indent(): void {
    if (this.format.compact || this.format.concise) return;

    this._indent++;
  }

  /**
   * Decrement indent size.
   */

  dedent(): void {
    if (this.format.compact || this.format.concise) return;

    this._indent--;
  }

  /**
   * Add a semicolon to the buffer.
   */

  semicolon(force: boolean = false): void {
    this._maybeAddAuxComment();
    this._append(";", !force /* queue */);
  }

  /**
   * Add a right brace to the buffer.
   */

  rightBrace(): void {
    if (this.format.minified) {
      this._buf.removeLastSemicolon();
    }
    this.token("}");
  }

  /**
   * Add a space to the buffer unless it is compact.
   */

  space(force: boolean = false): void {
    if (this.format.compact) return;

    if ((this._buf.hasContent() && !this.endsWith(" ") && !this.endsWith("\n")) || force) {
      this._space();
    }
  }

  /**
   * Writes a token that can't be safely parsed without taking whitespace into account.
   */

  word(str: string): void {
    if (this._endsWithWord) this._space();

    this._maybeAddAuxComment();
    this._append(str);

    this._endsWithWord = true;
  }

  /**
   * Writes a number token so that we can validate if it is an integer.
   */

  number(str: string): void {
    this.word(str);

    // Integer tokens need special handling because they cannot have '.'s inserted
    // immediately after them.
    this._endsWithInteger =
      isInteger(+str) &&
      !NON_DECIMAL_LITERAL.test(str) &&
      !SCIENTIFIC_NOTATION.test(str) &&
      !ZERO_DECIMAL_INTEGER.test(str) &&
      str[str.length - 1] !== ".";
  }

  /**
   * Writes a simple token.
   */

  token(str: string): void {
    // space is mandatory to avoid outputting <!--
    // http://javascript.spec.whatwg.org/#comment-syntax
    if ((str === "--" && this.endsWith("!")) ||

      // Need spaces for operators of the same kind to avoid: `a+++b`
      (str[0] === "+" && this.endsWith("+")) ||
      (str[0] === "-" && this.endsWith("-")) ||

      // Needs spaces to avoid changing '34' to '34.', which would still be a valid number.
      (str[0] === "." && this._endsWithInteger)) {
      this._space();
    }

    this._maybeAddAuxComment();
    this._append(str);
  }

  /**
   * Add a newline (or many newlines), maintaining formatting.
   */

  newline(i?: number): void {
    if (this.format.retainLines || this.format.compact) return;

    if (this.format.concise) {
      this.space();
      return;
    }

    // never allow more than two lines
    if (this.endsWith("\n\n")) return;

    if (typeof i !== "number") i = 1;

    i = Math.min(2, i);
    if (this.endsWith("{\n") || this.endsWith(":\n")) i--;
    if (i <= 0) return;

    for (let j = 0; j < i; j++) {
      this._newline();
    }
  }

  endsWith(str: string): boolean {
    return this._buf.endsWith(str);
  }

  removeTrailingNewline(): void {
    this._buf.removeTrailingNewline();
  }

  source(prop: string, loc: Object): void {
    this._catchUp(prop, loc);

    this._buf.source(prop, loc);
  }

  withSource(prop: string, loc: Object, cb: () => void): void {
    this._catchUp(prop, loc);

    this._buf.withSource(prop, loc, cb);
  }

  _space(): void {
    this._append(" ", true /* queue */);
  }

  _newline(): void {
    this._append("\n", true /* queue */);
  }

  _append(str: string, queue: boolean = false) {
    this._maybeAddParen(str);
    this._maybeIndent(str);

    if (queue) this._buf.queue(str);
    else this._buf.append(str);

    this._endsWithWord = false;
    this._endsWithInteger = false;
  }

  _maybeIndent(str: string): void {
    // we've got a newline before us so prepend on the indentation
    if (this._indent && this.endsWith("\n") && str[0] !== "\n") {
      this._buf.queue(this._getIndent());
    }
  }

  _maybeAddParen(str: string): void {
    // see startTerminatorless() instance method
    let parenPushNewlineState = this._parenPushNewlineState;
    if (!parenPushNewlineState) return;
    this._parenPushNewlineState = null;

    let i;
    for (i = 0; i < str.length && str[i] === " "; i++) continue;
    if (i === str.length) return;

    const cha = str[i];
    if (cha === "\n" || cha === "/") {
      // we're going to break this terminator expression so we need to add a parentheses
      this.token("(");
      this.indent();
      parenPushNewlineState.printed = true;
    }
  }

  _catchUp(prop: string, loc: Object) {
    if (!this.format.retainLines) return;

    // catch up to this nodes newline if we're behind
    const pos = loc ? loc[prop] : null;
    if (pos && pos.line !== null) {
      const count = pos.line - this._buf.getCurrentLine();

      for (let i = 0; i < count; i++) {
        this._newline();
      }
    }
  }

  /**
   * Get the current indent.
   */

  _getIndent(): string {
    return repeat(this.format.indent.style, this._indent);
  }

  /**
   * Set some state that will be modified if a newline has been inserted before any
   * non-space characters.
   *
   * This is to prevent breaking semantics for terminatorless separator nodes. eg:
   *
   *    return foo;
   *
   * returns `foo`. But if we do:
   *
   *   return
   *   foo;
   *
   *  `undefined` will be returned and not `foo` due to the terminator.
   */

  startTerminatorless(): Object {
    return this._parenPushNewlineState = {
      printed: false
    };
  }

  /**
   * Print an ending parentheses if a starting one has been printed.
   */

  endTerminatorless(state: Object) {
    if (state.printed) {
      this.dedent();
      this.newline();
      this.token(")");
    }
  }

  print(node, parent) {
    if (!node) return;

    let oldConcise = this.format.concise;
    if (node._compact) {
      this.format.concise = true;
    }

    let printMethod = this[node.type];
    if (!printMethod) {
      throw new ReferenceError(`unknown node of type ${JSON.stringify(node.type)} with constructor ${JSON.stringify(node && node.constructor.name)}`);
    }

    this._printStack.push(node);

    let oldInAux = this._insideAux;
    this._insideAux = !node.loc;
    this._maybeAddAuxComment(this._insideAux && !oldInAux);

    let needsParens = n.needsParens(node, parent, this._printStack);
    if (this.format.retainFunctionParens &&
        node.type === "FunctionExpression" &&
        node.extra && node.extra.parenthesized) {
      needsParens = true;
    }
    if (needsParens) this.token("(");

    this._printLeadingComments(node, parent);

    let loc = (t.isProgram(node) || t.isFile(node)) ? null : node.loc;
    this.withSource("start", loc, () => {
      this[node.type](node, parent);
    });

    this._printTrailingComments(node, parent);

    if (needsParens) this.token(")");

    // end
    this._printStack.pop();

    this.format.concise = oldConcise;
    this._insideAux = oldInAux;
  }

  _maybeAddAuxComment(enteredPositionlessNode) {
    if (enteredPositionlessNode) this._printAuxBeforeComment();
    if (!this._insideAux) this._printAuxAfterComment();
  }

  _printAuxBeforeComment() {
    if (this._printAuxAfterOnNextUserNode) return;
    this._printAuxAfterOnNextUserNode = true;

    const comment = this.format.auxiliaryCommentBefore;
    if (comment) {
      this._printComment({
        type: "CommentBlock",
        value: comment
      });
    }
  }

  _printAuxAfterComment() {
    if (!this._printAuxAfterOnNextUserNode) return;
    this._printAuxAfterOnNextUserNode = false;

    const comment = this.format.auxiliaryCommentAfter;
    if (comment) {
      this._printComment({
        type: "CommentBlock",
        value: comment
      });
    }
  }

  getPossibleRaw(node) {
    let extra = node.extra;
    if (extra && extra.raw != null && extra.rawValue != null && node.value === extra.rawValue) {
      return extra.raw;
    }
  }

  printJoin(nodes: ?Array, parent: Object, opts = {}) {
    if (!nodes || !nodes.length) return;

    if (opts.indent) this.indent();

    const newlineOpts = {
      addNewlines: opts.addNewlines,
    };

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;

      if (opts.statement) this._printNewline(true, node, parent, newlineOpts);

      this.print(node, parent);

      if (opts.iterator) {
        opts.iterator(node, i);
      }

      if (opts.separator && i < nodes.length - 1) {
        opts.separator.call(this);
      }

      if (opts.statement) this._printNewline(false, node, parent, newlineOpts);
    }

    if (opts.indent) this.dedent();
  }

  printAndIndentOnComments(node, parent) {
    let indent = !!node.leadingComments;
    if (indent) this.indent();
    this.print(node, parent);
    if (indent) this.dedent();
  }

  printBlock(parent) {
    let node = parent.body;

    if (!t.isEmptyStatement(node)) {
      this.space();
    }

    this.print(node, parent);
  }

  _printTrailingComments(node, parent) {
    this._printComments(this._getComments(false, node, parent));
  }

  _printLeadingComments(node, parent) {
    this._printComments(this._getComments(true, node, parent));
  }

  printInnerComments(node, indent = true) {
    if (!node.innerComments) return;
    if (indent) this.indent();
    this._printComments(node.innerComments);
    if (indent) this.dedent();
  }

  printSequence(nodes, parent, opts = {}) {
    opts.statement = true;
    return this.printJoin(nodes, parent, opts);
  }

  printList(items, parent, opts = {}) {
    if (opts.separator == null) {
      opts.separator = commaSeparator;
    }

    return this.printJoin(items, parent, opts);
  }

  _printNewline(leading, node, parent, opts) {
    // Fast path since 'this.newline' does nothing when not tracking lines.
    if (this.format.retainLines || this.format.compact) return;

    // Fast path for concise since 'this.newline' just inserts a space when
    // concise formatting is in use.
    if (this.format.concise) {
      this.space();
      return;
    }

    let lines = 0;

    if (node.start != null && !node._ignoreUserWhitespace && this._whitespace) {
      // user node
      if (leading) {
        const comments = node.leadingComments;
        const comment = comments && find(comments, (comment) =>
          !!comment.loc && this.format.shouldPrintComment(comment.value));

        lines = this._whitespace.getNewlinesBefore(comment || node);
      } else {
        const comments = node.trailingComments;
        const comment = comments && findLast(comments, (comment) =>
          !!comment.loc && this.format.shouldPrintComment(comment.value));

        lines = this._whitespace.getNewlinesAfter(comment || node);
      }
    } else {
      // generated node
      if (!leading) lines++; // always include at least a single line after
      if (opts.addNewlines) lines += opts.addNewlines(leading, node) || 0;

      let needs = n.needsWhitespaceAfter;
      if (leading) needs = n.needsWhitespaceBefore;
      if (needs(node, parent)) lines++;

      // generated nodes can't add starting file whitespace
      if (!this._buf.hasContent()) lines = 0;
    }

    this.newline(lines);
  }

  _getComments(leading, node) {
    // Note, we use a boolean flag here instead of passing in the attribute name as it is faster
    // because this is called extremely frequently.
    return (node && (leading ? node.leadingComments : node.trailingComments)) || [];
  }

  _printComment(comment) {
    if (!this.format.shouldPrintComment(comment.value)) return;

    // Some plugins use this to mark comments as removed using the AST-root 'comments' property,
    // where they can't manually mutate the AST node comment lists.
    if (comment.ignore) return;

    if (this._printedComments.has(comment)) return;
    this._printedComments.add(comment);

    if (comment.start != null) {
      if (this._printedCommentStarts[comment.start]) return;
      this._printedCommentStarts[comment.start] = true;
    }

    // whitespace before
    this.newline(this._whitespace ? this._whitespace.getNewlinesBefore(comment) : 0);

    if (!this.endsWith("[") && !this.endsWith("{")) this.space();

    let val = comment.type === "CommentLine" ? `//${comment.value}\n` : `/*${comment.value}*/`;

    //
    if (comment.type === "CommentBlock" && this.format.indent.adjustMultilineComment) {
      let offset = comment.loc && comment.loc.start.column;
      if (offset) {
        let newlineRegex = new RegExp("\\n\\s{1," + offset + "}", "g");
        val = val.replace(newlineRegex, "\n");
      }

      let indentSize = Math.max(this._getIndent().length, this._buf.getCurrentColumn());
      val = val.replace(/\n(?!$)/g, `\n${repeat(" ", indentSize)}`);
    }

    this.withSource("start", comment.loc, () => {
      this._append(val);
    });

    // whitespace after
    this.newline((this._whitespace ? this._whitespace.getNewlinesAfter(comment) : 0) +
      // Subtract one to account for the line force-added above.
      (comment.type === "CommentLine" ? -1 : 0));
  }

  _printComments(comments?: Array<Object>) {
    if (!comments || !comments.length) return;

    for (let comment of comments) {
      this._printComment(comment);
    }
  }
}

function commaSeparator() {
  this.token(",");
  this.space();
}

for (let generator of [
  require("./generators/template-literals"),
  require("./generators/expressions"),
  require("./generators/statements"),
  require("./generators/classes"),
  require("./generators/methods"),
  require("./generators/modules"),
  require("./generators/types"),
  require("./generators/flow"),
  require("./generators/base"),
  require("./generators/jsx")
]) {
  Object.assign(Printer.prototype, generator);
}
