/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ 15:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_electron__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__trimDesktop__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__createCaptureWindow__ = __webpack_require__(18);




__WEBPACK_IMPORTED_MODULE_0_electron__["app"].on("ready", () => {
  Object(__WEBPACK_IMPORTED_MODULE_1__trimDesktop__["a" /* default */])().then(({ sourceDisplay, trimmedBounds }) => {
    console.log(sourceDisplay, trimmedBounds);
  });
  // createCaptureWindow();
});

/***/ }),

/***/ 16:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_electron__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_fs__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_fs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_fs__);



function trimDesktop() {
  const displays = __WEBPACK_IMPORTED_MODULE_0_electron__["screen"].getAllDisplays();
  return new Promise((resolve, reject) => {
    const windows = displays.map((display, i) => {
      const { x, y, width, height } = display.bounds;
      display.name = "Screen " + (i + 1);
      const win = new __WEBPACK_IMPORTED_MODULE_0_electron__["BrowserWindow"]({
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        x, y, width, height
      });
      win.loadURL(`file://${__dirname}/../index.html`);
      return { win, display };
    });

    __WEBPACK_IMPORTED_MODULE_0_electron__["ipcMain"].once("SEND_BOUNDS", (e, { trimmedBounds, screen }) => {
      const sourceDisplay = windows.find(w => w.win.webContents.id === e.sender.id).display;
      const profile = { sourceDisplay, trimmedBounds };
      windows.forEach(w => w.win.close());
      console.log(screen);
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = screen.match(regex);
      const ext = matches[1];
      const data = matches[2];
      const buffer = new Buffer(data, 'base64');
      __WEBPACK_IMPORTED_MODULE_1_fs___default.a.writeFileSync('data.' + ext, buffer);
      resolve(profile);
    });
  });
}

/* harmony default export */ __webpack_exports__["a"] = (trimDesktop);

/***/ }),

/***/ 17:
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ 18:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_electron__);


class CaptureWindow {

  constructor() {
    this.win = new __WEBPACK_IMPORTED_MODULE_0_electron__["BrowserWindow"]();
    this.win.loadURL(`file://${__dirname}/../captureWindow.html`);
  }

  capture(clippingProfile) {
    return new Promise((resolve, reject) => {
      __WEBPACK_IMPORTED_MODULE_0_electron__["ipcMain"].once("REPLY_CAPTURE", (_, { error, dataURL }) => {
        if (error) {
          reject(error);
        } else {
          // 画像データ（base64文字列）をNativeImage形式へ変換
          resolve(__WEBPACK_IMPORTED_MODULE_0_electron__["nativeImage"].createFromDataURL(dataURL));
        }
      });
      this.win.webContents.send("CAPTURE", clippingProfile);
    });
  }

  close() {
    this.win.close();
  }
}

function createCaptureWindow() {
  return new CaptureWindow();
}

/* unused harmony default export */ var _unused_webpack_default_export = (createCaptureWindow);

/***/ })

/******/ });
//# sourceMappingURL=main.js.map