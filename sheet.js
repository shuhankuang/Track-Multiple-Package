// 针对 sheet 的操作，用于自动更新

function updateAllSpreadsheets() {
  let monitors = Monitor.getAllMonitors()
  if(monitors.length < 1) {
    console.log('sheet.gs: Can not find any monitor.')
    return
  }
  for(let i = 0; i < monitors.length; i++) {
    let monitor = monitors[i]
    updateOneSpreadsheet_(monitor.sheetId)
  }
  return true
}

/**
 * 过滤当前 sheet 的所有单号，将单号过滤为 
 * 1. 同一物流服务服务商
 * 2. 人工切换过的物流服务商（如果不是默认为第一个，那么就是人工切换过）
 */
function sheetfilterTrackingNumbers_ (tracking_numbers, rows) {

}

function updateOneSpreadsheet_ (id) {
  let me = User.me()
  let uid = me.objectId

  let spreadsheet = SpreadsheetApp.openById(id)
  let sheets = spreadsheet.getSheets()


  for(var i = 0; i < sheets.length; i++ ){
    let sheet = sheets[i]
    let last_row = sheet.getLastRow()
    // 
    let elements = [] // 根据物流服务商分类
    // 如果是空白的表单，那么就跳过
    if(last_row < 1) {
      continue
    }
    console.log('------')
    console.log(sheet.getName())
    // 获取当前表单第一列所有数据
    let trackings_range = sheet.getRange(1, 1, last_row)
    // let couriers_range = sheet.getRange(2, 2, last_row)
    // 获取所有单号的数据
    let _tNumbers = trackings_range.getValues()
    // 获取所有物流服务商的数据
    // let _cNames = couriers_range.getValues()
    // 获取所有标记
    let notes = trackings_range.getNotes()
    // 配对
    let tracking_numbers = []
    let rows = []
    for (let k = 0; k < _tNumbers.length; k++ ) {
      let tNumber = _tNumbers[k][0] + ''
      let row = k + 1
      let note = notes[k][0]
      let key = note.split('#')[1]
      if(!tNumber || !note || !key) {
        continue
      }
      let courier_cell = sheet.getRange(row, 2)
      let is_default_courier = true
      let selected_courier
      try {
        let couriers = courier_cell.getDataValidation().getCriteriaValues()[0]
        selected_courier = courier_cell.getValue()
        let default_courier = couriers[0]
        if(selected_courier === default_courier) {
          is_default_courier = true
        }else{
          is_default_courier = false
        }
        console.log(`${selected_courier} : ${default_courier} ,is_default_courier ${is_default_courier}`)
      } catch(e) {}
      let _text = decipher(APP_NAME)(key)
      let slat = _text.split('|')
      // 判断标记中的 key 是否真确，单号与用户id
      let isOK = tNumber === slat[0] && uid === slat[1]
      console.log(tNumber, slat[0])
      // console.log(isOK)
      if(isOK) {
        tracking_numbers.push(tNumber)
        rows.push(row)
        elements.push({
          row: row,
          number: tNumber,
          is_default_courier: is_default_courier,
          courier: selected_courier
        })
      }
    }

    let grouped_by_couriers = Object.create(null)
    elements.forEach(function(e) {
      grouped_by_couriers[e.courier] = grouped_by_couriers[e.courier] || []
      grouped_by_couriers[e.courier].push(e)
    })

    let default_courier_trackings = [] // 默认物流服务商的订单
    let selected_courier_trackings = [] // 用户选择的物流服务商订单

    elements.forEach(function(e) {
      if(e.is_default_courier) {
        default_courier_trackings.push(e)
      }else{
        selected_courier_trackings.push(e)
      }
    })

    let params = {
      spreadsheet,
      sheet,
      rows,
      tracking_objects: elements,
      grouped_by_couriers,
      default_courier_trackings,
      selected_courier_trackings,
      tracking_numbers,
    }
    // console.log(params)
    Utilities.sleep(1500) // 时间间隔，缓冲
    monitorDoTrack(params)
  }
}


function updateCarriers () {
  var cell = SpreadsheetApp.getActive().getRange('A1')
  // var range = SpreadsheetApp.getActive().getRange('A1:A10');
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(['UPS', 'Fedex'])
  .build();
  cell.setDataValidation(rule);
}