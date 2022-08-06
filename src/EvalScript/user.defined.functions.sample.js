// Write your functions in this file.

const add = exp => exp.reduce((x, y) => x + y);
const sub = exp => exp.reduce((x, y) => x - y);
const fix = exp => parseFloat(exp).toFixed(exp[1]);


module.exports = {
    add,
    sub,
    fix
}
