/**
 * @OnlyCurrentDoc
 */
function onInstall(e) {
  onOpen(e)
}
/**
 * 打开的时候
 */
function onOpen(e) {
  // 创建菜单
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('SheetTrackr')
    .addItem('🚚 Start', 'openSidebar')
    .addSeparator()
    .addItem('❓ Help', 'openHelp')
    .addToUi()
}

/**
 * 当选择改变时候
 */
// function onSelectionChange (e) {
//   // let user = e.user
//   let range = e.range
//   let rowSelected = range.rowStart + ''
//   // userProperties.setProperty('row_selected', rowSelected)
// }

function onEdit (e) {
  updateOnCourierChange(e)
}