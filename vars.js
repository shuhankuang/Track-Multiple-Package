// 默认的参数
const PREFIX = 'ADDON_TRACK' // 标记符号，若用统一的用户管理后台，那么可以用此字符进行区分
const APP_NAME = 'SheetTrackr' // SheetTrackr (Google Sheets Addon)
const COUNTS = [0, 1, 3, 5, 10] // 插入物流信息的条数
const MAX_HISTORY_NUM = 3 // 显示的历史数据，可以本地显示多少条历史数据
const VERSION = '1.0.0'
const MAX_TRACKING_NUMBER = 50
const PLANS = {
  basic: {
    max: 30,
    max_monitors_num: 1,
    name: 'basic',
  },
  standard: {
    max: 250,
    max_monitors_num: 2,
    name: 'standard',
  },
  professional: {
    max: 500,
    max_monitors_num: 3,
    name: 'professional'
  },
  business: {
    max: 1000,
    max_monitors_num: 5,
    name: 'business'
  }
}

// 默认的用户参数
var default_params = {
  tracking_number: '', // 物流订单号
  couriers: [
    {text: '', value: 0}
  ], // 物流服务商
  tracking_response: undefined,
  tracking_info: ' ', // 物流信息 (拼接的)
}
// 默认 setting 设置
let default_setting = {
  num_select: 0, // 插入多少条物流信息
  show_hisotry: true, // 显示单号历史
}
// 监听器，存放 trigger Id
let default_monitors = []

var userProperties = PropertiesService.getUserProperties()
// 个人设置
if(!userProperties.getProperty('setting')){
  userProperties.setProperty('setting', JSON.stringify(default_setting))
}
// 物流单号更新监听器
if(!userProperties.getProperty('monitors')) {
  userProperties.setProperty('monitor', JSON.stringify(default_monitors))
}

// getwebooster@gmail.com 用户的个人页面
// https://trackr.workaddons.com/subscribe/722b0c722539340c726a0c72653d3d0422003114371f0c727c0c72353d31393c0c726a0c723735242735323f3f2324352210373d31393c7e333f3d0c727c0c723120200c726a0c72042231333b227d1134343f3e0c727c0c72203c313e0c726a0c723d3f3e24383c290c722d72

// 9361289738009091755413
// UA938472260US
// 9374889675091115019951
// UM740335899US
// 9405511108435891385343
// UA930012758US
// 9400111108400861167646
// 9400111108036886154271
// 911492037294201382323 多物流单号
// 2327843836 多物流单号，需要用户选择物流商


// 9361289738009091755413
// UA938472260US
// 9374889675091115019951
// UM740335899US
// 9405511108435891385343
// UA930012758US
// 9400111108400861167646
// 9400111108036886154271
// 911492037294201382323
// 2327843836





//end