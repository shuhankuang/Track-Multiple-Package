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
  insertTrackingsToSheet(result)
  return result
}

/**
 * 更新用户的查询记录，进行业务逻辑的判断
 */
function updateUserTrackings (tracking_numbers) {
  tracking_numbers = ['9361289738009091755413', 'UA938472260US', '9374889675091115019951', 'UM740335899US']
  let me = User.me()
  let uid = me.objectId
  let objs = []
  let user = ParseServer.pointer('User', uid)
  let ACL = `{"${uid}": {"read": true, "write": true}, "role: Administrator": {"read": true, "write": true} , "*": {}}`
  tracking_numbers.map((num) => {
    objs.push({
      method: 'POST',
      path: '/parse/classes/Tracking',
      body: {
        tracking_num: num,
        user: user,
        ACL: JSON.parse(ACL),
      }
    })
  })
  // console.log(objs)
  // 保存所有的单号（如果重复就不计算）
  let result = ParseServer.batch(objs)
  // console.log(result)
  let dup_nums = []
  let new_nums = []
  result.map((obj) => {
    // console.log(obj)
    if(obj.error) {
      let tracking_num = obj.error.error.split(',')[0]
      dup_nums.push(tracking_num)
    }
    if(obj.success) {
      let objId = obj.success.objectId
      new_nums.push(objId)
    }
  })

  console.log(dup_nums)
  console.log(new_nums)
}

/**
 * 获取当前用户的查询余额（每月）
 */
function fetchUserRemaining () {
  let result = ParseServer.runCloudCode('fetchUserRemaining', {})
  // console.log(result)
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
      let checkpoint = checkpoints.pop()
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

/**
 * 弹出 alert 窗口
 */
function showAlert (params) {
  var ui = SpreadsheetApp.getUi()
  var result = ui.alert(
     params.title,
     params.message,
     ui.ButtonSet.OK)

  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    // ui.alert('Confirmation received.');
  } else {
    // User clicked "No" or X in the title bar.
    // ui.alert('Permission denied.');
  }
}
/**
 * 测试 17track.net 的接口调用（可用隐私模式获取 cookies, 用 puppeeter 进行获取 cookies）
 */
function getCookies () {
  let url = 'https://t.17track.net/restapi/track'
  let headers = {
    cookie: 'v5_Culture=en; __gads=ID=ab26fd3614ca9966:T=1628136096:S=ALNI_MYtuE5QCNJTk9Yv75EEJxJKF7xS6g; FCCDCF=[["AKsRol8ywU5gVYKAMtPXg5eCBwiWB7_emtyZrFH-r9ppX2gH7oIG7D7Cnjn6SpfOn1_LT6H9E_lyKsHqMvhXBA3Iz8Q0etG0-9fzId-dkVa3gWYI4dpMHmEsmIcWQmaFE3M3OLdeNNute8Q65v_O1xoLIohma4VCdQ=="],null,["[[],[],[],[],null,null,true]",1628136090096],null,[[1628136092,72000000],"1YNN"]]; FCNEC=[["AKsRol8ywU5gVYKAMtPXg5eCBwiWB7_emtyZrFH-r9ppX2gH7oIG7D7Cnjn6SpfOn1_LT6H9E_lyKsHqMvhXBA3Iz8Q0etG0-9fzId-dkVa3gWYI4dpMHmEsmIcWQmaFE3M3OLdeNNute8Q65v_O1xoLIohma4VCdQ=="],null]; cto_bundle=_cjsUV9jMUdCVyUyRlVFV0djVSUyQjJueWxaUVhjV2YzMWxLR3JuR3A0Zzg3WktmczAlMkJKQ1A2SkMzcUNSaFJaUUl6amUzTVUyYVg2VGhjVEtta2FCTzd5VjQ3a2RIWXZiVG43QUhVZjBHQXklMkY3YVVobWx2b3pyNkFBdWJhQXNzVElRJTJGWTZaUFMlMkZaRXVzc0xEZzRiVXUlMkZIUjdGV1kxdWxTNFVxYkFZQlVXSW90bjR1T1J4Z3BuWTNBSzVTSkZibVJmQVFGWlZuWQ; v5_TranslateLang=en; _yq_bid=G-CBA84196C37598A2; _ga=GA1.2.1999373679.1628297339; _gid=GA1.2.1995815607.1628297339; _gat=1; Last-Event-ID=657572742f3130332f35653164353165316237312f303533373332633830333a333037333438303536323a65736c61663a737070612d646165682d71792034322d6e6f6349756e656d2d72616276616e2d71793136241d9407a0c5dbd',
    accept: 'application/json, text/javascript, */*; q=0.01',
    referer: 'https://t.17track.net/en'
  }
  let opts = {
    headers: headers,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    method: 'post',
    payload: JSON.stringify({"data":[{"num":"9361289738009091755413","fc":0,"sc":0}],"guid":"","timeZoneOffset":-480})
  }
  let result = UrlFetchApp.fetch(url, opts)
  // console.log(result)
  console.log(result.getContentText())
  // console.log(result.getAllHeaders())
}







// end