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
  tracking_numbers = tracking_numbers ? tracking_numbers : ['9361289738009091755413', '9405511108400894874262', 'UM740335899US', 'UA938472260US', '9374889675091115019951', '9405511108435891385343', '9405511108400894874262', '9405511108400894874262']
  let uniq = [...new Set(tracking_numbers)]
  // console.log(uniq)
  tracking_numbers = uniq
  // 过滤订单，排除重复的
  let filter_result = filterTrackingNumbers(tracking_numbers)
  // console.log(filter_result)
  // 获得新的订单号
  let new_trackings = filter_result.result.new_trackings
  // 记录新的订单号
  let insert_result = insertNewTrackingNumberToUser(new_trackings)
  // console.log(insert_result)
  // 配对单号与数据库 ID

  // 本次需要搜索的单号（包含重复的）
  let search_trackikng_numbers = filter_result.result.search_trackings
  console.log(search_trackikng_numbers)
  // 搜索物流信息
  let trackings_result = af_batchTracking(search_trackikng_numbers)
  // 将信息插入到当前 sheet 中
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = SpreadsheetApp.getActiveSheet()
  let params = {
    spreadsheet,
    sheet,
  }
  // console.log(sheet.getSheetId())
  insertTrackingsToSheet(trackings_result, params)
  return filter_result.result
}

/**
 * 定时器触发的更新
 */
function monitorDoTrack (params) {
  // tracking_numbers = ['9361289738009091755413', '9405511108400894874262', 'UM740335899US', 'UA938472260US', '9374889675091115019951', '9405511108435891385343', '9405511108400894874262', '9405511108400894874262']
  let tracking_numbers = params.tracking_numbers
  if(tracking_numbers.length < 1) {
    return false
  }
  // let spreadsheet = params.spreadsheet
  // let sheet = params.sheet
  // let rows = params.rows
  // let tracking_objects = params.tracking_objects
  // let default_courier_trackings = params.default_courier_trackings
  // let selected_courier_trackings = params.selected_courier_trackings
  // let selected_grouped_by_couriers = params.selected_grouped_by_couriers
  // params.isMonitor = true

  // // 排除重复
  // let uniq = [...new Set(tracking_numbers)]
  // tracking_numbers = uniq

  // 搜索物流信息
  // let trackings_result = af_batchTracking(tracking_numbers)
  // // 将信息插入到 sheet 中
  // insertTrackingsToSheet(trackings_result, params)
  // return trackings_result
  doBatchTrackingForSheet_(params)
}

/**
 * 针对 sheet 的参数进行独立的处理, 主要针对 Monitor 的操作
 * @param {Object} params 参考 sheet.gs 里面返回的参数
 */
function doBatchTrackingForSheet_ (params) {
  let spreadsheet = params.spreadsheet
  let sheet = params.sheet
  let rows = params.rows
  let tracking_objects = params.tracking_objects
  let default_courier_trackings = params.default_courier_trackings
  let selected_courier_trackings = params.selected_courier_trackings
  let selected_grouped_by_couriers = params.selected_grouped_by_couriers
  let tracking_numbers = params.tracking_numbers
  // params.isMonitor = true
  // 排除重复
  let uniq = [...new Set(tracking_numbers)]
  tracking_numbers = uniq
  let max = MAX_TRACKING_NUMBER

  let _track_func = function(tracking_objs, isSelectedCourier = false, slugs = []) {
    let chuck = chuckArray(tracking_objs, max)
    for (let i = 0; i < chuck.length; i++) {
      let eles = chuck[i]
      let _nums = []
      let _rows = []
      eles.map(function(e){
        _nums.push(e.number)
        _rows.push(e.row)
      })
      // 搜索物流信息
      let trackings_result = af_batchTracking(_nums, slugs)
      // 将信息插入到 sheet 中
      let _params  = {
        spreadsheet,
        sheet,
        rows: _rows,
        isMonitor: true,
        isSelectedCourier,
      }
      // console.log(_params)
      insertTrackingsToSheet(trackings_result, _params)
    }
  }
  // 用户选择的物流服务商订单
  for( key in selected_grouped_by_couriers) {
    let eles = selected_grouped_by_couriers[key]
    let courier = String(key).toLocaleLowerCase()
    _track_func(eles, true, [courier])
  }
  // 默认物流服务商的订单
  _track_func(default_courier_trackings, false, [])
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
 * @param {object} params {spreadsheetId, sheetId, rows, isMonitor} 物流单号对应的行，用于 Monitor 的更新
 */
function insertTrackingsToSheet (json, params) {
  let me = User.me()
  let uid = me.objectId
  // 
  let spreadsheet = params.spreadsheet
  let sheet = params.sheet
  let rows = params.rows
  let isMonitor = params.isMonitor // 是否 monitor 的监听，如果是，那么就不创建新的行，只更新当前。
  let isSelectedCourier = params.isSelectedCourier
  // 
  let trackings = json.data.direct_trackings
  let row_selected = 1
  let cell = sheet.getCurrentCell()
  if(cell) {
    row_selected = cell.getRow()
  }
  // insert rows to sheets
  if(!isMonitor){
    let _mxc = sheet.getMaxColumns()
    sheet.insertRows(row_selected, trackings.length)
    sheet.getRange(row_selected, 1, trackings.length, _mxc)
      .setBackground('#ffffff')
  }

  for (let i = 0; i < trackings.length; i++) {
    let root = trackings[i]
    let tracking = trackings[i].tracking
    let checkpoints = tracking.checkpoints
    // 当前的状态 (Delivered - 送达) 
    let latest_status = tracking.latest_status
    // inster text to cell
    let row
    if(rows) {
      row = rows[i]
    }else{
      row = i + row_selected
    }
    let column = 1
    // tracking_number
    insterTextToSheet(sheet, row, column, tracking.tracking_number + '')
    // 加密字符，用于判断是否合法的单号，合法就可以进行自动更新
    const _match_key = cipher(APP_NAME)(`${tracking.tracking_number}|${uid}`)
    insertNoteToSheet(sheet, row, column, `TRACKR#${_match_key}`)
    // courier
    column += 1
    // insterTextToSheet(sheet, row, column, tracking.courier.name)
    // detected_slugs
    if(!isSelectedCourier) {
      insertDataValidationToSheet(sheet, row, column, root.detected_slugs)
    }
    // latest_status
    column += 1
    insterTextToSheet(sheet, row, column, tracking.latest_status)
    // delivery_days
    column += 1
    insterTextToSheet(sheet, row, column, `${tracking.delivery_days} Days`)
    // service_type_name
    column += 1
    insterTextToSheet(sheet, row, column, tracking.service_type_name)
    // insert checkpoints to sheet
    column += 1
    if(checkpoints.length > 0) {
      checkpoints.reverse()
      // insert all the checkpoints
      let _note_text = ''
      checkpoints.map(ck => {
        const date = new Date(ck.date_time).toLocaleString()
        _note_text += `${ck.message}\n${date}  ${ck.address.raw_location} \n\n`
      })
      insertNoteToSheet(sheet, row, column, _note_text)
      // insert the latest checkpoint
      let checkpoint = checkpoints.shift()
      let date = new Date(checkpoint.date_time).toLocaleString()
      let _text = `${date}  ${checkpoint.message} ${checkpoint.address.raw_location}`
      insterTextToSheet(sheet, row, column, _text)
    }
    // courier_tracking_link
    column += 1
    insterTextToSheet(sheet, row, column, tracking.courier_tracking_link || tracking.courier_redirect_link)
    // set background color
    setCellBackgroundColor(sheet, row, undefined, tracking.latest_status)
  }
}
/**
 * 插入笔记内容
 */
function insertNoteToSheet (sheet, row, column, text) {
  let cell = sheet.getRange(row, column)
  cell.setNote(text)
}
/**
 * 插入表格内容
 */
function insterTextToSheet (sheet, row, column, text) {
  // console.log(row, column)
  let cell = sheet.getRange(row, column)
  try{
    if(!text) {
      text = ''
    }
    let rich_text = SpreadsheetApp.newRichTextValue()
      .setText(text + '')
      .build()
    cell.setRichTextValue(rich_text)
    // let lc = sheet.getMaxColumns()
    // if(text === 'Delivered') {
    //   sheet.getRange(row, 1, 1, lc).setBackground('#b6df95')
    // }else{
    //   sheet.getRange(row, 1, 1, lc).setBackground('#ffffff')
    // }
  } catch(e) {
    console.log('Error: ' + e)
  }
}

function setCellBackgroundColor (sheet, row, column, status) {
  let lc = sheet.getMaxColumns()
  if(status === 'Delivered') {
    sheet.getRange(row, 1, 1, lc).setBackground('#b6df95')
  }else{
    sheet.getRange(row, 1, 1, lc).setBackground('#ffffff')
  }
}
/**
 * 插入下来列表导指定 cell
 */
function insertDataValidationToSheet (sheet, row, column, list) {
  let cell = sheet.getRange(row, column)
  console.log(list)
  let _list = []
  list.map(o => {
    _list.push(String(o).toLocaleUpperCase())
  })
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(_list)
    .build()
  
  cell.setDataValidation(rule)
  cell.setValue(_list[0])
}

function manageSubscrptoin () {
  let exUser = userProperties.getProperty('exUser')
  exUser = JSON.parse(exUser)
  // console.log(exUser)
  let customer = exUser.sub.customer
  // console.log(customer)
  let result = ParseServer.runCloudCode('billingportal', {customer})
  // console.log(result)
  return result.result
}

function switchPlan (params) {
  let plan = params && params.plan ? params.plan : 'professional'
  let exUser = userProperties.getProperty('exUser')
  exUser = JSON.parse(exUser)
  if(exUser && exUser.sub){
    let subId = exUser.sub.id
    // console.log(subId, plan)
    let result = ParseServer.runCloudCode('switch_plan', {subId, plan})
    openSidebar()
    return result
  }
  return false
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
  // console.log(result.getContentText())
  // console.log(result.getAllHeaders())
}

/**
 * 获得所有监听的文件
 */
function getAllSpreadsheets () {
  let ms = Monitor.getAllMonitors()
  // console.log(ms)
  return ms
}

function addSpreadsheetToMonitor () {
  let exUser = userProperties.getProperty('exUser')
  exUser = JSON.parse(exUser)
  // console.log(exUser)
  let plan = 'BASIC'
  let max = 1
  let count = Monitor.count()
  // console.log(max, count)
  // free
  if(exUser && !exUser.sub) {

  }
  // pay
  if(exUser && exUser.sub) {
    plan = String(exUser.sub.plan.nickname.split('-')[1].trim()).toLocaleLowerCase()
    max = PLANS[plan].max_monitors_num
  }
  console.log(`max: ${max}`)

  if(count >= max) {
    let str = max > 1 ? 's' : ''
    showAlert({
      title: `SheetTrackr: ${plan} PLAN`,
      message: `You can only create ${max} monitor${str}.`
    })
    return false
  }

  // return false
  let fn = 'updateSheetTrackings'
  let monitors = Monitor.createSheetMonitor(fn)
  return monitors
}

function removeSpreadsheetMonitor (sheetId) {
  let monitors = Monitor.removeSheetMonitor(sheetId)
  return monitors
}

function updateSheetTrackings () {
  // console.log('run monitor')
  updateAllSpreadsheets()
}

/**
 * 当改变物流商时，更新当前的单号信息
 * @param {Object} e  onEdit(e)
 */
function updateOnCourierChange (e) {
  let range = e.range
  let oldValue = e.oldValue
  let value = e.value
  if(oldValue && value) {
    let cell = SpreadsheetApp.getActiveSheet().getRange(range.rowStart, range.columnStart)
    let tracking_num_cell = SpreadsheetApp.getActiveSheet().getRange(range.rowStart, range.columnStart - 1)
    let tracking_num = tracking_num_cell.getValue()
    let courier = String(cell.getValue()).toLocaleLowerCase()
    // console.log(tracking_num, courier)
    let tracking_numbers = [tracking_num]
    // console.log(cell.getDataValidation().getCriteriaValues()[0])
    // let tracking_numbers
    // let params
    // monitorDoTrack(tracking_numbers, params)
  }
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