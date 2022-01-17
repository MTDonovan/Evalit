<template>
<div
  id="app"
  v-shortkey="{
              eval: ['alt', 'enter'],
              keepNotepad: ['ctrl', 'shift', 's'],
              save: ['ctrl', 's'],
              load: ['ctrl', 'o']
              }"
  @shortkey="handleHotKeys($event)"
  >
  <header class="toolbar toolbar-header" :style="headerStyle">
    <div class="btn-group pull-left">
      <button
        id="reload-btn"
        class="btn btn-default btn-with-text"
        @click="reloadEvent()"
        :style="btnStyle"
        >
        <span class="icon icon-ccw" :style="btnIconStyle"></span>
        <span :style="btnIconStyle">Reload</span>
      </button>
      <button
        id="save-btn"
        class="btn btn-default btn-with-text"
        @click="saveEvalText()"
        :style="btnStyle"
        >
        <span class="icon icon-pencil" :style="btnIconStyle"></span>
        <span :style="btnIconStyle">Keep Notepad</span>
      </button>
      <button
        id="settings-btn"
        class="btn btn-default btn-with-text"
        @click="toggleSettingsModal()"
        :style="btnStyle"
        >
        <span class="icon icon-popup" :style="btnIconStyle"></span>
        <span :style="btnIconStyle">Settings</span>
      </button>
    </div>
    <div class="btn-group pull-left file-path-header-label">
      <span class="header-label" :style="headerLabelStyle" :title="openFileName">{{ openFileNameDisplay }}</span>
    </div>
    <div class="btn-group pull-right">
      <button
        id="save-file-btn"
        class="btn btn-default btn-with-text"
        @click="saveToFile()"
        :style="btnStyle"
      ><span class="icon icon-floppy" :style="btnIconStyle"></span>
      <span :style="btnIconStyle">Save</span>
      </button>
      <button
        id="save-file-btn"
        class="btn btn-default btn-with-text"
        @click="saveToFileAs()"
        :style="btnStyle"
        ><span class="icon icon-book" :style="btnIconStyle"></span>
      <span :style="btnIconStyle">Save As</span>
      </button>
      <button
        id="load-file-btn"
        class="btn btn-default btn-with-text"
        @click="loadFromFile()"
        :style="btnStyle"
      ><span class="icon icon-folder" :style="btnIconStyle"></span>
      <span :style="btnIconStyle">Load</span>
      </button>
      <button
        id="clear-file-btn"
        class="btn btn-default btn-with-text"
        @click="clearOpenFileData()"
        :style="btnStyle"
        >
        <span class="icon icon-cancel-circled" :style="btnIconStyle"></span>
        <span :style="btnIconStyle">Close File</span>
      </button>
    </div>
  </header>

    <!-- Settings modal -->
    <div
      class="crude-modal"
      :style="settingsModalVisible ? '' : 'display: none;'"
    >
      <div class="crude-modal-body form-modal" :style="settingsModalBodyStyle">
        <form>
          <h3>Settings</h3>
          <div class="form-group">
            <label :style="settingsLabelColour">Evalit app data path</label>
            <div class="form-group-wrapper">
              <input
                readonly
                v-model="appdataPath"
                class="form-control"
                :style="settingsInputStyle"
                type="text"
              />
            </div>
          </div>
          <div class="form-group">
            <label :style="settingsLabelColour">User defined data file path</label>
            <div class="form-group-wrapper">
              <input
                id="data-file-path"
                readonly
                v-model="dataFilePath"
                class="form-control"
                :style="settingsInputStyle"
                type="text"
              />
            </div>
          </div>
          <div class="form-group">
            <label :style="settingsLabelColour">User defined functions file path</label>
            <div class="form-group-wrapper">
              <input
                id="functions-file-path"
                readonly
                v-model="functionsFilePath"
                class="form-control"
                :style="settingsInputStyle"
                type="text"
              />
            </div>
          </div>
        </form>
      </div>
      <div class="btn-group pull-right">
        <button
          class="btn btn-default"
          :style="btnStyle"
          @click="toggleSettingsModal"
        >
          Close
        </button>
      </div>
    </div>

    <!-- Models editor modal -->
    <div
      class="crude-modal"
      :style="modalEditorVisible ? '' : 'display: none;'"
    >
      <div class="crude-modal-body form-modal'">
        <div class="modal-editor-container">
          <monaco-editor
            v-model="modaleditor"
            language="javascript"
            :theme="currentTheme"
            :options="mainEditorOptions"
            ref="refModalEditor"
          ></monaco-editor>
        </div>
      </div>
      <div class="btn-group pull-right">
        <button class="btn btn-default" @click="modalEditorVisible = false">
          Close
        </button>
      </div>
      <div class="btn-group pull-right">
        <button class="btn btn-default" @click="updateData()">Update</button>
      </div>
    </div>

    <div id="editors-container" class="multi-editor-container" :style="editorsContinerStyle">
      <!-- File tree navigator -->
      <nav class="nav-group file-tree-view" :style="fileTreeViewStyle">
        <h5 class="nav-group-title" :style="navGroupTitleStyle">Open Directory</h5>
        <a class="nav-group-item" :title="evalScriptDirectory" @click="openScriptDirectory" :style="navGroupItemStyle">
          <span class="icon icon-list">
            </span>{{ evalScriptDirectory ? evalScriptDirectoryDisplayName : "Click here" }}</a>
        <h5 class="nav-group-title" :style="navGroupTitleStyle">EvalScripts</h5>

        <div v-if="evalScriptsInDirectory.length > 0" class="files-in-tree-container">
          <a v-for="(v, k) in evalScriptsInDirectory"
              :key="k"
              :value="v"
              :title="v"
              @click="loadFromTreeFile(v, $event)"
              :class="['nav-group-item', activeFileTitle === v ? 'active' : '']"
              :style="navGroupItemStyle"
            ><span class="icon icon-doc-text"></span>{{ v }}</a>
        </div>
        <div v-else>
          <a class="nav-group-item"
            ><span></span><i>No files to display</i></a>
        </div>
      </nav>
      <!-- Editors -->
      <monaco-editor
        id="main-editor"
        v-model="maineditor"
        language="javascript"
        :theme="currentTheme"
        :options="mainEditorOptions"
        @editorDidMount="mainEditorDidMount"
        ref="refMainEditor"
        :style="mainEditorStyle"
      ></monaco-editor>
      <monaco-editor
        v-model="output"
        language="javascript"
        :theme="currentTheme"
        :options="outputEditorOptions"
        @editorDidMount="outputEditorDidMount"
        ref="refOutputEditor"
        :style="outputEditorStyle"
      ></monaco-editor>
    </div>
    <footer class="toobar toolbar-footer" :style="footerStyle">
      <div class="toolbar-actions">
        <div class="btn-group pull-left footer-left-wrapper">
          <span class="footer-label" :style="footerLabelStyle">Theme</span>
          <select
            v-model="currentTheme"
            class="form-control theme-text"
            :style="selectStyle"
            @click="changeThemeSetting()"
          >
            <option
              class="theme-text"
              v-for="(v, k) in themeOptions"
              :key="k"
              :value="v"
              :style="optionStyle"
              >{{ v.split("-")[1] }}</option
            >
          </select>
        </div>
        <div class="btn-group pull-right">
          <span class="footer-label" :style="footerLabelStyle">Average</span>
          <input
            v-model="average"
            class="toolbar-input"
            type="text"
            :style="toolbarStyle"
          />
          <span class="footer-label" :style="footerLabelStyle">Count</span>
          <input
            v-model="count"
            class="toolbar-input"
            type="text"
            :style="toolbarStyle"
          />
          <span class="footer-label" :style="footerLabelStyle">Sum</span>
          <input
            v-model="sr"
            class="toolbar-input"
            type="text"
            :style="toolbarStyle"
          />
        </div>
      </div>
    </footer>
  </div>
</template>

<script type="text/javascript" src="./App.js"></script>
<style>
@import url("style/photon/css/photon.css");
@import url("style/style.css");
</style>
