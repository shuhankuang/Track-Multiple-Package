// 针对 sheet 的操作，用于自动更新

function getAllSheets () {
  let me = User.me()
  let uid = me.objectId

  let sheets = SpreadsheetApp.openById('1oPp5VkQiDRH6r-kvXI7w89qQnHm8ZtSkpvUfv59R_zc')
    .getSheets()

  for(var i = 0; i < sheets.length; i++ ){
    let sheet = sheets[i]
    let sheetId = sheet.getSheetId()
    let last_row = sheet.getLastRow()
    if(last_row < 1) {
      console.log('--- END ---')
      continue
    }
    let range = sheet.getRange(1, 1, last_row)
    let values = range.getValues()
    let notes = range.getNotes()
    // 配对
    let tracking_numbers = []
    for (let k = 0; k < values.length; k++ ) {
      console.log('k:' + k)
      let value = values[k][0]
      let note = notes[k][0]
      let key = note.split('#')[1]
      if(!value || !note || !key) {
        continue
      }
      let _text = decipher(APP_NAME)(key)
      let arr = _text.split('|')
      let isOK = value === arr[0] && uid === arr[1]
      console.log(isOK)
      if(isOK) {
        tracking_numbers.push(value)
      }
      // if(value )
    }
    console.log(tracking_numbers)
    console.log('--- END ---')
  }
}