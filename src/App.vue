<template>
  <!-- <div id="app" v-shortkey="{ -->
  <!--                           eval: ['alt', 'enter'], -->
  <!--                           openConsole: ['alt', 'x'], -->
  <!--                           }" @shortkey="handleHotKeys($event)"> -->
  <div
    id="app"
    v-shortkey="{
      eval: ['alt', 'enter']
    }"
    @shortkey="handleHotKeys($event)"
  >
    <header class="toolbar toolbar-header" :style="headerStyle">
      <div class="btn-group pull-left">
        <button
          id="eval-btn"
          class="btn btn-default btn-with-text"
          @click="evalEvent()"
          :style="btnStyle"
        >
          <span class="icon icon-right-dir" :style="btnIconStyle"></span
          ><span :style="btnIconStyle">Eval</span>
        </button>
        <button
          id="reload-btn"
          class="btn btn-default btn-with-text"
          @click="reloadEvent()"
          :style="btnStyle"
        >
          <span class="icon icon-ccw" :style="btnIconStyle"></span
          ><span :style="btnIconStyle">Reload</span>
        </button>
        <!-- <button id="quake-btn" class="btn btn-default btn-with-text" @click="openQuakeConsole()" :style="btnStyle"> -->
        <!--   <span class="icon icon-right-open-mini" :style="btnIconStyle"></span><span :style="btnIconStyle">Console</span> -->
        <!-- </button> -->
        <button
          id="save-btn"
          class="btn btn-default"
          @click="saveEvalText()"
          :style="btnStyle"
        >
          <span class="icon" :style="btnIconStyle"></span
          ><span :style="btnIconStyle">Save</span>
        </button>
        <button
          id="settings-btn"
          class="btn btn-default btn-with-text"
          @click="toggleSettingsModal()"
          :style="btnStyle"
        >
          <span class="icon icon-popup" :style="btnIconStyle"></span
          ><span :style="btnIconStyle">Settings</span>
        </button>
      </div>
      <!-- <div class="btn-group pull-right" style="display: grid;grid-template-columns: auto auto;"> -->
      <!--   <\!-- <button class="btn btn-default btn-with-text"> -\-> -->
      <!--   <\!--   <span @click="outputEditorVisible = !outputEditorVisible">Table</span> -\-> -->
      <!--   <\!-- </button> -\-> -->
      <!--   <div style="display: inline-block;"> -->
      <!--     <span class="header-label" :style="headerLabelStyle">Sum</span> -->
      <!--     <input v-model="sr" class="toolbar-input" type="text" :style="toolbarStyle"> -->
      <!--   </div> -->
      <!-- </div> -->
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
            <label :style="settingsLabelColour">App data path</label>
            <div class="form-group-wrapper">
<<<<<<< HEAD
              <input
                readonly
                v-model="appdataPath"
                class="form-control"
                :style="settingsInputStyle"
                type="text"
              />
              <button
                class="btn btn-default btn-with-text"
                :style="btnStyle"
                @click="openAppDataFolder()"
              >
                <span class="icon icon-folder" :style="btnIconStyle"></span
                ><span :style="btnIconStyle">Open folder</span>
              </button>
=======
              <input readonly v-model="appdataPath" class="form-control" :style="settingsInputStyle" type="text"/>
              <!-- <button class="btn btn-default btn-with-text" :style="btnStyle" @click="openAppDataFolder()">
                   <span class="icon icon-folder" :style="btnIconStyle"></span><span :style="btnIconStyle">Open folder</span>
                   </button> -->
>>>>>>> 514bd39fe501e24d5845c6d926ab8b080403e2ea
            </div>
          </div>
          <div class="form-group">
            <label :style="settingsLabelColour">Data file path</label>
            <div class="form-group-wrapper">
<<<<<<< HEAD
              <input
                readonly
                v-model="dataFilePath"
                class="form-control"
                :style="settingsInputStyle"
                type="text"
              />
              <button
                class="btn btn-default btn-with-text"
                :style="btnStyle"
                @click="openDataFile()"
              >
                <span class="icon icon-code" :style="btnIconStyle"></span
                ><span :style="btnIconStyle">Open data file</span>
              </button>
=======
              <input readonly v-model="dataFilePath" class="form-control" :style="settingsInputStyle" type="text"/>
              <!-- <button class="btn btn-default btn-with-text" :style="btnStyle" @click="openDataFile()">
                   <span class="icon icon-code" :style="btnIconStyle"></span><span :style="btnIconStyle">Open data file</span>
                   </button> -->
>>>>>>> 514bd39fe501e24d5845c6d926ab8b080403e2ea
            </div>
          </div>
          <div class="form-group">
            <label :style="settingsLabelColour">Functions file path</label>
            <div class="form-group-wrapper">
<<<<<<< HEAD
              <input
                readonly
                v-model="functionsFilePath"
                class="form-control"
                :style="settingsInputStyle"
                type="text"
              />
              <button
                class="btn btn-default btn-with-text"
                :style="btnStyle"
                @click="openFunctionsFile()"
              >
                <span class="icon icon-code" :style="btnIconStyle"></span
                ><span :style="btnIconStyle">Open functions file</span>
              </button>
=======
              <input readonly v-model="functionsFilePath" class="form-control" :style="settingsInputStyle" type="text"/>
              <!-- <button class="btn btn-default btn-with-text" :style="btnStyle" @click="openFunctionsFile()">
                   <span class="icon icon-code" :style="btnIconStyle"></span><span :style="btnIconStyle">Open functions file</span>
                   </button> -->
>>>>>>> 514bd39fe501e24d5845c6d926ab8b080403e2ea
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
      <!-- <div class="btn-group pull-right"> -->
      <!--   <button class="btn btn-default" @click="saveSettings()">Save</button> -->
      <!-- </div> -->
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

    <!-- <div class="quake-console" :style="displayQuakeConsole"> -->
    <!--   <div class="console-lines-container"> -->
    <!--     <p class="console-line" v-for="(v, k) in previousConsoleLines" :key="k">{{ v }}</p> -->
    <!--   </div> -->
    <!-- </div> -->
    <!-- <input -->
    <!--   class="quake-console-input input" -->
    <!--   :style="displayQuakeConsole" -->
    <!--   v-model="consoleCommand" -->
    <!--   @keypress.enter="runConsoleCommand()" -->
    <!--   type="text" -->
    <!--   value="" -->
    <!--   spellcheck="false" -->
    <!--   /> -->
    <!-- <div class="autocomplete-results-container" :style="displayQuakeConsole"> -->
    <!--   <ul class="autocomplete-results-body"> -->
    <!--     <li -->
    <!--       v-for="(v, k) in commandsList" -->
    <!--       :key="k" -->
    <!--       :tabindex="(k + 1)" -->
    <!--       > -->
    <!--       <span><label>{{ v }}</label></span> -->
    <!--     </li> -->
    <!--   </ul> -->
    <!-- </div> -->
    <div id="editors-container" class="multi-editor-container">
      <monaco-editor
        v-model="maineditor"
        language="javascript"
        :theme="currentTheme"
        :options="mainEditorOptions"
        @editorDidMount="mainEditorDidMount"
        ref="refMainEditor"
      ></monaco-editor>
      <monaco-editor
        v-model="output"
        language="javascript"
        :theme="currentTheme"
        :options="outputEditorOptions"
        @editorDidMount="outputEditorDidMount"
        ref="refOutputEditor"
        :style="outputEditorVisible ? '' : 'display: none;'"
      ></monaco-editor>
      <div
        id="post-exec-table-container"
        :style="outputEditorVisible ? 'display: none;' : ''"
      >
        <table class="table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Expression</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <PostExecInputs v-for="(v, k) in 12" :key="k" />
          </tbody>
        </table>
      </div>
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
