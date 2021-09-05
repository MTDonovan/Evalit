import { app, ipcRenderer } from "electron";
import MonacoEditor from "vue-monaco";
import { E, LabourModel, today } from "./EvalScript/index";
import * as monaco from "monaco-editor";
const $data = __non_webpack_require__(
  ipcRenderer.sendSync("get-file-path", "data")
);
const $fn = __non_webpack_require__(
  ipcRenderer.sendSync("get-file-path", "functions")
);
import PostExecInputs from "./components/PostExecInputs";
import * as path from "path";

export default {
  name: "App",
  components: {
    MonacoEditor,
    PostExecInputs
  },
  data() {
    return {
      settingsModalVisible: false,
      counter: 0,
      modalEditorVisible: true,
      outputEditorVisible: true,
      // consoleCommand: "",
      // commandsList: [
      //   "commands",
      //   "cls",
      //   "appdata",
      //   "data",
      //   "functions",
      //   "theme"
      // ],
      // previousCommandIndex: 0,
      // previousCommands     : [],
      // previousConsoleLines : [],
      // quakeConsoleDisplayed: false,
      currentTheme: "vs-dark",
      mainEditorOptions: {
        fontSize: 13,
        minimap: {
          enabled: false
        }
      },
      outputEditorOptions: {
        fontSize: 13,
        readOnly: true,
        minimap: {
          enabled: false
        }
      },
      maineditor: "",
      modaleditor: "",
      out: "",
      sr: 0,
      output: "",
      average: 0,
      count: 0,
      themeOptions: ["vs-light", "vs-dark"],
      appdataPath: "",
      dataFilePath: "",
      functionsFilePath: ""
    };
  },
  mounted() {
    function getFilePath(fileType) {
      return new Promise(resolve => {
        setTimeout(_ => {
          resolve(ipcRenderer.sendSync("get-file-path", fileType));
        }, 500);
      });
    }

    getFilePath("functions").then(res => {
      this.functionsFilePath = res;
    });
    getFilePath("data").then(res => {
      this.dataFilePath = res;
    });
    getFilePath("appdata").then(res => {
      this.appdataPath = res;
    });

    document
      .querySelector(".multi-editor-container")
      .setAttribute("style", "height: 684px;");

    this.$nextTick(() => {
      /**
       * Adjust the elements on resize.
       */
      window.addEventListener("resize", () => {
        this.updateTableWrapperHeight();
        this.updateModalEditorSize();
      });
    });

    this.modalEditorVisible = false;

    /**
     * Load the previously saved maineditor text if it exists in the localstorage.
     */
    let tmp = localStorage.getItem("maineditorTMP");
    if (tmp) {
      this.maineditor = tmp;
      this.evalEvent();
    }

    /// WARNING :: The editor height is broken. It only increases, never decreases. I've
    /// disabled the previous height settings for now.
    // /**
    //  * Load the previously saved editor group height if it exists in the localstorage.
    //  */
    // let editorGroupHeightTMP = localStorage.getItem("editorGroupHeightTMP");
    // if (editorGroupHeightTMP) {
    //   document.querySelector(".multi-editor-container").setAttribute("style", `height: ${editorGroupHeightTMP}px;`);
    // }

    // /** Focus the main editor */
    // this.$refs.refMainEditor.getEditor().focus();
    this.updateModalEditorSize();

    /**
     * Load the preferred theme. Set to vs-dark if no theme is provided.
     */
    let theme = window.localStorage.getItem("theme");
    if (theme) {
      this.currentTheme = theme;
    }

    // this.appdataPath = ipcRenderer.send("get-file-path", "appdata");
    // this.dataFilePath = ipcRenderer.send("get-file-path", "data");
    // this.functionsFilePath = ipcRenderer.send("get-file-path", "functions");
  },
  computed: {
    scaledAutocompleteResultsContainerHeight() {
      return {
        height: "300px"
      };
    },
    settingsModalBodyStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "#333",
          "background-color": "rgb(232, 230, 232)"
        };
      } else {
        return {};
      }
    },
    settingsInputStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "#333",
          "background-color": "rgb(252, 252, 252)",
          border: "1px solid transparent",
          "border-color": "#c2c0c2 #c2c0c2 #a19fa1"
        };
      } else {
        return {};
      }
    },
    settingsLabelColour() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "#333"
        };
      } else {
        return {};
      }
    },
    btnStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "#333",
          "background-image":
            "linear-gradient(to bottom, #fcfcfc 0%, #f1f1f1 100%)",
          border: "1px solid transparent",
          "border-color": "#c2c0c2 #c2c0c2 #a19fa1",
          "box-shadow": "0 1px 1px rgb(0 0 0 / 6%)"
        };
      } else {
        return {};
      }
    },
    btnIconStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "#333"
        };
      } else {
        return {};
      }
    },
    headerStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "inherit",
          "background-image":
            "linear-gradient(to bottom,#e8e6e8 0,#d1cfd1 100%)",
          "background-color": "#e8e6e8",
          border: "1px solid #c2c0c2",
          padding: "5px"
        };
      } else {
        return {
          padding: "5px"
        };
      }
    },
    headerLabelStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "black"
        };
      } else {
        return {};
      }
    },
    footerStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "inherit",
          "background-image":
            "linear-gradient(to bottom,#e8e6e8 0,#d1cfd1 100%)",
          "background-color": "#e8e6e8",
          border: "1px solid #c2c0c2"
        };
      } else {
        return {};
      }
    },
    footerLabelStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "black"
        };
      } else {
        return {};
      }
    },
    toolbarStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "#333",
          "background-image":
            "linear-gradient(to bottom, #fcfcfc 0%, #f1f1f1 100%)",
          border: "1px solid transparent",
          "border-color": "#c2c0c2 #c2c0c2 #a19fa1",
          "box-shadow": "0 1px 1px rgb(0 0 0 / 6%)"
        };
      } else {
        return {};
      }
    },
    selectStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "inherit",
          "background-image":
            "linear-gradient(to bottom, #fcfcfc 0%, #f1f1f1 100%)",
          border: "1px solid #ddd",
          "border-color": "#c2c0c2 #c2c0c2 #a19fa1",
          "box-shadow": "0 1px 1px rgb(0 0 0 / 6%)"
        };
      } else {
        return {};
      }
    },
    optionStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          color: "inherit",
          "background-image":
            "linear-gradient(to bottom, #fcfcfc 0%, #f1f1f1 100%)",
          "background-color": "#fff"
        };
      } else {
        return {};
      }
    },
    displayQuakeConsole() {
      if (this.quakeConsoleDisplayed === true) {
        return {};
      } else {
        return {
          display: "None"
        };
      }
    }
  },
  methods: {
    saveEvalText() {
      window.localStorage.setItem("maineditorTMP", this.maineditor);
    },
    toggleSettingsModal() {
      if (this.settingsModalVisible) {
        this.settingsModalVisible = false;
      } else {
        this.settingsModalVisible = true;
      }
      // ipcRenderer.send("sample-dialog", "");
    },
    saveSettings() {
      this.toggleSettingsModal();
    },
    changeThemeSetting() {
      window.localStorage.setItem("theme", this.currentTheme);
    },
    getPreferredTableWrapperHeight() {
      // let selector = "#editors-container";
      let headerHeight = document.querySelector(".toolbar-header").clientHeight;
      return window.innerHeight - headerHeight;
    },
    updateTableWrapperHeight() {
      let selector = "#editors-container";
      let headerHeight = document.querySelector(".toolbar-header").clientHeight;
      let footerHeight = document.querySelector(".toolbar-footer").clientHeight;
      this.waitForDocumentElement(selector, 1500).then(() => {
        document
          .querySelector(selector)
          .setAttribute(
            "style",
            `height: ${window.innerHeight - (headerHeight + footerHeight)}px;`
          );
        this.$refs.refMainEditor.getEditor().layout();
        this.$refs.refOutputEditor.getEditor().layout();
      });
    },
    updateModalEditorSize() {
      let selector = ".modal-editor-container";
      let modalBodyHeight = document.querySelector(".crude-modal-body")
        .clientHeight;
      let modalBodyWidth = document.querySelector(".crude-modal-body")
        .clientWidth;
      this.waitForDocumentElement(selector, 1500).then(() => {
        document
          .querySelector(selector)
          .setAttribute(
            "style",
            `height: ${modalBodyHeight}px; width: ${modalBodyWidth}px;`
          );
      });
    },
    // openQuakeConsole() {
    //   this.quakeConsoleDisplayed = !this.quakeConsoleDisplayed;
    //   if (this.quakeConsoleDisplayed) {
    //     this.waitForDocumentElement(".quake-console-input", 1500).then(() => {
    //       document.querySelector(".quake-console-input").focus();
    //     });
    //   } else {
    //     this.$refs.refMainEditor.getEditor().focus();
    //   }
    // },
    postRunConsoleCommand() {
      /**
       * Save the previous command.
       */
      this.previousCommands.push(this.consoleCommand);
      this.consoleCommand = "";
      let consoleElm = document.querySelector(".quake-console");
      consoleElm.scrollTop = consoleElm.scrollHeight;
    },
    runConsoleCommand() {
      /**
       * Run partial commands with sub commands.
       */
      let commandPartialMatch = this.commandsList.filter(x => {
        let re = new RegExp("^" + x + " [a-z|A-Z]", "g");
        return this.consoleCommand.match(re);
      });

      if (commandPartialMatch && commandPartialMatch.length > 0) {
        if (this.consoleCommand.match(/^theme [a-z|A-Z]/g)) {
          this.currentTheme = this.consoleCommand.split("theme ")[1];
        }
        this.postRunConsoleCommand();
        return;
      }

      /**
       * Verify that the provided console command is in the command list.
       * + note :: This is for commands without subcommands.
       */
      if (!this.commandsList.includes(this.consoleCommand)) {
        this.previousConsoleLines.push(
          `Console command "${this.consoleCommand}" does not exist.`
        );
        this.postRunConsoleCommand();
        return;
      }

      switch (this.consoleCommand) {
        case "commands":
          this.previousConsoleLines = this.previousConsoleLines.concat(
            this.commandsList
          );
          break;
        case "cls":
          this.previousConsoleLines = [];
          break;
        case "appdata":
          this.quakeConsoleDisplayed = false;
          ipcRenderer.send("open-path-default-app", "appdata");
          break;
        case "data":
          this.quakeConsoleDisplayed = false;
          ipcRenderer.send("open-path-default-app", "data");
          break;
        case "functions":
          this.quakeConsoleDisplayed = false;
          ipcRenderer.send("open-path-default-app", "functions");
          break;
      }
      this.postRunConsoleCommand();
    },
    openAppDataFolder() {
      ipcRenderer.send("open-path-default-app", "appdata");
    },
    openDataFile() {
      ipcRenderer.send("open-path-default-app", "data");
    },
    openFunctionsFile() {
      ipcRenderer.send("open-path-default-app", "functions");
    },
    updateData() {
      this.modalEditorVisible = false;
    },
    waitForDocumentElement(selector) {
      return new Promise(resolve => {
        let waitForElementToDisplay = (selector, time) => {
          if (document.querySelector(selector) != null) {
            resolve(document.querySelector(selector));
          } else {
            setTimeout(() => {
              waitForElementToDisplay(selector, time);
            }, time);
          }
        };
        waitForElementToDisplay(selector, 200);
      });
    },
    mainEditorDidMount(editor) {
      window.addEventListener("resize", () => editor.layout());
      editor.onContextMenu(_e => {
        this.evalEvent();
      });
      editor.onDidAttemptReadOnlyEdit(_e => {
        this.evalEvent();
      });
      editor.onDidBlurEditorText(_e => {
        this.evalEvent();
      });
      editor.onDidBlurEditorWidget(_e => {
        this.evalEvent();
      });
      editor.onDidChangeConfiguration(_e => {
        this.evalEvent();
      });
      editor.onDidChangeCursorPosition(_e => {
        this.evalEvent();
      });
      editor.onDidChangeCursorSelection(_e => {
        this.evalEvent();
      });
      editor.onDidChangeModel(_e => {
        this.evalEvent();
      });
      editor.onDidChangeModelContent(_e => {
        this.evalEvent();
      });
      editor.onDidChangeModelDecorations(_e => {
        this.evalEvent();
      });
      editor.onDidChangeModelLanguage(_e => {
        this.evalEvent();
      });
      editor.onDidChangeModelLanguageConfiguration(_e => {
        this.evalEvent();
      });
      editor.onDidChangeModelOptions(_e => {
        this.evalEvent();
      });
      editor.onDidContentSizeChange(_e => {
        this.evalEvent();
      });
      editor.onDidDispose(_e => {
        this.evalEvent();
      });
      editor.onDidFocusEditorText(_e => {
        this.evalEvent();
      });
      editor.onDidFocusEditorWidget(_e => {
        this.evalEvent();
      });
      editor.onDidLayoutChange(_e => {
        this.updateTableWrapperHeight();
        this.evalEvent();
      });
      editor.onDidPaste(_e => {
        this.evalEvent();
      });
      editor.onKeyDown(_e => {
        this.evalEvent();
      });
      editor.onKeyUp(_e => {
        this.evalEvent();
      });
      editor.onMouseDown(_e => {
        this.evalEvent();
      });
      editor.onMouseLeave(_e => {
        this.evalEvent();
      });
      editor.onMouseMove(_e => {
        this.evalEvent();
      });
      editor.onMouseUp(_e => {
        this.evalEvent();
      });
      /**
       * Re-evalulate the stack as the user types.
       */
      editor.onDidScrollChange(_e => {
        this.$refs.refOutputEditor
          .getEditor()
          .setScrollTop(editor.getScrollTop());
      });
    },
    outputEditorDidMount(editor) {
      window.addEventListener("resize", () => editor.layout());
      editor.onDidScrollChange(_e => {
        this.$refs.refMainEditor
          .getEditor()
          .setScrollTop(editor.getScrollTop());
      });
    },
    indexConsoleCommands() {
      let previousCommand = this.previousCommands.pop();
      this.consoleCommand = previousCommand;
    },
    handleHotKeys(event) {
      /// TODO implement the hotkey in a way that does no block normal up-key usage
      // if (event.srcKey === "gotoPreviousCommand" &&
      //     this.quakeConsoleDisplayed &&
      //     document.querySelector(".quake-console-input") === document.activeElement) {
      //   this.indexConsoleCommands();
      // }
      if (event.srcKey === "eval") {
        this.evalEvent();
        return;
      }
      // if (event.srcKey === "openConsole") {
      //   this.quakeConsoleDisplayed = !this.quakeConsoleDisplayed;
      //   if (this.quakeConsoleDisplayed) {
      //     this.waitForDocumentElement(".quake-console-input", 1500).then(() => {
      //       document.querySelector(".quake-console-input").focus();
      //     });
      //   } else {
      //     this.$refs.refMainEditor.getEditor().focus();
      //   }
      //   return;
      // }
    },
    secBuild() {
      let sec = new E();
      /**
       * Transform the stack editor text into a template literal.
       * This is required to allow the user to use javascript templates.
       */
      sec.code = eval("`" + this.maineditor + "`");
      sec.setLineno(false).build();

      this.out = sec.out;
      this.sr = sec.sr.toFixed(2);
      this.count = sec.count;
      this.average = sec.count ? (this.sr / this.count).toFixed(2) : "0.00";
    },
    /**
     * Set the existing maineditor text in the localstorage and reload the window.
     */
    reloadEvent() {
      window.localStorage.setItem("maineditorTMP", this.maineditor);
      window.localStorage.setItem(
        "editorGroupHeightTMP",
        document.querySelector("body").clientHeight -
          document.querySelector("header").clientHeight
      );
      ipcRenderer.send("relaunch-app");
    },
    evalEvent() {
      this.secBuild();
      this.output = this.out
        .split("\n")
        .slice(0, -1)
        .join("\n");
      // console.log(this.$refs.refMainEditor.getEditor());
      // this.$refs.refOutputEditor.getEditor().setValue("This is some text");
    },
    setOutputSelection() {
      // Parameters
      //     startLineNumber: number
      //     startColumn: number
      //     endLineNumber: number
      //     endColumn: number
      var cursorLineNumber = this.$refs.refMainEditor.getEditor().getPosition()
        .lineNumber;
      // var cursorLineEnd = this.$refs.refMainEditor.getEditor().getPosition().column;
      // console.log(this.$refs.refMainEditor.getEditor());

      // this.lineDecorationRange = { range: new monaco.Range(cursorLineNumber, 0, cursorLineNumber, 0), options: { isWholeLine: true, linesDecorationsClassName: "myLineDecoration" }};

      /// note :: Last used highlighting code.
      // this.$refs.refOutputEditor.getEditor().deltaDecorations([], [
      //   { range: new monaco.Range(cursorLineNumber, 0, cursorLineNumber, 0), options: { isWholeLine: true, linesDecorationsClassName: "myLineDecoration" }}
      // ]);
    }
  }
};
