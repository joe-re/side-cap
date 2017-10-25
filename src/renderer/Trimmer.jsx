// @flow

import React from "react";
import { ipcRenderer } from "electron";
import styles from "./Trimmer.css";
import { screen, desktopCapturer } from 'electron';

const getCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};


const getStream = sourceId => {
  return new Promise((resolve, reject) => {
    desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
      if(error) {
        reject(error);
        return;
      }

      const display = getDisplay(sourceId);

      navigator.webkitGetUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[0].id,
            maxWidth: display.size.width,
            maxHeight: display.size.height,
            minWidth: 100,
            minHeight: 100
          }
        }
      }, resolve, reject);
    });
  });
};

const getDisplay = id => {
  // return screen.getAllDisplays().find(item => item.id === id);
  console.log(screen.getAllDisplays().length);
  debugger;
  return screen.getAllDisplays()[0];
};

const drawFrame = ({ctx, video, x, y, width, height, availTop = screen.availTop}) => {
  ctx.drawImage(video, x, y, width, height, 0, -availTop, width, height);
};

const getFrameImage = canvas => {
  return canvas.toDataURL();
};

const getVideo = stream => {
  const video = document.createElement('video');
  video.autoplay = true;
  video.src = URL.createObjectURL(stream);
  return new Promise(resolve => {
    video.addEventListener('playing', () => {
      resolve(video);
    });
  });
};

const takeScreenshot = ({x, y, width, height, sourceId}) => {
  const availTop = screen.availTop - getDisplay(sourceId).bounds.y;

  return getStream(sourceId)
    .then(getVideo)
    .then(video => {
      const canvas = getCanvas(width, height);
      const ctx = canvas.getContext('2d');
      debugger;
      drawFrame({ctx, video, x, y, width, height, availTop});
      return getFrameImage(canvas);
    });
};

function position2Bounds({ x1, x2, y1, y2 }){
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width =  Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  return { x, y, width, height };
}

type State = {
  isClipping: boolean,
  clientPosition: Object,
  screenPosition: Object
}
export default class Trimmer extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isClipping: false,
      clientPosition: {},
      screenPosition: {}
    };
  }

  handleOnMouseDown = (e: SyntheticEvent<*>) => {
    const clientPosition = {
      x1: e.clientX, y1: e.clientY,
      x2: e.clientX, y2: e.clientY
    };
    const screenPosition = {
      x1: e.screenX, y1: e.screenY,
      x2: e.screenX, y2: e.screenY
    }
    this.setState({
      isClipping: true,
      clientPosition,
      screenPosition
    });
  }

  // ドラッグ終了時の処理
  handleOnMouseUp = () => {
    this.setState({ isClipping: false });
    // 矩形情報を位置情報へ変換
    const trimmedBounds = position2Bounds(this.state.screenPosition);
    if (trimmedBounds.width > 100 && trimmedBounds.height > 100) {
      // 切り取り対象の位置情報をMainプロセスへ送信
      takeScreenshot({...trimmedBounds, soueceId: 1}).then(screen => {
        ipcRenderer.send("SEND_BOUNDS", { trimmedBounds, screen });
      });
    }
  }

  // ドラッグ操作中の処理
  handelOnMouseMove = (e) => {
    if (!this.state.isClipping) return;
    const clientPosition = this.state.clientPosition;
    clientPosition.x2 = e.clientX;
    clientPosition.y2 = e.clientY;
    const screenPosition = this.state.screenPosition;
    screenPosition.x2 = e.screenX;
    screenPosition.y2 = e.screenY;
    this.setState({ clientPosition, screenPosition });
  }

  // 矩形領域に対する枠線描画処理
  handleOnMouseEnter = (e) => {
    if (!e.buttons) {
      this.setState({ isClipping: false });
    }
  }

  renderRect() {
    const bounds = position2Bounds(this.state.clientPosition);
    const inlineStyle = {
      left:   bounds.x,
      top:    bounds.y,
      width:  bounds.width,
      height: bounds.height
    };
    return <div className={styles.rect} style={inlineStyle} />;
  }

  render() {
    return (
      <div className={styles.root}
        onMouseDown={this.handleOnMouseDown}
        onMouseUp={this.handleOnMouseUp}
        onMouseMove={this.handelOnMouseMove}
        onMouseEnter={this.handleOnMouseEnter}
      >
        { this.state.isClipping ? this.renderRect() : <div />}
      </div>
    );
  }
}
