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