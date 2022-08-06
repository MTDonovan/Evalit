const EvalScriptInterpreter = require('./EvalScriptInterpreter');
const UDFs = require('./user.defined.functions.sample');


function runsec(value) {
  let sec = new EvalScriptInterpreter.E();
  /**
   * Import the user defined functions.
   */
  sec.setUDFs(UDFs);
  /**
   * Transform the stack editor text into a template literal. This is required to
   * allow the user to insert JavaScript snippets.
   */
  sec.code = eval("`" + value + "`");
  sec.setLineno(false).build();

  return {
    "out": sec.out,
    "sr": sec.sr.toFixed(2)
  }
}

test(`"2.586 . fix {2}" shall output "2.59"`, () => {
  expect(runsec("2.586 . fix {2}").out).toBe("2.59");
});
