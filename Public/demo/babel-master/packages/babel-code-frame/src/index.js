import jsTokens from "js-tokens";
import esutils from "esutils";
import Chalk from "chalk";

/**
 * Chalk styles for token types.
 */

function getDefs(chalk) {
  return {
    keyword:     chalk.cyan,
    capitalized: chalk.yellow,
    jsx_tag:     chalk.yellow,
    punctuator:  chalk.yellow,
    // bracket:  intentionally omitted.
    number:      chalk.magenta,
    string:      chalk.green,
    regex:       chalk.magenta,
    comment:     chalk.grey,
    invalid:     chalk.white.bgRed.bold,
    gutter:      chalk.grey,
    marker:      chalk.red.bold,
  };
}

/**
 * RegExp to test for newlines in terminal.
 */

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

/**
 * RegExp to test for what seems to be a JSX tag name.
 */

const JSX_TAG = /^[a-z][\w-]*$/i;

/**
 * RegExp to test for the three types of brackets.
 */

const BRACKET = /^[()\[\]{}]$/;

/**
 * Get the type of token, specifying punctuator type.
 */

function getTokenType(match) {
  let [offset, text] = match.slice(-2);
  let token = jsTokens.matchToToken(match);

  if (token.type === "name") {
    if (esutils.keyword.isReservedWordES6(token.value)) {
      return "keyword";
    }

    if (
      JSX_TAG.test(token.value) &&
      (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")
    ) {
      return "jsx_tag";
    }

    if (token.value[0] !== token.value[0].toLowerCase()) {
      return "capitalized";
    }
  }

  if (token.type === "punctuator" && BRACKET.test(token.value)) {
    return "bracket";
  }

  return token.type;
}

/**
 * Highlight `text`.
 */

function highlight(defs: Object, text: string) {
  return text.replace(jsTokens, function (...args) {
    let type = getTokenType(args);
    let colorize = defs[type];
    if (colorize) {
      return args[0].split(NEWLINE).map((str) => colorize(str)).join("\n");
    } else {
      return args[0];
    }
  });
}

/**
 * Create a code frame, adding line numbers, code highlighting, and pointing to a given position.
 */

export default function (
  rawLines: string,
  lineNumber: number,
  colNumber: ?number,
  opts: Object = {},
): string {
  colNumber = Math.max(colNumber, 0);

  let highlighted = (opts.highlightCode && Chalk.supportsColor) || opts.forceColor;
  let chalk = Chalk;
  if (opts.forceColor) {
    chalk = new Chalk.constructor({ enabled: true });
  }
  let maybeHighlight = (chalkFn, string) => {
    return highlighted ? chalkFn(string) : string;
  };
  let defs = getDefs(chalk);
  if (highlighted) rawLines = highlight(defs, rawLines);

  let linesAbove = opts.linesAbove || 2;
  let linesBelow = opts.linesBelow || 3;

  let lines = rawLines.split(NEWLINE);
  let start = Math.max(lineNumber - (linesAbove + 1), 0);
  let end   = Math.min(lines.length, lineNumber + linesBelow);

  if (!lineNumber && !colNumber) {
    start = 0;
    end = lines.length;
  }

  let numberMaxWidth = String(end).length;

  let frame = lines.slice(start, end).map((line, index) => {
    let number = start + 1 + index;
    let paddedNumber = ` ${number}`.slice(-numberMaxWidth);
    let gutter = ` ${paddedNumber} | `;
    if (number === lineNumber) {
      let markerLine = "";
      if (colNumber) {
        let markerSpacing = line.slice(0, colNumber - 1).replace(/[^\t]/g, " ");
        markerLine = [
          "\n ",
          maybeHighlight(defs.gutter, gutter.replace(/\d/g, " ")),
          markerSpacing,
          maybeHighlight(defs.marker, "^")
        ].join("");
      }
      return [
        maybeHighlight(defs.marker, ">"),
        maybeHighlight(defs.gutter, gutter),
        line,
        markerLine
      ].join("");
    } else {
      return ` ${maybeHighlight(defs.gutter, gutter)}${line}`;
    }
  }).join("\n");

  if (highlighted) {
    return chalk.reset(frame);
  } else {
    return frame;
  }
}
