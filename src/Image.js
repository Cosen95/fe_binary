import React from "react";
import styles from "./Image.css";
console.log(styles);
export default class Image extends React.Component {
  imageRef = React.createRef();
  canvasRef = React.createRef();
  avatarRef = React.createRef();
  state = {
    file: null, // 选中的文件
    dataURL: "", // 选中的文件的原始的base64字符串
    times: 1, // 放大倍数
    startX: 0, // 鼠标按下时的x坐标
    startY: 0, // 鼠标按下时的y坐标
    startDrag: false, // 是否在拖拽过程中
    lastX: 0, // 上一次最后的x坐标
    lastY: 0, // 上一次最后的y坐标
    avatarDataUrl: "",
  };

  handleChange = (event) => {
    let file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (event) => {
      this.setState({
        file,
        dataURL: event.target.result,
      });
      this.imageRef.current.onload = () => this.drawImage();
    };
    fileReader.readAsDataURL(file);
  };
  bigger = () => {
    this.setState(
      {
        times: this.state.times + 0.1,
      },
      () => this.drawImage()
    );
  };
  smaller = () => {
    this.setState(
      {
        times: this.state.times - 0.1,
      },
      () => this.drawImage()
    );
  };
  confirm = () => {
    let canvas = this.canvasRef.current;
    let ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(100, 100, 100, 100);
    let avatarCanvas = document.createElement("canvas");
    avatarCanvas.width = 100;
    avatarCanvas.height = 100;
    let avatarCtx = avatarCanvas.getContext("2d");
    avatarCtx.putImageData(imageData, 0, 0);
    let avatarDataUrl = avatarCanvas.toDataURL();
    this.setState({ avatarDataUrl });
    this.avatarRef.current.src = avatarDataUrl;
  };
  handleMouseDown = (event) => {
    this.setState({
      startX: event.clientX,
      startY: event.clientY,
      startDrag: true,
    });
  };
  handleMouseMove = (event) => {
    if (this.state.startDrag) {
      this.drawImage(
        event.clientX - this.state.startX + this.state.lastX,
        event.clientY - this.state.startY + this.state.lastY
      );
    }
  };
  handleMouseUp = (event) => {
    this.setState({
      lastX: event.clientX - this.state.startX + this.state.lastX,
      lastY: event.clientY - this.state.startY + this.state.lastY,
      startDrag: false,
    });
  };
  drawImage = (left = this.state.lastX, top = this.state.lastY) => {
    let image = this.imageRef.current;
    let canvas = this.canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let imageWidth = image.width;
    let imageHeight = image.height;
    if (imageWidth > imageHeight) {
      let scale = canvas.width / canvas.height;
      imageWidth = canvas.width * this.state.times;
      imageHeight = imageHeight * scale * this.state.times;
    } else {
      let scale = canvas.height / canvas.width;
      imageHeight = canvas.height * this.state.times;
      imageWidth = imageWidth * scale * this.state.times;
    }
    ctx.drawImage(
      image,
      (canvas.width - imageWidth) / 2 + left,
      (canvas.height - imageHeight) / 2 + top,
      imageWidth,
      imageHeight
    );
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div>
            <input type="file" accept="image/*" onChange={this.handleChange} />
          </div>
        </div>
        <div className={styles.row}>
          <div>
            {this.state.file && (
              <img
                src={this.state.dataURL}
                alt=""
                ref={this.imageRef}
                style={{ border: "2px dashed green " }}
              />
            )}
          </div>

          <div
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
          >
            {this.state.file && (
              <>
                <div style={{ position: "relative" }}>
                  <canvas
                    ref={this.canvasRef}
                    width="300px"
                    height="300px"
                    style={{ border: "2px dashed blue" }}
                  ></canvas>
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      backgroundColor: "blue",
                      opacity: 0.3,
                      position: "absolute",
                      left: 100,
                      top: 100,
                    }}
                  ></div>
                </div>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.bigger}
                  >
                    变大
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.smaller}
                  >
                    变小
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.confirm}
                  >
                    剪切
                  </button>
                </div>
              </>
            )}
          </div>
          <div>
            {this.state.file && (
              <img
                ref={this.avatarRef}
                style={{ border: "2px solid pink" }}
                alt=""
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
