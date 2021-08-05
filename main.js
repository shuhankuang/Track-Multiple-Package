/**
 * @OnlyCurrentDoc
 */
function onInstall(e) {
  onOpen(e)
}
/**
 * 打开的时候
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('Track Multiple Packages')
    .addItem('Start', 'openDialog')
    .addSeparator()
    .addItem('Help', 'openHelp')
    .addToUi()
}