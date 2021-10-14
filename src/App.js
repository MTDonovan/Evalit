import { app, ipcRenderer, remote } from "electron";
import MonacoEditor from "vue-monaco";
import { E } from "./EvalScript/index";
import * as monaco from "monaco-editor";
const $data = __non_webpack_require__(
  ipcRenderer.sendSync("get-file-path", "data")
);
const $fn = __non_webpack_require__(
  ipcRenderer.sendSync("get-file-path", "functions")
);
import * as path from "path";
import { writeFileSync, readFileSync } from "fs";


export default {
  name: "App",
  components: {
    MonacoEditor
  },
  data() {
    return {
      settingsModalVisible: false,
      counter: 0,
      modalEditorVisible: true,
      outputEditorVisible: true,
      currentTheme: "vs-dark",
      mainEditorOptions: {
        fontSize: 14,
        minimap: {
          enabled: false
        },
        automaticLayout: true
      },
      outputEditorOptions: {
        fontSize: 14,
        readOnly: true,
        minimap: {
          enabled: false
        },
        automaticLayout: true
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

    /**
     * Load the preferred theme. Set to vs-dark if no theme is provided.
     */
    let theme = window.localStorage.getItem("theme");
    if (theme) {
      this.currentTheme = theme;
    }

    /** Focus the main editor. */
    this.waitForDocumentElement("#main-editor", 1500).then(elm => {
      this.$refs.refMainEditor.getEditor().focus();
    });

    this.updateTableWrapperHeight();
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
    },
    saveSettings() {
      this.toggleSettingsModal();
    },
    changeThemeSetting() {
      window.localStorage.setItem("theme", this.currentTheme);
    },
    getPreferredTableWrapperHeight() {
      let headerHeight = document.querySelector(".toolbar-header").clientHeight;
      return window.innerHeight - headerHeight;
    },
    updateTableWrapperHeight() {
      let selector = "#editors-container";
      let headerHeight = document.querySelector(".toolbar-header").clientHeight;
      let footerHeight = document.querySelector(".toolbar-footer").clientHeight;
      this.waitForDocumentElement(selector, 1500).then(() => {
        let calcHeight = window.innerHeight - (headerHeight + footerHeight);
        document
          .querySelector(selector)
          .setAttribute("style", `height: ${calcHeight}px;`);
        document
          .querySelector("#main-editor")
          .setAttribute("style", `height: ${calcHeight}px;`);
        document
          .querySelector("#output-editor")
          .setAttribute("style", `height: ${calcHeight}px;`);
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
    setOutputEditorPosition() {
      this.$refs.refOutputEditor.getEditor().setPosition(this.$refs.refMainEditor.getEditor().getPosition());
    },
    mainEditorDidMount(editor) {
      window.addEventListener("resize", () => editor.layout());
      editor.onDidBlurEditorText(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onDidBlurEditorWidget(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onDidChangeCursorPosition(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onDidChangeCursorSelection(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onDidContentSizeChange(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onDidDispose(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onDidFocusEditorText(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onDidFocusEditorWidget(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onDidLayoutChange(_e => {
        this.updateTableWrapperHeight();
        this.evalEvent();
      });
      editor.onDidPaste(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onKeyDown(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onKeyUp(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onMouseDown(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onMouseLeave(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onMouseMove(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
      });
      editor.onMouseUp(_e => {
        this.evalEvent();
        this.setOutputEditorPosition();
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
    handleHotKeys(event) {
      if (event.srcKey === "eval") {
        this.evalEvent();
        return;
      }
      if (event.srcKey === "keepNotepad") {
        this.saveEvalText();
        return;
      }
      if (event.srcKey === "save") {
        this.saveToFile();
        return;
      }
      if (event.srcKey === "load") {
        this.loadFromFile();
        return;
      }
    },
    saveToFile() {
      let promptAnswer = remote.dialog.showSaveDialogSync({
        title: "Select a file to save the notepad text to",
        buttonLabel: "Save",
        filters: [
          {
            name: "Text Files",
            extensions: ["eval", "txt", "js", "ts", "coffee", "sigma"]
          }
        ],
        properties: []
      });
      writeFileSync(promptAnswer, this.maineditor);
    },
    loadFromFile() {
      let promptAnswer = remote.dialog.showOpenDialogSync({
        title: "Select a file to open in the notepad",
        buttonLabel: "Open",
        filters: [
          {
            name: "Text Files",
            extensions: ["eval", "txt", "js", "ts", "coffee", "sigma"]
          }
        ],
        properties: []
      })[0]

      this.maineditor = readFileSync(promptAnswer, "utf-8");
    },
    secBuild() {
      let sec = new E();
      /**
       * Transform the stack editor text into a template literal. This is required to
       * allow the user to insert JavaScript snippets.
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
    }
  }
};
