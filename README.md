Evalit is a FOSS notepad calculator app that allows you to leverage your JavaScript
knowledge to create custom functions. You can find binaries for Windows 10 (exe installer)
and Linux (AppImage and Snap) on the [release page](https://github.com/MTDonovan/Evalit/releases).

![Alt text](screenshots/BasicExample.png)

The aim of Evalit is to merge the ease of use of notepad calculator apps like Soulver and
NoteCalc with the configurability of spreadsheet programs like LibreOffice Calc. This is
accomplished by loading two JavaScript files containing user defined modules into the
app's runtime which can then be accessed using the EvalScript syntax.

# Quickstart

In the Evalit appdata > user.defined.functions.js file:

``` js
var fix  = exp => exp[0].toFixed(exp[1]);             // Round a number to a specific point
var sub  = exp => exp[0] - exp[1];                    // Subtract
var up   = exp => exp[0] + (exp[0] * (exp[1] / 100)); // Increase a number by a percentage
var down = exp => exp[0] - (exp[0] * (exp[1] / 100)); // Decrease a number by a percentage

module.exports = {                                    // Export the functions
  fix, sub, up, down
};
```

In the Evalit notepad:

``` js
def @total = 925.548
def @tax   = 5.5

Sub Total
@total . fix {2}

Tax Amount
@total . up {@tax} . sub {@total} . fix {2}

Post-Tax Total
@total . up {@tax} . fix {2}
```

Result in Evalit:

![Alt text](screenshots/InvoiceExample.png)

# Instructions

## EvalScript

EvalScript is the syntax that runs within the Evalit notepad. EvalScript is evaluated
line-by-line (similar in effect to a REPL).

There are three values that take into account all evaluated lines at the bottom of the
Evalit GUI:
- Average
- Count
- Sum

The EvalScript syntax allows you to do the following in the notepad:
1. Define variables
2. Chain user defined functions

Define a variable in the notepad:

``` js
def @pi = 3.14
```

Use the variable anywhere in the notepad:

``` js
(@pi / 0.5) * 100 // This line will resolve to "628"
```

The function chaining syntax was inspired by the pipeline operator in programming
languages such as Elixir. When you invoke a chained function on a number, the number is
used as the first parameter of the function and the following parameters are the values
passed to the EvalScript function call (i.e., "functionName {param1, param2, etc.}"). You
access the individual EvalScript function parameters as indexes of the array in
JavaScript.

``` js
// user.defined.functions.js" file
var up = exp => {
    let num = exp[0];        // exp[0] is the number that the function is being called on.
    let percentage = exp[1]; // exp[1] is the first parameter in the EvalScript function parameters (i.e. "up {param1}").
    return num + (num * (percentage / 100));
};

module.exports = {
  up
};
```

``` js
// Evalit notepad
150 . up {25} // This line will resolve to "187.5"
```

You can also assign the result of mathematical expressions and functions to a variable. To
use a function in a variable assignment, you are required to prefix the assignment with "@
.".

``` js
def @result = @ . (150 / 1.2255) * 2 . up {5.225} . fix {4} // This will assign the value "257.5887" to "@result"

@result * 3.0 . down {25} . fix {2} // This line will resolve to "579.57"
@result * 2.0 . down {15} . fix {2} // This line will resolve to "437.9"
@result * 0.5 . down {15} . fix {2} // This line will resolve to "109.48"
```

EvalScript supports "//" comments for preventing a line from being evaluated. Lines that
begin with a quotation mark, double quotation mark, or letter, will also not be evaluated.

``` js
// This line will not be evaluated; text in this line will be outputed to the read-only editor unchanged.
This line will also not be evaluated.
```

EvalScript allows you to evaluate a line without having its value included in the Count,
Average, and Sum values in the Evalit GUI footer by prefixing the line with "!//". Lines
that are evaluated in this manner will be outputted to the read-only editor with the
prefix "IGN".

![Alt text](screenshots/IGNExample.png)

Also be aware that because all lines are evaluated in JavaScript as template literals,
you can insert JavaScript snippets into lines like so:

``` js
${ Math.floor([50.15, 0.899].reduce((x, y) => x + y)) } // This line will resolve to "51"
```

You can use template literals to access the code from the "user.defined.data.js" and
"user.defined.functions.js" modules like so:

``` js
// user.defined.data.js file

var pi = 3.14;     // Define a variable

module.exports = { // Export the $data module
  pi
};
```

``` js
// user.defined.functions.js file

var up = exp => exp[0] + (exp[0] * (exp[1] / 100)); // Create a function

module.exports = {                                  // Export the $fn module
  up
};
```

``` js
// Access the $data module exported from user.defined.data.js
${ $data.pi }            // This line will resolve to "3.14"

// Access the $fn module exported from user.defined.functions.js
${ $fn.up([150, 5.25]) } // This line will resolve to "157.875"
```
