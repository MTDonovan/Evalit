import { ipcRenderer } from "electron";
/** Attempt to import the user defined functions. */
try {
  const UDFs = __non_webpack_require__(ipcRenderer.sendSync("get-file-path", "functions"));
} catch (err) {
  alert(`Unable to load functions from user.defined.functions.js as the following error occurred:\n\n${err}\n\nThis error needs to be resolved to run Evalit`);
}
const UDFs = __non_webpack_require__(ipcRenderer.sendSync("get-file-path", "functions"));

export { UDFs }
