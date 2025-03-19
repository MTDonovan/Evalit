import { runsec } from './helpers';
import { test, expect } from '@jest/globals';


test(`"2.586 | fix {2}" shall output "2.59"`, () => {
  expect(runsec("2.586 | fix {2}").out).toBe("2.59");
});

test(`"10 | add {20, 30}" shall output "60"`, () => {
  expect(runsec("5 | add {10, 20, 30}").out).toBe("65");
});

var expr = "100 | add {10, 20, 30, 5.25567} | fix {3}";
var expt = "165.256";
test(`"${expr}" shall output "${expt}"`, () => {
  expect(runsec(expr).out).toBe(expt);
});
