/**
 * @OnlyCurrentDoc
 */
function openDialog() {
  var filename = 'home'
  // var output = HtmlService.createTemplateFromFile(filename).evaluate()
  //   .setHeight(350)
  //   .setWidth(520)
  // console.log(output)
  // 
  var output = HtmlService.createHtmlOutputFromFile(filename)
                          .setTitle('Track Multiple Packages')
  var ui = SpreadsheetApp.getUi()
  // ui.showModalDialog(output, 'Track Multiple Packages')
  ui.showSidebar(output)
}

function openHelp() {
  console.log('Open Help...!')
  var filename = 'help'
  // var output = HtmlService.createTemplateFromFile(filename).evaluate()
  var output = HtmlService.createHtmlOutputFromFile(filename)
                          .setHeight(385)
                          .setWidth(560)
  var ui = SpreadsheetApp.getUi()
  ui.showModalDialog(output, 'Help - Track Multiple Packages')
}

function doTrack (tracking_numbers) {
  console.log(tracking_numbers)
  let result = af_batchTracking(tracking_numbers)
  // console.log(JSON.stringify(result))
  insertTrackingsToSheet(result)
  return result
}

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










// end