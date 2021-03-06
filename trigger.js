class Klass_Trigger {
  constructor () {

  }
  /**
   * 创建一个小时时间任务
   */
  createHourTrigger (hour, funcName) {
    let t = ScriptApp.newTrigger(funcName)
      // .forSpreadsheet(doc)
      .timeBased()
      .everyHours(hour)
      .create()
    return t.getUniqueId()
  }
  /**
   * 创建一个分钟时间任务
   */
  createMinutesTrigger (minutes, funcName) {
    let t = ScriptApp.newTrigger(funcName)
      // .forSpreadsheet(doc)
      .timeBased()
      .everyMinutes(minutes)
      .create()
    return t.getUniqueId()
  }

  getProjectAllTriggers () {
    let tgs = ScriptApp.getProjectTriggers()
    return tgs
  }

  getUserAllTriggers (currentDoc) {
    let tgs = ScriptApp.getUserTriggers(currentDoc)
    return tgs
  }

  hasProjectTrigger (name) {

  }

  hasUserTrigger (name) {

  }

  removeTrigger (triggerId, sheetId) {
    let doc = SpreadsheetApp.openById(sheetId)
    // console.log(doc.getSheetId())
    var allTriggers = ScriptApp.getUserTriggers(doc)
    // console.log(allTriggers)
    for (var i = 0; i < allTriggers.length; i++) {
      if (allTriggers[i].getUniqueId() === triggerId) {
        ScriptApp.deleteTrigger(allTriggers[i])
        break
      }
    }
    return true
  }
}

let Trigger = new Klass_Trigger()

function create_trigger () {
  Trigger.createHourTrigger(1, 'updateSheets')
}

function getUserAllTriggers () {
  let tgs = Trigger.getUserAllTriggers()
  console.log(tgs)
}

function getProjectAllTriggers () {
  let tgs = Trigger.getProjectAllTriggers()
  console.log(tgs)
}











// end