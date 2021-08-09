// 针对 sheet 的操作，用于自动更新

function updateAllSpreadsheets() {
  let monitors = Monitor.getAllMonitors()
  if(monitors.length < 1) {
    return
  }
  for(let i = 0; i < monitors.length; i++) {
    let monitor = monitors[i]
    updateOneSpreadsheet_(monitor.sheetId)
  }
  return true
}

function updateOneSpreadsheet_ (id) {
  let me = User.me()
  let uid = me.objectId

  let spreadsheet = SpreadsheetApp.openById(id)
  let sheets = spreadsheet.getSheets()

  for(var i = 0; i < sheets.length; i++ ){
    let sheet = sheets[i]
    let last_row = sheet.getLastRow()
    if(last_row < 1) {
      // console.log('--- END ---')
      continue
    }
    let range = sheet.getRange(1, 1, last_row)
    let values = range.getValues()
    let notes = range.getNotes()
    // 配对
    let tracking_numbers = []
    let rows = []
    for (let k = 0; k < values.length; k++ ) {
      let value = values[k][0]
      let note = notes[k][0]
      let key = note.split('#')[1]
      if(!value || !note || !key) {
        continue
      }
      let _text = decipher(APP_NAME)(key)
      let slat = _text.split('|')
      let isOK = value === slat[0] && uid === slat[1]
      // console.log(isOK)
      if(isOK) {
        tracking_numbers.push(value)
        rows.push(k + 1)
      }
    }
    let params = {
      spreadsheet,
      sheet,
      rows,
    }
    console.log(tracking_numbers, params)
    monitorDoTrack(tracking_numbers, params)
    // console.log(tracking_numbers)
    // console.log(rows)
    // console.log('--- END ---')
  }
}