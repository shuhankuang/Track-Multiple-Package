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
  // console.log(tracking_numbers)
  tracking_numbers = ['9361289738009091755413', '9405511108400894874262', 'UM740335899US', 'UA938472260US', '9374889675091115019951', '9405511108435891385343', '9405511108400894874262', '9405511108400894874262']
  let uniq = [...new Set(tracking_numbers)]
  // console.log(uniq)
  tracking_numbers = uniq
  // 过滤订单，排除重复的
  let filter_result = filterTrackingNumbers(tracking_numbers)
  console.log(filter_result)
  // 获得新的订单号
  let new_trackings = filter_result.result.new_trackings
  // 记录新的订单号
  let insert_result = insertNewTrackingNumberToUser(new_trackings)
  console.log(insert_result)
  // 配对单号与数据库 ID

  // 本次需要搜索的单号（包含重复的）
  let search_trackikng_numbers = filter_result.result.search_trackings
  console.log(search_trackikng_numbers)

  // 搜索物流信息
  let trackings_result = af_batchTracking(search_trackikng_numbers)
  // 将信息插入到 sheet 中
  insertTrackingsToSheet(trackings_result)
  return filter_result.result
}

/**
 * 过滤当前查询的单号，重复的不扣费
 */
function filterTrackingNumbers (tracking_numbers) {
  let data = {
    tracking_numbers,
  }
  let result = ParseServer.runCloudCode('fiterTrackingNumbers', data)
  return result
}

/**
 * 更新用户的查询记录，进行业务逻辑的判断
 */
function insertNewTrackingNumberToUser (tracking_numbers) {
  if(tracking_numbers.length < 1) {
    return false
  }
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
  // 保存新的单号
  let result = ParseServer.batch(objs)
  return result
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
 * @param {JSON} json  返回的物流数据
 */
function insertTrackingsToSheet (json) {
  let me = User.me()
  let uid = me.objectId
  // 
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
    // 加密字符，用于判断是否合法的单号，合法就可以进行自动更新
    const _match_key = cipher(APP_NAME)(`${tracking.tracking_number}|${uid}`)
    insertNoteToSheet(row, column, `TRACKR#${_match_key}`)
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
    // insert checkpoints to sheet
    if(checkpoints.length > 0) {
      column += 1
      checkpoints.reverse()
      // insert all the checkpoints
      let _note_text = ''
      checkpoints.map(ck => {
        const date = new Date(ck.date_time).toLocaleString()
        _note_text += `${ck.message}\n${date}  ${ck.address.raw_location} \n\n`
      })
      insertNoteToSheet(row, column, _note_text)
      // insert the latest checkpoint
      let checkpoint = checkpoints.shift()
      let date = new Date(checkpoint.date_time).toLocaleString()
      let _text = `${date}  ${checkpoint.message} ${checkpoint.address.raw_location}`
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
  let state = ParseServer.runCloudCode('fetchUserStatus', {})
  me.state = state.result
  // me.exUser.pro = true
  let token_obj = {
    uid: me.user.objectId,
    email: me.email,
    app: APP_NAME,
    v: VERSION,
  }
  let token = cipher(APP_NAME)(JSON.stringify(token_obj))
  // Object.assign(token_obj, {plan: 'standard'})
  // // console.log(token_obj)
  // let standard_token = cipher(APP_NAME)(JSON.stringify(token_obj))
  // Object.assign(token_obj, {plan: 'professional'})
  // // console.log(token_obj)
  // let professional_token = cipher(APP_NAME)(JSON.stringify(token_obj))
  // Object.assign(token_obj, {plan: 'business'})
  // let business_token = cipher(APP_NAME)(JSON.stringify(token_obj))
  // console.log(token_obj)
  me.subscribeURL = `${ADDON_HOST}/stripe/redirect?token=${token}`
  // me.subscribeURL = `http://localhost:3120/stripe/redirect?token=${token}`
  me.version = VERSION
  // me.subscribeURLs = {
  //   standard: `${ADDON_HOST}/stripe/redirect/${standard_token}`,
  //   professional: `${ADDON_HOST}/stripe/redirect/${professional_token}`,
  //   business: `${ADDON_HOST}/stripe/redirect/${business_token}`,
  // }
  console.log(me)
  return me
}

function manageSubscrptoin () {
  let exUser = userProperties.getProperty('exUser')
  exUser = JSON.parse(exUser)
  console.log(exUser)
  let customer = exUser.sub.customer
  console.log(customer)
  let result = ParseServer.runCloudCode('billingportal', {customer})
  console.log(result)
  return result.result
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

/**
 * 创建一个物流文件监听器，监听当前文档的所有单号，定时更新
 */
// function createTrackingMonitor () {
//   let functionName = 'updateSheetTrackings'
//   let sheetId = SpreadsheetApp.getActive().getId()
//   let monitors = userProperties.getProperty('monitors')
//   monitors = JSON.parse(monitors)
//   // 如果当前文档已经有了监听器了，那么就不要监听了
//   for( var i = 0; i < monitors.length; i++ ){
//     let monitor = monitors[i]
//     if(monitor.sheetId === sheetId){
//       return
//     }
//   }
//   // 创建监听器
//   let tId = Trigger.createMinutesTrigger(1, functionName)
//   console.log(tId)
//   monitors.push({
//     triggerId: tId,
//     sheetId,
//   })
//   userProperties.setProperty('monitors', JSON.stringify(monitors))
//   console.log(monitors)
//   return monitors
// }

// function listMonitors () {
//   let monitors = userProperties.getProperty('monitors')
//   monitors = JSON.parse(monitors)
//   console.log(monitors)
// }

// function clearMonitors () {
//   userProperties.setProperty('monitors', JSON.stringify([]))
// }

// function updateSheetTrackings () {
//   // console.log('updateSheetTrackings')
//   let monitors = userProperties.getProperty('monitors')
//   monitors = JSON.parse(monitors)
//   console.log(monitors)
// }

/**
 * 获得所有监听的文件
 */
function getAllSpreadsheets () {
  let ms = Monitor.getAllMonitors()
  console.log(ms)
  return ms
}

function addSpreadsheetToMonitor () {
  let fn = 'updateSheetTrackings'
  let monitors = Monitor.createSheetMonitor(fn)
  return monitors
}

/**
 * 用户登出，删除所有登录信息
 */
function logout () {
  userProperties.deleteProperty('exUser')
  userProperties.deleteProperty('user')
  userProperties.deleteProperty('setting')
  return true
}




// end