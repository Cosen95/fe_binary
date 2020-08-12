### ArrayBuffer

- `ArrayBuffer`对象用来表示通用的、固定长度的原始二进制数据缓冲区
- 它是一个字节数组，通常在其他语言中称为`byte array`
- 你不能直接操作`ArrayBuffer`的内容。而是要通过`类型数组对象`或`DataView`对象来操作，它们会将缓冲区中的数据表示为特定的格式，并通过这些格式来读取内容。

```js
const buffer = new ArrayBuffer(8);
console.log(buffer.byteLength);
```

### TypedArray

`TypedArray`对象描述了一个底层的二进制数据缓存区（`binary data buffer`）的一个类数组视图（`view`）。

但它本身不可以被实例化，甚至无法访问，你可以把它理解为接口，它有很多的实现。

| 类型        | 单个元素值的范围 | 大小（bytes） | 描述                  |
| ----------- | ---------------- | ------------- | --------------------- |
| Int8Array   | -128 to 127      | 1             | 8 位二进制有符号整数  |
| Uint8Array  | 0 to 255         | 1             | 8 位无符号整数        |
| Int16Array  | -32768 to 32767  | 2             | 16 位二进制有符号整数 |
| Uint16Array | 0 to 65535       | 2             | 16 位无符号整数       |

```js
const buffer = new ArrayBuffer(8);
console.log(buffer.byteLength); // 8
const int8Array = new Int8Array(buffer);
console.log(int8Array.length); // 8
const int16Array = new Int16Array(buffer);
console.log(int16Array.length); // 4
```

### DataView 对象

`DataView`视图是一个可以从二进制`ArrayBuffer`对象中读写多种数值类型的底层接口

- `setint8()` 从`DataView`起始位置以`byte`为计数的指定偏移量（`byteOffset`）处存储一个`8-bit`数（一个字节）
- `getint8()` 从`DataView`起始位置以`byte`为计数的指定偏移量（`byteOffset`）处获取一个`8-bit`数（一个字节）

```js
new DataView(buffer, [, byteOffset [, byteLength]])
```

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

### Blob

- `Blob`对象表示一个不可变、原始数据的类文件对象。`Blob`表示的不一定是`JavaScript`原生格式的数据。`File`接口基于`Blob`
- `Blob()`构造函数返回一个新的`Blob`对象。`blob`的内容由参数数组中给出的值串联组成
- `FileReader`对象允许`Web`应用程序异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容，使用`File`或`Blob`对象指定要读取的文件或数据
  - `readAsText`：读取文本文件（可以使用`txt`打开的文件），返回文本字符串，默认编码是`UTF-8`
  - `readAsDataURL`：读取文件获取一段以`data`开头的字符串，这段字符串的本质就是`DataURL`，`DataURL`是一种将文件嵌入到文档的方案。`DataURL`是将资源转化为`base64`编码的字符串形式，并且将这些内容直接储存在`url`中
- 构造函数：var blob = new Blob(array, options)
  - `array`是一个由`ArrayBuffer`、`ArrayBufferView`、`Blob`、`DOMString`等对象构成的`Array`，或者其他类似对象的混合体，它将会被放进`Blob`。`DOMString`会被编码为`UTF-8`
  - `options`是一个可选的参数
    - `type`：默认值“”。它代表了将会被放入到`blob`中的数组内容的`MIME`类型。

```js
let obj = { name: 'senlin' }；
let str = JSON.stringify(obj)
let blob = new Blob([str], {type: 'application/json'})
function readBlob(blob, type) {
  return new Promise(function (resolve, reject) {
    let reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target.result);
    };
    switch(type) {
      case 'ArrayBuffer':
        reader.readAsArrayBuffer(blob)
        break;
      case 'DataURL':
        reader.readAsDataURL(blob)
        break;
      case 'Text:
        reader.readAsText(blob);
        break;
      default:
        break;
    }
  });
}
```

### Object URL

- 可以使用浏览器新的 API URL 对象通过方法生成一个地址来表示`Blob`数据（格式为：`blob:<origin>/<uuid>`）

* `URL.createObjectURL`静态方法会创建一个`DOM String`，其中包含一个表示参数中给出的对象的`URL`。这个`URL`的生命周期和创建它的窗口中的`document`绑定。`URL`对象表示指定的`File`对象或`Blob`对象
* `revokeObjectURL`静态方法用来释放一个之前已经存在的、通过调用`URL.createObjectURL()`创建的`URL`对象

```js
function download() {
  let obj = { name: 'senlin' }；
  let str = JSON.stringify(obj)
  let blob = new Blob([str], {type: 'application/json'})
  let link = document.createElement("a");
  let fileName = '下载.json'
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
