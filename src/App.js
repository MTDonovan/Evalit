import { app, ipcRenderer, remote } from "electron";
import MonacoEditor from "vue-monaco";
import { E } from "./EvalScript/index";
import * as monaco from "monaco-editor";
try {
  const $data = __non_webpack_require__(ipcRenderer.sendSync("get-file-path", "data"));
} catch (err) {
  alert(`Unable to load module from user.defined.data.js as the following error occurred:\n\n${err}\n\nThis error needs to be resolved to run Evalit`);
}
const $data = __non_webpack_require__(ipcRenderer.sendSync("get-file-path", "data"));
try {
  const $fn = __non_webpack_require__(ipcRenderer.sendSync("get-file-path", "functions"));
} catch (err) {
  alert(`Unable to load module from user.defined.functions.js as the following error occurred:\n\n${err}\n\nThis error needs to be resolved to run Evalit`);
}
const $fn = __non_webpack_require__(ipcRenderer.sendSync("get-file-path", "functions"));
import * as path from "path";
import { writeFileSync, readFileSync, readdirSync } from "fs";


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
      functionsFilePath: "",
      openedFile: null,
      openFileName: null,
      openFileNameDisplay: null,
      evalScriptDirectory: null,
      evalScriptsInDirectory: [],
      activeFileTitle: null,
      runningEditorHeight: null
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
    /**
     * Load the previous saved directory if it exists in the localstorage. The
     * "updateFilePathData" method will be run if the file path details are
     * loaded from the localstorage
     */
    if (localStorage.getItem("evalScriptDirectory")) {
      this.evalScriptDirectory = localStorage.getItem("evalScriptDirectory");
      this.updateVisibleFilesInTree();
    }
    /**
     * Load the previously saved open file path and name if they both exist in the
     * localstorage.
     */
    if (localStorage.getItem("openFilePath") && localStorage.getItem("openFileName")) {
      this.openFilePath = localStorage.getItem("openFilePath");
      this.openFileName = localStorage.getItem("openFileName");
      this.updateFilePathData(this.openFileName);
      this.evalEvent();
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
          "color": "inherit",
          "background-image": "linear-gradient(to bottom,#e8e6e8 0,#d1cfd1 100%)",
          "background-color": "#e8e6e8",
          "border": "1px solid #c2c0c2"
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
          "color": "#333",
          "background-image": "linear-gradient(to bottom, #fcfcfc 0%, #f1f1f1 100%)",
          "border": "1px solid transparent",
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
          "color": "inherit",
          "background-image": "linear-gradient(to bottom, #fcfcfc 0%, #f1f1f1 100%)",
          "border": "1px solid #ddd",
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
          "color": "inherit",
          "background-image": "linear-gradient(to bottom, #fcfcfc 0%, #f1f1f1 100%)",
          "background-color": "#fff"
        };
      } else {
        return {};
      }
    },
    editorsContinerStyle() {
      return {
        "height": `${this.runningEditorHeight - 4}px`
      };
    },
    mainEditorStyle() {
      return {
        "height": `${this.runningEditorHeight - 4}px`
      };
    },
    outputEditorStyle() {
      return {
        "height": `${this.runningEditorHeight - 4}px`
      };
    },
    fileTreeViewStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          "background-color": "#fcfcfc",
          "border-right": "1px solid rgb(194, 192, 194)",
          "height": `${this.runningEditorHeight}px`
        };
      } else {
        return {
          "background-color": "#2b2b2a",
          "border-right":" 1px solid #262424",
          "height": `${this.runningEditorHeight}px`
        };
      }
    },
    navGroupTitleStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          "color": "#262424",
        };
      } else {
        return {};
      }
    },
    navGroupItemStyle() {
      if (this.currentTheme === "vs-light") {
        return {
          "color": "#262424",
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
      let headerHeight = document.querySelector(".toolbar-header").clientHeight;
      let footerHeight = document.querySelector(".toolbar-footer").clientHeight;
      this.waitForDocumentElement("#editors-container", 1500).then(() => {
        this.runningEditorHeight = window.innerHeight - (headerHeight + footerHeight);
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
      // editor.onMouseDown(_e => {
      //   this.evalEvent();
      //   this.setOutputEditorPosition();
      // });
      // editor.onMouseLeave(_e => {
      //   this.evalEvent();
      //   this.setOutputEditorPosition();
      // });
      // editor.onMouseMove(_e => {
      //   this.evalEvent();
      //   this.setOutputEditorPosition();
      // });
      // editor.onMouseUp(_e => {
      //   this.evalEvent();
      //   this.setOutputEditorPosition();
      // });
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
        this.saveEvalText();
        return;
      }
      if (event.srcKey === "load") {
        this.loadFromFile();
        return;
      }
    },
    updateFilePathData(promptAnswer) {
      this.openFilePath = promptAnswer.replace(/\\/g, "/");
      let arr = this.openFilePath.split("/");
      this.openFileName = arr[arr.length - 1];
      if (this.openFileName.length > 31) {
        this.openFileNameDisplay = this.openFileName.substring(0, 31) + "...";
      } else {
        this.openFileNameDisplay = this.openFileName;
      }
      /**
       * Update the active file name with the loaded file.
       */
      this.activeFileTitle = this.openFileName;
    },
    updateDirectoryPathData(path) {
      this.activeFileTitle = this.openFileName;
    },
    saveToFile() {
      /** In the case a file has already been opened, save to the opened file. */
      if (this.openFilePath) {
        writeFileSync(this.openFilePath, this.maineditor);
        return;
      }
      this.saveToFileAs();
    },
    saveToFileAs() {
      let promptAnswer = remote.dialog.showSaveDialogSync({
        title: "Select a file to save the notepad text to",
        buttonLabel: "Save",
        filters: [
          {
            name: "Text Files",
            extensions: ["eval", "txt"]
          }
        ],
        properties: []
      });
      writeFileSync(promptAnswer, this.maineditor);
      this.updateFilePathData(promptAnswer);
      this.saveEvalText();
      this.setOpenFileDataInLocalStorage();
      this.updateVisibleFilesInTree();
    },
    openScriptDirectory() {
      let promptAnswer = remote.dialog.showOpenDialogSync({
        title: "Select a directory to open in the EvalScript file tree",
        buttonLabel: "Open",
        properties: [
          "openDirectory"
        ]
      })[0]
      /**
       * Update the directory name.
       */
      this.evalScriptDirectory = promptAnswer.replace(/\\/g, "/");
      /**
       * Do the following things when the directory is selected:
       * - Update the active app data fields to return the correct directory name and EvalScript files.
       * - Update the require fields in the localstorage (so that the directory settings can be loaded when the app is loaded).
       */
      this.updateVisibleFilesInTree();
      this.setOpenDirectoryInLocalStorage();
    },
    updateVisibleFilesInTree() {
      if (this.evalScriptsInDirectory) {
        this.evalScriptsInDirectory = readdirSync(this.evalScriptDirectory).filter(file => {
          /**
           * Only return files with applicable file extensions.
           * This also exludes sub-directories.
           */
          switch (path.extname(file)) {
            case ".eval":
            case ".txt":
              return file;
          }
        });
      }
    },
    loadFromTreeFile(file, event) {
      this.activeFileTitle = event.target.title;
      this.loadFromFile(file);
      this.updateVisibleFilesInTree();
    },
    /**
     * 
     * @param {script} file Optional file name parameter. If it's not provided, the user will be required to select a file in the OS file explorer.
     */
    loadFromFile(file) {
      let promptAnswer;
      if (file) {
        promptAnswer = `${this.evalScriptDirectory}/${file}`;
      } else {
        promptAnswer = remote.dialog.showOpenDialogSync({
          title: "Select a file to open in the notepad",
          buttonLabel: "Open",
          filters: [
            {
              name: "Text Files",
              extensions: ["eval", "txt"]
            }
          ],
          properties: []
        })[0]
      }
      this.updateFilePathData(promptAnswer);
      /**
       * Return an error in the case the clicked file does not exist.
       */
      try {
        this.maineditor = readFileSync(promptAnswer, "utf-8");
        this.saveEvalText();
        this.setOpenFileDataInLocalStorage();
      } catch(err) {
        alert(`File could not be opened due to the following error:\n\t${err}`);
      }
      this.updateVisibleFilesInTree();
    },
    /**
     * Close/disconnect the currently opened file.
     */
    clearOpenFileData() {
      localStorage.removeItem("openFilePath");
      localStorage.removeItem("openFileName");
      this.openFilePath        = null;
      this.openFileName        = null;
      this.openFileNameDisplay = null;
      this.activeFileTitle     = null;
    },
    /**
     * When a file is opened or "Saved As", save the file path and name to the
     * localstorage so that it can be loaded when the app is launched.
     */
    setOpenFileDataInLocalStorage() {
      window.localStorage.setItem("openFilePath", this.openFilePath);
      window.localStorage.setItem("openFileName", this.openFileName);
    },
    setOpenDirectoryInLocalStorage() {
      window.localStorage.setItem("evalScriptDirectory", this.evalScriptDirectory);
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
        document.querySelector("body").clientHeight - document.querySelector("header").clientHeight
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
