import { E } from './EvalScriptInterpreter';
const UDFs = require('./user.defined.functions.sample');


/**
Instantiate the EvalScript Interpreter and generate an output and stack register.
*/
const runsec = (value) => {
  let sec = new E();
  /**
   * Import the user defined functions.
   */
  sec.setUDFs(UDFs);
  /**
   * Transform the stack editor text into a template literal. This is required to allow
   * the user to insert JavaScript snippets.
   */
  sec.code = eval("`" + value + "`");
  sec.setLineno(false);
  sec.build();

  return {
    "out": sec.out,
    "sr": sec.sr.toFixed(2)
  }
}

/**
Simulate a multiline editor.
Example of usage:

var expr = editor(`
10
20
30

$sum

`);
var expt = editor(`
10
20
30

$sum
`);
*/
const editor = (value) => {
  return value
      .split("\n")
      .slice(1)
      .slice(0, -1)
      .join("\n");
}
/**
Test statements using mutiline expressions and multiline expects.
*/
const multiLineTest = (expr, msg, expt) => {
  return `
=====>
///START EDITOR EXPR///
${expr}
///END EDITOR EXPR///

${msg}

///START EDITOR EXPT///
${expt}
///END EDITOR EXPT///
=====<`;
}

export {
  runsec,
  editor,
  multiLineTest
};
