"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeIndentationString = exports.makeError = void 0;
function makeError(failedString) {
    return new Error(`Whoops! Your idiot, yet cute, boy friend must have missed something in his code. Call him!

Cannot parse ${failedString}.
`);
}
exports.makeError = makeError;
function makeIndentationString(indentation) {
    return "    ".repeat(indentation);
}
exports.makeIndentationString = makeIndentationString;
