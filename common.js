/**
 * 打印日志
 */
function Log(data) {
  Logger.log(data)
}
/**
 * 引入外部 HTML 文件
 * @param 外部文件名的命 *.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}