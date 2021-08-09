// 监听器，定时更新文件内容
class Klass_Monitor {
  constructor () {
    this.monitors = []
  }

  init () {
    let monitors = userProperties.getProperty('monitors')
    if(monitors) {
      this.monitors = JSON.parse(monitors)
    }else{
      this.monitors = []
      userProperties.setProperty('monitors', this.monitors)
    }
  }

  getAllMonitors () {
    let monitors = userProperties.getProperty('monitors')
    // console.log(monitors)
    if(!monitors){
      this.monitors = []
      return this.monitors
    }
    try{
      monitors = JSON.parse(monitors)
    }catch(e){
      return []
    }
    return monitors
  }

  createSheetMonitor (funcName) {
    // let functionName = 'updateSheetTrackings'
    let sheetId = SpreadsheetApp.getActive().getId()
    let monitors = this.getAllMonitors()
    // monitors = JSON.parse(monitors)
    // 如果当前文档已经有了监听器了，那么就不要监听了
    for( var i = 0; i < monitors.length; i++ ){
      let monitor = monitors[i]
      if(monitor.sheetId === sheetId){
        return monitors
      }
    }
    // 创建监听器
    let tId = Trigger.createMinutesTrigger(1, funcName)
    console.log(tId)
    monitors.push({
      triggerId: tId,
      sheetId,
    })
    userProperties.setProperty('monitors', JSON.stringify(monitors))
    // console.log(monitors)
    this.monitors = monitors
    return monitors
  }

  removeSheetMonitor (sheetId) {
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