/**
 * @OnlyCurrentDoc
 */
/**
 * 打开侧栏的操作界面
 */
function openSidebar() {
  User.init()
  // 
  var filename = 'home'
  var output = HtmlService.createHtmlOutputFromFile(filename)
                          .setTitle('SheetTrackr - Track Multiple Packages')
  var ui = SpreadsheetApp.getUi()
  ui.showSidebar(output)
}
/**
 * 打开帮助窗口
 */
function openHelp() {
  console.log('Open Help...!')
  var filename = 'help'
  var output = HtmlService.createHtmlOutputFromFile(filename)
                          .setHeight(385)
                          .setWidth(560)
  var ui = SpreadsheetApp.getUi()
  ui.showModalDialog(output, 'Help - SheetTrackr')
}
/**
 * 查询订单
 */
function doTrack (tracking_numbers) {
  console.log(tracking_numbers)
  let result = af_batchTracking(tracking_numbers)
  // console.log(JSON.stringify(result))
  insertTrackingsToSheet(result)
  return result
}
/**
 * 将物流内容插入的表单里
 */
function insertTrackingsToSheet (json) {
  let data = json.data
  // data = af_data
  let trackings = data.direct_trackings
  // 
  let cell_texts = []
  for (let i = 0; i < trackings.length; i++) {
    let tracking = trackings[i].tracking
    let checkpoints = tracking.checkpoints
    // inster text to cell
    let row = i + 1
    let column = 1
    // tracking_number
    insterTextToSheet(row, column, tracking.tracking_number)
    insertNoteToSheet(row, column, `TRACK # ${tracking.tracking_number}`)
    // courier
    column += 1
    insterTextToSheet(row, column, tracking.courier.name)
    // service_type_name
    column += 1
    insterTextToSheet(row, column, tracking.service_type_name)
    // latest_status
    column += 1
    insterTextToSheet(row, column, tracking.latest_status)
    // delivery_days
    column += 1
    insterTextToSheet(row, column, `${tracking.delivery_days} Days`)
    // checkpoint
    if(checkpoints.length > 0) {
      column += 1
      let checkpoint = checkpoints.shift()
      let date = new Date(checkpoint.created_at).toLocaleString()
      let _text = `${date} ${checkpoint.message} ${checkpoint.address.raw_location}`
      insterTextToSheet(row, column, _text)
    }
    // courier_tracking_link
    column += 1
    insterTextToSheet(row, column, tracking.courier_tracking_link || tracking.courier_redirect_link)
  }
}

function insertNoteToSheet (row, column, text) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let cell = sheet.getRange(row, column)
  cell.setNote(text)
}

function insterTextToSheet (row, column, text) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let cell = sheet.getRange(row, column)
  let rich_text = SpreadsheetApp.newRichTextValue()
    .setText(text)
    .build()
  cell.setRichTextValue(rich_text)
  // console.log(text)
  if(text === 'Delivered') {
    cell.setBackground(`#349d4f`) 
    // cell.getRow().setBackground(`#349d4f`)
  }
}

/**
 * 获取当前用户
 */
function doGetMe () {
  // let me = User.email()
  // console.log(me)
  let me = {}
  let user = userProperties.getProperty('user')
  let exUser = userProperties.getProperty('exUser')
  me.user = JSON.parse(user)
  me.email = User.email()
  me.exUser = JSON.parse(exUser)

  // 
  let token_obj = {
    uid: user.objectId,
    email: me.email,
    app: APP_NAME,
  }
  let token = cipher(APP_NAME)(JSON.stringify(token_obj))
  me.subscribeURL = `${ADDON_HOST}/subscribe/${token}`
  console.log(me)
  return me
}









// end