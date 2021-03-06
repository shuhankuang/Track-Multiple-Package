// 监听器，定时更新文件内容
class Klass_Monitor {
  constructor () {
    this.monitors = []
  }

  init () {
    let userProperties = Storage.user()
    let monitors = userProperties.getProperty('monitors')
    if(monitors) {
      this.monitors = JSON.parse(monitors)
    }else{
      this.monitors = []
      userProperties.setProperty('monitors', this.monitors)
    }
  }

  count () {
    let userProperties = Storage.user()
    let monitors = userProperties.getProperty('monitors')
    console.log(monitors)
    if(!monitors){
      return 0
    }else {
      try{
        monitors = JSON.parse(monitors)
        return monitors.length
      }catch {
        return 0
      }
    }
  }

  getAllMonitors () {
    let userProperties = Storage.user()
    let monitors = userProperties.getProperty('monitors')
    console.log('get All monitors')
    console.log(monitors)
    if(!monitors){
      this.monitors = []
      return this.monitors
    }
    try{
      monitors = JSON.parse(monitors)
      let sheets = []
      for(let i = 0; i < monitors.length; i++) {
        let mo = monitors[i]
        let sheet = SpreadsheetApp.openById(mo.sheetId)
        let name = sheet.getName()
        mo.name = name
        // console.log(name)
        // sheets.push(sheet)
      }
      // console.log(sheets)
    }catch(e){
      return []
    }
    return monitors
  }

  createSheetMonitor (funcName) {
    let userProperties = Storage.user()
    // let functionName = 'updateSheetTrackings'
    let sheetId = SpreadsheetApp.getActive().getId()
    let monitors = this.getAllMonitors()
    // monitors = JSON.parse(monitors)
    // 如果当前文档已经有了监听器了，那么就不要监听了
    for( var i = 0; i < monitors.length; i++ ){
      let monitor = monitors[i]
      if(monitor.sheetId === sheetId){
        showAlert({
          title: 'SheetTrack',
          message: 'Can not create duplicate monitor for the current document.'
        })
        return monitors
      }
    }
    // 创建监听器
    let tId = Trigger.createHourTrigger(1, funcName)
    console.log(tId)
    monitors.push({
      triggerId: tId,
      sheetId,
    })
    userProperties.setProperty('monitors', JSON.stringify(monitors))
    console.log(monitors)
    let ss = userProperties.getProperty('monitors')
    console.log('user properties')
    console.log(ss)
     console.log(Storage.user())
    this.monitors = monitors
    return monitors
  }

  removeSheetMonitor (sheetId) {
    let userProperties = Storage.user()
    let monitors = this.getAllMonitors()
    let index = -1
    let triggerId = undefined
    for( var i = 0; i < monitors.length; i++ ){
      let monitor = monitors[i]
      if(monitor.sheetId === sheetId){
        index = i
        triggerId = monitor.triggerId
        break
      }
    }
    monitors.splice(index, 1)
    this.monitors = monitors
    userProperties.setProperty('monitors', monitors)
    if(triggerId){
      Trigger.removeTrigger(triggerId, sheetId)
    }
    return monitors
  }

  clear () {
    this.monitors = []
    userProperties.deleteProperty('monitors')
  }
}

let Monitor = new Klass_Monitor()

function monitor_clear () {
  Monitor.clear()
}

function monitor_create () {
  let fn = 'updateSheetTrackings'
  Monitor.createSheetMonitor(fn)
}







// end