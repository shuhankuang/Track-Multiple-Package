// 默认的参数
const PREFIX = 'ADDON_TRACK_' // 标记符号，若用统一的用户管理后台，那么可以用此字符进行区分
const TN = 'UM740335899US' // 临时的订单号
const APP_NAME = 'Trackr-Addon' // Trackr - Track a Package (Google Workspace)
const COUNTS = [0, 1, 3, 5, 10] // 插入物流信息的条数
const MAX_HISTORY_NUM = 3
const MAX_PER_MONTH = 30

// 默认的 HomeCard 设置
var default_params = {
  tracking_number: '', // 物流订单号
  couriers: [
    {text: '', value: 0}
  ], // 物流服务商
  reset_btn_disabled: false, // 重设按钮
  tracking_btn_disabled: true, // 追踪按钮
  tracking_response: undefined,
  tracking_info: ' ', // 物流信息 (拼接的)
  isHomePage: false // 是否首页
}
// 默认 SettingCard 设置
let default_setting = {
  num_select: 0, // 插入多少条物流信息
  show_hisotry: true, // 显示单号历史
}

var userProperties = PropertiesService.getUserProperties()
if(!userProperties.getProperty('setting')){
  userProperties.setProperty('setting', JSON.stringify(default_setting))
}


// getwebooster@gmail.com 用户的个人页面
// https://trackr.workaddons.com/subscribe/722b0c722539340c726a0c72653d3d0422003114371f0c727c0c72353d31393c0c726a0c723735242735323f3f2324352210373d31393c7e333f3d0c727c0c723120200c726a0c72042231333b227d1134343f3e0c727c0c72203c313e0c726a0c723d3f3e24383c290c722d72