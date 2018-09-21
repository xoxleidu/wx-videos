/* 裁剪封面， 
src为本地图片路径或临时文件路径， 
imgW为原图宽度， 
imgH为原图高度， 
cId画布的canvas-id
ext裁剪后的图片扩展名
cb为裁剪成功后的回调函数 */

function clipImage (cId, src, ext, imgW, imgH, cb) {

  // ‘canvas’为前面创建的canvas标签的canvas-id属性值
  var ctx = wx.createCanvasContext(cId);
  var canvasW = imgW;
  var canvasH = imgH;

  if (imgW / imgH > 5 / 4) {
    // 长宽比大于5:4
    canvasW = imgH * 5 / 4;
  }

  // 将图片绘制到画布
  //按高度比例缩放
  ctx.drawImage(src, (imgW - canvasW) / 2, 0, canvasW, canvasH)
  //按高度比例裁剪
  //ctx.drawImage(src, (imgW - canvasW) / 2, 0, canvasW, canvasH, 0, 0, canvasW, canvasH)

  // draw()必须要用到，并且需要在绘制成功后导出图片
  ctx.draw(false,function () {
    setTimeout(function(){
      wx.canvasToTempFilePath({
        width: canvasW,
        height: canvasH,
        destWidth: canvasW,
        destHeight: canvasH,
        canvasId: cId,
        fileType: ext,
        success: (res) => {
          // res.tempFilePath为导出的图片路径
          typeof cb == 'function' && cb(res.tempFilePath);
        }
      }, this)
    } ,500)
  })


  // ctx.draw(false, () => {
  //   setTimeout(() => {
  //   // 导出图片
  //     wx.canvasToTempFilePath({
  //       width: canvasW,
  //       height: canvasH,
  //       destWidth: canvasW,
  //       destHeight: canvasH,
  //       canvasId: 'canvas',
  //       fileType: 'jpg',
  //       success: (res) => {
  //         // res.tempFilePath为导出的图片路径
  //         typeof cb == 'function' && cb(res.tempFilePath);
  //       }
  //     })
  //   }, 1000);
  // })


}

module.exports = {
  clipImage: clipImage
}