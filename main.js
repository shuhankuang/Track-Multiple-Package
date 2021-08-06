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
  // 创建菜单
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('SheetTrackr')
    .addItem('Start', 'openSidebar')
    .addSeparator()
    .addItem('Help', 'openHelp')
    .addToUi()
}