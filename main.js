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
  console.log(e.authMode)
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    // ui.createAddonMenu('SheetTrackr')
    ui.createMenu('SheetTrackr')
      .addItem('❓ Tutorial Video', 'openTutorailVideo')
      .addToUi()
  }else{
    // ui.createAddonMenu('SheetTrackr')
    ui.createMenu('SheetTrackr')
      .addItem('🚚 Start', 'openSidebar')
      .addSeparator()
      .addItem('❓ Tutorial Video', 'openTutorailVideo')
      .addToUi()
  }
}

/**
 * 当选择改变时候
 */
function onSelectionChange (e) {
  let range = e.range
  console.log(range)
  let rowSelected = range.rowStart + ''
  Storage.user().setProperty('row_selected', rowSelected)
}

function onEdit (e) {
  // updateOnCourierChange(e)
}