import { runsec, editor, multiLineTest } from './helpers';


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

60
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});
