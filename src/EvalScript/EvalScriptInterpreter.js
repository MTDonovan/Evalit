const R = require("rambda");


var funcCalls = [];

/** Locate the variable and interpolate the stored value in the eval string */
const interpolateVariable = (lineItem, variablesArray) => {
  /**
   * If a substring in the line begins with "@", locate the correct variable from the
   * variable array, parse the variable's value from the array, and then replace the
   * variables with their associated values.
   *
   * The return value should be the unevaluated line.
   */
  variablesArray.map(item => {
    if (lineItem.includes(item[0])) {
      let variableLocationPattern = item[0],
        re = new RegExp(variableLocationPattern, "g");
      lineItem = lineItem.replace(re, item[1]);
    }
  });

  return lineItem;
}

class EvalScriptInterpreter {
  constructor() {
    this.evalErrorText = "";
    /** The "code" attribute contains the unparsed text of the EvalScript file. */
    this.code = "";
    this.out = "";
    this.currentEvalOperator = "+";
    this.operators = ["+", "-", "*", "/"];
    this.lineResultFlag = "";
    this.ignoreResultFlag = "IGN ";
    this.pipeFunctionOperatorPattern = /([ ]{1,}\|[ ]{1,})+/g;
    /**
     * Set the comment type to js (i.e. "\/\/") by default. The other option is "sh"
     * (i.e. "#"). This property changes the by-line comment type.
     */
    this.comment = "js";
    this.lineno = true;
    this.count = 0;

    this.sumArray = [];
    this.runningSum = 0;
  }
  /**
   * Import the user defined functions. This method is called in App.js
   */
  setUDFs(udfs) {
    for (let i in udfs) {
      if (typeof udfs[i] === "function") {
        funcCalls.push(udfs[i]);
      }
    }
  }
  setCode(codeString) {
    this.code = codeString;
    return this;
  }
  setComment(comment) {
    this.comment = comment;
    return this;
  }
  setLineno(useLineno) {
    this.lineno = useLineno;
    return this;
  }
  changeOperator(operator) {
    this.currentEvalOperator = operator;
  }
  build() {
    this.compileEvalResults();
    return this;
  }
  do(codeString, fixToPoint) {
    let builtObj = this.setCode(codeString).build();
    let outString = obj => `${obj.out}\nSTACK REGISTER ${obj.total}`;

    if (!fixToPoint) {
      return outString(builtObj);
    }

    /**
     * If an fixed point is provided, call the "fix" method before returning the outString
     * function.
     */
    builtObj.fix(fixToPoint);

    return outString(builtObj);
  }
  verifyComment(lineItem) {
    /**
     * Ignore all lines that are either empty or start with the comment token. Ignore all
     * lines that being with a letter (excluding the "def" keyword) or a quotation mark.
     */
    switch (this.comment) {
      case "sh":
        if (lineItem.match(/^(( |\t)+)?#/g)) {
          return true;
        }
      case "js":
      default:
        if (lineItem.match(/^(( |\t)+)?\/\//g)) {
          return true;
        }
    }
    return false;
  }
  verifyLineEmpty(lineItem) {
   /**
    * Ignore all lines that being with a letter (excluding the "def" keyword) or a quotation mark.
    */
    if (!lineItem) {
       return true;
    }
    return false;
  }
  verifyLineEmptyOrComment(lineItem) {
    /**
     * Ignore all lines that are either empty or start with the comment token. Ignore all
     * lines that being with a letter (excluding the "def" keyword) or a quotation mark.
     */
    switch (this.comment) {
      case "sh":
        if (
          !lineItem ||
          lineItem.match(/^(( |\t)+)?#/g) ||
          lineItem.match(/^(( |\t)+)?(?!def )([a-z]|[A-Z]|('|"))/g)
        ) {
          return true;
        }
      case "js":
      default:
        if (
          !lineItem ||
          lineItem.match(/^(( |\t)+)?\/\//g) ||
          lineItem.match(/^(( |\t)+)?(?!def )([a-z]|[A-Z]|('|"))/g)
        ) {
          return true;
        }
    }
    return false;
  }
  verifyOutputOnlyEval(lineItem) {
    /** If the line beings with the IGN syntax, return true. */
    switch (this.comment) {
      case "sh":
        if (lineItem.match(/^(( |\t)+)?!#/g)) {
          return true;
        }
      case "js":
      default:
        if (lineItem.match(/^(( |\t)+)?!\/\//g)) {
          return true;
        }
    }
    return false;
  }
  splitVariable(lineItem, variablesArray) {
    let x = lineItem.split("def ")[1];
    /** Split the array on the first instance "=" is found */
    let y = x.split(/=(.+)/g).map((item, index) => {
      /**
       * If a pipe call is present on the second index, return it without replacing any
       * spaces.
       */
      if (index === 1 && item.match(/^([\s]+)?@([\s]+)?\|([\s]+)?/g)) {
        return item;
      }
      return item.replace(/\s/g, "");
    });
    /** If a pipe call is present in the var, invoke it on y[1] */
    if (y[1].match(this.pipeFunctionOperatorPattern)) {
      return variablesArray
        ? [y[0], this.invokePipeCalls(y[1], variablesArray)]
        : y;
    }

    /** If a func call is present in the var, invoke it on y[1] */
    if (this.locateFuncCalls(y[1])) {
      return variablesArray
        ? [y[0], this.invokeFuncCalls(y[1], variablesArray)]
        : y;
    }

    return variablesArray
      ? [y[0], interpolateVariable(y[1], variablesArray)]
      : y;
  }
  /** If the line contains any of the known funcCalls, return true */
  locateFuncCalls(lineItem) {
    /**
     * Check if a funcCall is present within the given line. If yes, return "true".
     */
    let funcCallPresent = false;
    for (let i = 0; i < funcCalls.length; i++) {
      /**
       * Locate function calls that begin with variables.
       */
      let variableLocationPattern = funcCalls[i].name,
        re_1 = new RegExp(`(^ ?${variableLocationPattern} ?{(.*)}$)`, "g");
      if (lineItem.match(re_1)) {
        funcCallPresent = true;
        break;
      }
      /**
       * Locate function calls that do not begin with variables.
       */
      let re_2 = new RegExp(this.pipeFunctionOperatorPattern, "g");
      if (lineItem.match(re_2)) {
        funcCallPresent = true;
        break;
      }
    }

    return funcCallPresent;
  }
  /// TODO Does not find instances of func calls without "@ |" prefix
  /// during variable assignment.
  /** Run an eval statement using the given funcCalls in the line. */
  invokeFuncCalls(lineItem, variablesArray) {
    for (let i = 0; i < funcCalls.length; i++) {
      let variableLocationPattern = funcCalls[i].name,
        re = new RegExp(`${variableLocationPattern} ?{(.*)}`, "g");
      if (lineItem.match(re)) {
        let parseFuncCallExpression = (line, func) => {
          let re = new RegExp(`(^${func} ?{|}$)`, "gi");
          return line.replace(re, "");
        };

        let x = parseFuncCallExpression(lineItem, funcCalls[i].name);

        let y = interpolateVariable(x, variablesArray);

        let res = R.pipe(
          x => x.split(","),
          x => x.map(x => (x = eval(x))),
          x => funcCalls[i](x)
        )(y);

        /**
         * Return 0 if the function is equal to 0 or if the result cannot be evaluated.
         */
        if (eval(res) === 0 || !eval(res)) {
          return "0";
        }
        return res;
      }
    }
    return lineItem;
  }
  invokePipeCalls(lineItem, variables) {
    /** Remove the prefixed ignore operator if it is present. */
    const sanitizedLineItem =
      this.comment === "sh"
        ? lineItem.replace(/!# ?/g, "")
        : lineItem.replace(/!\/\/ ?/g, "");

    const x = sanitizedLineItem
      .split(this.pipeFunctionOperatorPattern)
      .filter(i => !i.match(this.pipeFunctionOperatorPattern));
    let y = x.map(i => interpolateVariable(i, variables));
    for (let i = 0; i < y.length; i++) {
      let trimmedItem = y[i].trim();

      if (this.locateFuncCalls(trimmedItem) && i !== 0) {
        let evalPreviousIndex = eval(y[i - 1]);

        let sp = trimmedItem.split("{");
        let pipedString = `${sp[0]}{${evalPreviousIndex}${sp[1] ? "," + sp[1] : ""}`;

        const res = R.pipe(
          x => this.invokeFuncCalls(...x),
          eval
        )([pipedString, variables]);

        /** Modify the current item in the array to match the piped output. */
        y[i] = res;
      } else if (this.locateFuncCalls(trimmedItem) && i === 0) {
        /**
         * If the funcCall is the first func in the pipe, eval the funcCall and modify the
         * current item in the pipe chain.
         */
        const res = R.pipe(
          x => this.invokeFuncCalls(...x),
          eval
        )([trimmedItem, variables]);

        y[i] = res;
      }
    }

    return `${y[y.length - 1]}`;
  }
  compileEvalResults() {
    let arr = this.code.split("\n");

    /** Per array item, remove problem characters. */
    let splitArr = arr.map(item => {
      if (this.verifyLineEmptyOrComment(item)) {
        return item;
      }
      if (this.verifyOutputOnlyEval(item)) {
        return item;
      }
      /** Allow variable declarations to remain in the splitArr unmodified. */
      if (item.match(/^def/g)) {
        return item;
      }
      /** Allow lines that use variables to remain in the splitArr unmodified. */
      if (item.match(/@/g)) {
        return item;
      }
      /**
       * If the item contains a reference to a funcCall, return the item unmodified.
       */
      if (this.locateFuncCalls(item)) {
        return item;
      }
      /** Remove the garbage characters from the given item */
      return item.split(/\$|,|[a-zA-Z]/g).join("");
    });

    let variables = [];

    let filteredArr = splitArr.filter(item => {
      /** Return lines that are either empty or start with the comment syntax. */
      if (this.verifyLineEmptyOrComment(item)) {
        return item;
      }
      if (this.verifyOutputOnlyEval(item)) {
        return item;
      }
      /** If an item begins with "@", push it into the variables array. */
      if (item.match(/^def/g)) {
        variables.push(this.splitVariable(item, variables));
        return item;
      }
      /**
       * If the line contains a previously declared variable, leave it in the array
       * unmodified.
       */
      if (item.match(/@/g)) {
        return item;
      }
      /**
       * If the item contains a reference to a funcCall, return the item unmodified.
       */
      if (this.locateFuncCalls(item)) {
        return item;
      }
      /** Return nothing if the line cannot be evaluated. */
      try {
        return eval(item);
      } catch (e) {
        console.log("Error occurred during eval: " + item.toString());
        return null;
      }
    });

    if (filteredArr.length === 0) {
      this.out = "";
    }

    if (filteredArr.length !== 0) {
      this.out = arr
        .map((item, index) => {
          let isSum = false;
          if (this.verifyLineEmpty(item)) {
            this.sumArray.push(this.runningSum);
            this.sumArray.push(this.runningSum);
            this.runningSum = 0;
            return `${this.lineno ? (index + 1).toString() + "  " : ""}${item}\n`;
          }
          if (this.verifyComment(item)) {
            return `${this.lineno ? (index + 1).toString() + "  " : ""}${item}\n`;
          }
          /** Replace instances of "$sum" key word with current sum index value. */
          if (item.match(/\$sum/g)) {
            item = item.replace(/\$sum/g, this.sumArray[this.sumArray.length - 1]);
            isSum = true;
          }
          /** In the case the line is defining a variable, return the item as-is. */
          if (item.match(/^def/g)) {
            return `${this.lineno ? (index + 1).toString() + "  " : ""}${item}\n`;
          }

          try {
            if (item.match(this.pipeFunctionOperatorPattern)) {
              const res = this.invokePipeCalls(item, variables);
              if (this.verifyOutputOnlyEval(item)) {
                return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.ignoreResultFlag}${res}\n`;
              } else {
                /** Update the running sum with the resolved function value. */
                if (parseFloat(res)) {
                  this.runningSum += parseFloat(res);
                  this.count += 1;
                }
                if (isSum) {
                  return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.lineResultFlag}SUM ${res}\n`;
                } else {
                  return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.lineResultFlag}${res}\n`;
                }
              }
            }

            let locateFn = entity => {
              switch (this.comment) {
                case "sh":
                  return this.locateFuncCalls(entity.replace(/^!# ?/g, ""));
                case "js":
                default:
                  return this.locateFuncCalls(entity.replace(/^!\/\/ ?/g, ""));
              }
            };
            let replaceFn = entity => {
              switch (this.comment) {
                case "sh":
                  return entity.replace(/^!# ?/g, "");
                case "js":
                default:
                  return entity.replace(/^!\/\/ ?/g, "");
              }
            };

            if (locateFn(item)) {
              let res = R.pipe(
                replaceFn,
                x => this.invokeFuncCalls(x, variables),
                eval
              )(item);

              if (this.verifyOutputOnlyEval(item)) {
                return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.ignoreResultFlag}${res}\n`;
              } else {
                /** Update the running sum with the resolved function value. */
                this.runningSum += res;
                this.count += 1;
                if (isSum) {
                  return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.lineResultFlag}SUM ${res}\n`;
                } else {
                  return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.lineResultFlag}${res}\n`;
                }
              }
            }

            let res = R.pipe(
              replaceFn,
              x => interpolateVariable(x, variables),
              eval
            )(item);

            if (!res) {
              return "0\n";
            }

            if (this.verifyOutputOnlyEval(item)) {
              return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.ignoreResultFlag}${res}\n`;
            } else {
              /** Update the running sum with the resolved function value. */
              this.runningSum += res;
              this.count += 1;
              if (isSum) {
                // HERE!
                // let len = this.code.match(/\$sum/g).length;
                return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.lineResultFlag}SUM ${res}\n`;
              } else {
                return `${this.lineno ? (index + 1).toString() + "  " : ""}${this.lineResultFlag}${res}\n`;
              }
            }
          } catch (e) {
            return `${this.lineno ? (index + 1).toString() + "  " : ""}${e}\n`;
          }
        })
        .join("");

      /** Remove the final newline character from the output. */
      this.out = this.out.slice(0, this.out.length - 1);
    }
  }
}

export { EvalScriptInterpreter as E };
