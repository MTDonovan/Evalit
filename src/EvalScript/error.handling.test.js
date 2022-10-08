import { runsec, editor, multiLineTest } from './helpers';



/**
 * Verify that numbers can resolve to zero in the output editor.
 */
var expr = editor(`
0
`);

var expt = editor(`
0
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



/**
 * Verify that numbers can resolve to zero in the output editor.
 */
var expr = editor(`
10 - 10
`);

var expt = editor(`
0
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



/**
 * Verify that numbers can resolve to zero in the output editor.
 */
var expr = editor(`
0

0

10 - 10
`);

var expt = editor(`
0

0

0
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});
