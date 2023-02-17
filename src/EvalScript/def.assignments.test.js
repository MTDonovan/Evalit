import { runsec, editor, multiLineTest } from './helpers';


var expr = editor(`
def @num = 10

@num
`);
var expt = editor(`
def @num = 10

10
`);
test(multiLineTest(expr, "shall resolve to", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



var expr = editor(`
def @num = 10 / 2.5

@num
`);
var expt = editor(`
def @num = 10 / 2.5

4
`);
test(multiLineTest(expr, "shall resolve to", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



var expr = editor(`
def @num = @ | 10.568 | fix {2}

@num
`);
var expt = editor(`
def @num = @ | 10.568 | fix {2}

10.57
`);
test(multiLineTest(expr, "shall resolve to", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



var expr = editor(`
def @num_one = 10
def @num_two = @num_one

@num_two
`);
var expt = editor(`
def @num_one = 10
def @num_two = @num_one

10
`);
test(multiLineTest(expr, "shall resolve to", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});



var expr = editor(`
def @num_one = 10
def @num_two = @num_one / 2.5

@num_two
`);
var expt = editor(`
def @num_one = 10
def @num_two = @num_one / 2.5

4
`);
test(multiLineTest(expr, "shall resolve to", expt), () => {
  expect(runsec(expr).out).toBe(expt);
});
