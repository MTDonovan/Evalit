import { runsec, editor, multiLineTest } from './helpers';


/**
 * Single $sum statement for number block.
 */
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

SUM 60
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



/**
 * $sum statement with piped function.
 */
var expr = editor(`
10.051
10.052
10.053

$sum | fix {2}
`);

var expt = editor(`
10.051
10.052
10.053

SUM 30.16
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



/**
 * Multiple $sum statements for the same number block.
 */
var expr = editor(`
10.051
10.052
10.053

$sum
$sum | fix {2}
$sum | add {10, 20, 30}
`);

var expt = editor(`
10.051
10.052
10.053

SUM 30.156000000000002
SUM 30.16
SUM 90.156
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



/**
 * Single $sum statements for multiple number blocks.
 */
var expr = editor(`
10
20
30

$sum

100
200
300

$sum

1000
2000
3000

$sum
`);

var expt = editor(`
10
20
30

SUM 60

100
200
300

SUM 600

1000
2000
3000

SUM 6000
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



/**
 * Reproduce the first-line infinite $sum addition error.
 */
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

SUM 60
`);

test(multiLineTest(expr, "shall equal", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});
