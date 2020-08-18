## 写在最前面（不看也不会少一个亿）

### 最开始的一个小需求

前两天项目中有个小需求：前端下载后台小哥返回的二进制流文件。

起初接到这个需求时，我感觉这很简单啊（虽然我不会，但可以百度啊，，，，）
![表情18](https://user-images.githubusercontent.com/26785201/90368178-4aa3f300-e09c-11ea-9289-054f1be40b8b.jpg)

然后就写出了如下的代码：

```js
let blob = new Blob([res.data]);
let fileName = `Cosen.csv`;
if (window.navigator.msSaveOrOpenBlob) {
  navigator.msSaveBlob(blob, fileName);
} else {
  let link = document.createElement("a");
  let evt = document.createEvent("HTMLEvents");
  evt.initEvent("click", false, false);
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(link.href);
}
```

这一段代码，我大概~~强行~~解释一下：

首先判断`window.navigator.msSaveOrOpenBlob`是为了兼容`IE`（谁要兼容这 xx`IE`！！）

然后非`IE`的通过`URL.createObjectURL()`将`Blob`(`Blob`是啥？不知道？没关系，我下面会具体~~装逼~~讲解的)构建为一个`object URL`对象、指定文件名&文件类型、创建`a`链接模拟点击实现下载，最后通过`URL.revokeObjectURL`释放创建的对象。

功能虽然实现了，但其实我是似懂非懂的～
![表情19](https://user-images.githubusercontent.com/26785201/90368211-55f71e80-e09c-11ea-8815-89f89586ebae.jpg)

### 紧接着 一个不那么简单的需求

没过几天，产品又给我提了一个需求：图片裁剪上传及预览。

虽然听过类似的需求，但自己手写还真的没写过，然后我就开始了网上冲浪时光（各种搜索，，，）。但这次，没有想象中那么简单了～～

网上看到的都是诸如`FileReader`、`canvas`、`ArrayBuffer`、`FormData`、`Blob`这些名词。我彻底懵了，这些平时都只是听过啊，用的也不多啊。经过了一番学习，我发现这些都属于前端二进制的知识范畴，所以在搞业务前，我准备先把涉及到的前端二进制梳理一遍，正所谓：底层基础决定上层建筑嘛 🙈
![表情20](https://user-images.githubusercontent.com/26785201/90368237-614a4a00-e09c-11ea-8e04-080259440948.jpg)

## `FileReader`

`HTML5`定义了`FileReader`作为文件`API`的重要成员用于读取文件，根据`W3C`的定义，`FileReader`接口提供了读取文件的方法和包含读取结果的事件模型。

### 创建实例

```js
var reader = new FileReader();
```

### 方法

| 方法名               | 描述                                                  |
| -------------------- | ----------------------------------------------------- |
| `abort`              | 中止读取操作                                          |
| `readAsArrayBuffer`  | 异步按字节读取文件内容，结果用 `ArrayBuffer` 对象表示 |
| `readAsBinaryString` | 异步按字节读取文件内容，结果为文件的二进制串          |
| `readAsDataURL`      | 异步读取文件内容，结果用 `data:url` 的字符串形式表示  |
| `readAsText`         | 异步按字符读取文件内容，结果用字符串形式表示          |

### 事件

| 事件名        | 描述                           |
| ------------- | ------------------------------ |
| `onabort`     | 中断时触发                     |
| `onerror`     | 出错时触发                     |
| `onload`      | 文件读取成功完成时触发         |
| `onloadend`   | 读取完成触发（无论成功或失败） |
| `onloadstart` | 读取开始时触发                 |
| `onprogress`  | 读取中                         |

### 示例

下面我们尝试把一个文件的内容通过字符串的方式读取出来：

```js
<input type="file" id="upload" />;

document.getElementById("upload").addEventListener(
  "change",
  function (e) {
    var file = this.files[0];
    const reader = new FileReader();
    reader.onload = function () {
      const result = reader.result;
      console.log(result);
    };
    reader.readAsText(file);
  },
  false
);
```

## `ArrayBuffer`/`TypedArray`/`DataView 对象`

### `ArrayBuffer`

先来看下`ArrayBuffer`的功能：
<img width="873" alt="ArrayBuffer功能" src="https://user-images.githubusercontent.com/26785201/90368319-6b6c4880-e09c-11ea-81a7-38e1b104d82e.png">

先来介绍`ArrayBuffer` ,是因为 `FileReader` 有个 `readAsArrayBuffer()`的方法,如果被读的文件是二进制数据,那用这个方法去读应该是最合适的,读出来的数据,就是一个 `Arraybuffer` 对象,来看下定义：

> `ArrayBuffer` 对象用来表示通用的、固定长度的原始二进制数据缓冲区.`ArrayBuffer` 不能直接操作,而是要通过类型数组对象或 `DataView` 对象来操作,它们会将缓冲区中的数据表示为特定的格式,并通过这些格式来读写缓冲区的内容.

`ArrayBuffer`也是一个构造函数，可以分配一段可以存放数据的连续内存区域。

```js
const buffer = new ArrayBuffer(8);
// ArrayBuffer 对象有实例属性 byteLength ，表示当前实例占用的内存字节长度（单位字节）
console.log(buffer.byteLength);
```

由于无法对 `Arraybuffer` 直接进行操作,所以我们需要借助其他对象来操作. 所有就有了 `TypedArray`(类型数组对象)和 `DataView`对象。

### `DataView 对象`

上面代码生成了一段 8 字节的内存区域，每个字节的值默认都是 0。

为了读写这段内容，需要为它指定视图。`DataView`视图的创建，需要提供`ArrayBuffer`对象实例作为参数。

`DataView`视图是一个可以从二进制`ArrayBuffer`对象中读写多种数值类型的底层接口。

- `setint8()` 从`DataView`起始位置以`byte`为计数的指定偏移量（`byteOffset`）处存储一个`8-bit`数（一个字节）
- `getint8()` 从`DataView`起始位置以`byte`为计数的指定偏移量（`byteOffset`）处获取一个`8-bit`数（一个字节）

#### 调用

```js
new DataView(buffer, [, byteOffset [, byteLength]])
```

#### 示例

```js
let buffer = new ArrayBuffer(2);
console.log(buffer.byteLength); // 2
let dataView = new DataView(buffer);
dataView.setInt(0, 1);
dataView.setInt(1, 2);
console.log(dataView.getInt8(0)); // 1
console.log(dataView.getInt8(1)); // 2
console.log(dataView.getInt16(0)); // 258
```

![表情22](https://user-images.githubusercontent.com/26785201/90368372-80e17280-e09c-11ea-8264-624a267bd6b2.jpg)

### `TypedArray`

另一种`TypedArray`视图，与`DataView`视图的一个区别是，它不是一个构造函数，而是一组构造函数，代表不同的数据格式。

`TypedArray`对象描述了一个底层的二进制数据缓存区（`binary data buffer`）的一个类数组视图（`view`）。

但它本身不可以被实例化，甚至无法访问，你可以把它理解为接口，它有很多的实现。

#### 实现方法

| 类型        | 单个元素值的范围 | 大小（bytes） | 描述                  |
| ----------- | ---------------- | ------------- | --------------------- |
| Int8Array   | -128 to 127      | 1             | 8 位二进制有符号整数  |
| Uint8Array  | 0 to 255         | 1             | 8 位无符号整数        |
| Int16Array  | -32768 to 32767  | 2             | 16 位二进制有符号整数 |
| Uint16Array | 0 to 65535       | 2             | 16 位无符号整数       |

#### 示例

```js
const buffer = new ArrayBuffer(8);
console.log(buffer.byteLength); // 8
const int8Array = new Int8Array(buffer);
console.log(int8Array.length); // 8
const int16Array = new Int16Array(buffer);
console.log(int16Array.length); // 4
```

## `Blob`

`Blob`是用来支持文件操作的。简单的说：在`JS`中，有两个构造函数 `File` 和 `Blob`, 而`File`继承了所有`Blob`的属性。

所以在我们看来，`File`对象可以看作一种特殊的`Blob`对象。

上面说了，`File`对象是一种特殊的`Blob`对象，那么它自然就可以直接调用`Blob`对象的方法。让我们看一看`Blob`具体有哪些方法，以及能够用它们实现哪些功能:

<img width="864" alt="Blob" src="https://user-images.githubusercontent.com/26785201/90368420-9191e880-e09c-11ea-9647-61d0a824b960.png">

是的，我们这里更加倾向于实战中的应用～

![表情23](https://user-images.githubusercontent.com/26785201/90368441-9b1b5080-e09c-11ea-91c5-4c8c01e257b4.jpg)

关于`Blob`的更具体介绍可以参考[Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)

## `atob` 和 `btoa`

`base64` 相信大家都不会陌生吧（不知道的看[这里](https://www.baidu.com/)）,最常用的操作可能就是图片转 `base64` 了吧?

在之前要在字符串跟`base64`之间互转,我们可能需要去网上拷一个别人的方法,而且大部分情况下,你没有时间去验证这个方法是不是真的可靠,有没有`bug`。

从`IE10+`浏览器开始，所有浏览器就原生提供了`Base64`编码解码方法。

### Base64 解码

```js
var decodedData = window.atob(encodedData);
```

### Base64 编码

```js
var encodedData = window.btoa(stringToEncode);
```

## `Canvas`中的`ImageData`对象

关于`Canvas`，这里我就不做过多介绍了，具体可参考[canvas 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)

今天主要说一下`Canvas`中的`ImageData`对象（也是为下面的那个图片裁剪的项目做一些基础知识的铺垫～）
![表情16](https://user-images.githubusercontent.com/26785201/90368466-a7071280-e09c-11ea-8d6b-a82c0c0b0287.gif)

`ImageData`对象中存储着`canvas`对象真实的像素数据，它包含以下几个只读属性：

- `width`：图片宽度，单位是像素
- `height`：图片高度，单位是像素
- `data`：`Uint8ClampedArray`类型的一维数组，包含着`RGBA`格式的整型数据，范围在 0 至 255 之间（包括 255）。

### 创建一个`ImageData`对象

使用`createImageData()` 方法去创建一个新的，空白的`ImageData`对象。

```js
var myImageData = ctx.createImageData(width, height);
```

上面代码创建了一个新的具体特定尺寸的`ImageData`对象。所有像素被预设为透明黑。

### 得到场景像素数据

为了获得一个包含画布场景像素数据的`ImageData`对象，你可以用`getImageData()`方法：

```js
var myImageData = ctx.getImageData(left, top, width, height);
```

### 在场景中写入像素数据

你可以用`putImageData()`方法去对场景进行像素数据的写入。

```js
ctx.putImageData(myImageData, dx, dy);
```

### `toDataURL` 将`canvas`转为 `data URI`格式

有如下`<canvas>`元素：

```html
<canvas id="canvas" width="5" height="5"></canvas>
```

可以用下面的方式获取一个`data-URL`

```js
var canvas = document.getElementById("canvas");
var dataURL = canvas.toDataURL();
console.log(dataURL);
// "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNby
// blAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC"
```

到这里，二进制相关的基础知识我已经铺垫完了。下面让我们回到文章开头提到的那个产品的“没那么简单”的新需求：图片裁剪上传及预览。

其实，像`图片裁剪上传`这种社区已经有非常成熟的解决方案了，如[vue-cropper](https://github.com/xyxiao001/vue-cropper)。这里，我选择手写一个简易的图片裁剪的目的是因为这其中用到了上文提及的大量的二进制知识，可以很好的将理论与实践结合。

话不多说，开 Giao！！
![表情17](https://user-images.githubusercontent.com/26785201/90368516-b9814c00-e09c-11ea-8c90-3745463590e4.jpg)

## 需求开发 Giao Giao！

先来看下最终的效果：
![图片裁剪上传](https://user-images.githubusercontent.com/26785201/90368546-c9992b80-e09c-11ea-868b-026bbc7729f0.gif)

这里贴下完成后的[代码地址](https://github.com/Jack-cool/fe_binary)

另外，我用一张图梳理了以上提到的前端二进制模块的关系，这对于下面需求的开发会有很大的帮助：
![前端二进制体系](https://user-images.githubusercontent.com/26785201/90368646-f8170680-e09c-11ea-9ba9-d2920f65c54e.png)

整个需求分以下四步：

1、获取文件并读取文件。

2、获取裁剪坐标。

3、裁剪图片。

4、读取裁剪后的图片预览并上传。

### 获取文件并读取文件

首先来看下上面第一步提到的获取文件。对应就是给`input`绑定的`handleChange`事件：

```js
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
```

`HTML5` 支持从 `input[type=file]` 元素中直接获取文件信息，也可以读取文件内容。

这里就需要用到了 `FileReader` ，这个类是专门用来读取本地文件的。纯文本或者二进制都可以读取，但是本地文件必须是经过用户允许才能读取，也就是说用户要在`input[type=file]`中选择了这个文件，你才能读取到它。

通过 `FileReader` 我们可以将图片文件转化成 `DataURL`，就是以 `data:image/png;base64`开头的一种`URL`,然后可以直接放在 `image.src` 里，这样本地图片就显示出来了。

### 获取裁剪坐标

这里主要是`mousedown`、`mousemove`、`mouseup`事件的结合使用。

#### `mousedown`

鼠标按下事件。这里要记录下鼠标按下时的开始坐标，即`startX`与`startY`，同时要将标志位`startDrag`设为`true`，标识鼠标开始移动。

```js
handleMouseDown = (event) => {
  this.setState({
    startX: event.clientX,
    startY: event.clientY,
    startDrag: true,
  });
};
```

#### `mousemove`

鼠标移动事件。判断`startDrag`为`true`（即鼠标开始移动），然后记录对应移动的距离。

```js
handleMouseMove = (event) => {
  if (this.state.startDrag) {
    this.drawImage(
      event.clientX - this.state.startX + this.state.lastX,
      event.clientY - this.state.startY + this.state.lastY
    );
  }
};
```

#### `mouseup`

鼠标弹起事件。这里要记录下最终鼠标的落点坐标，对应就是`lastX`与`lastY`。

```js
handleMouseUp = (event) => {
  this.setState({
    lastX: event.clientX - this.state.startX + this.state.lastX,
    lastY: event.clientY - this.state.startY + this.state.lastY,
    startDrag: false,
  });
};
```

### 裁剪图片

这个时候我们就需要用到`canvas`了，`canvas`和图片一样，所以新建`canvas`时就要确定其高宽。

将图片放置入`canvas`时需要调用`drawImage`：

```js
drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
```

具体`API`使用参考`MDN`上的[drawImage](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage)

```js
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
```

其中这里面我们还加入了`scale`，这个变量是用来实现图片`放大`、`缩小`效果的。

而且会判断图片的宽、高的大小关系，从而实现图片在`canvas`中对应的适配。

### 读取裁剪后的图片并上传

这时我们要获取`canvas`中图片的信息，用`toDataURL`就可以转换成上面用到的`DataURL`。

```js
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
```

然后取出其中`base64`信息，再用`window.atob`转换成由二进制字符串。但`window.atob`转换后的结果仍然是字符串，直接给`Blob`还是会出错。所以又要用`Uint8Array`转换一下。

这时候裁剪后的文件就储存在`blob`里了,我们可以把它当作是普通文件一样，加入到`FormData`里，并上传至服务器了。

```js
upload = (event) => {
  // console.log("文件url", this.state.avatarDataUrl);
  let bytes = atob(this.state.avatarDataUrl.split(",")[1]);
  console.log("bytes", bytes);
  let arrayBuffer = new ArrayBuffer(bytes.length);
  let uInt8Array = new Uint8Array();
  for (let i = 0; i < bytes.length; i++) {
    uInt8Array[i] = bytes.charCodeAt[i];
  }
  let blob = new Blob([arrayBuffer], { type: "image/png" });
  let xhr = new XMLHttpRequest();
  let formData = new FormData();
  formData.append("avatar", blob);
  xhr.open("POST", "/upload", true);
  xhr.send(formData);
};
```

![表情24](https://user-images.githubusercontent.com/26785201/90368692-0c5b0380-e09d-11ea-9ce0-b9c6eb59db30.jpg)

## 参考

- `https://es6.ruanyifeng.com/#docs/arraybuffer`
- `https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas`

## ❤️ 爱心三连击

1.如果觉得这篇文章还不错，来个<b style="color: #ff6441">分享、点赞、在看</b>三连吧，让更多的人也看到～

2.关注公众号<b style="color: #ff6441">前端森林</b>，定期为你推送新鲜干货好文。

3.特殊阶段，带好口罩，做好个人防护。

4.添加微信<b style="color: #ff6441">fs1263215592</b>，拉你进技术交流群一起学习 🍻
![前端森林公众号二维码2](https://user-images.githubusercontent.com/26785201/90368733-1ed53d00-e09d-11ea-9be5-8c39826d3209.png)
