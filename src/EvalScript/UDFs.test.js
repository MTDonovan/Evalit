import { runsec, editor, multiLineTest } from './helpers';


test(`"2.586 . fix {2}" shall output "2.59"`, () => {
  expect(runsec("2.586 . fix {2}").out).toBe("2.59");
});

test(`"10 . add {20, 30}" shall output "60"`, () => {
  expect(runsec("5 . add {10, 20, 30}").out).toBe("65");
});
