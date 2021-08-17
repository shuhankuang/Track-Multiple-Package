const AF_HOST = 'https://track.aftership.com/api'
const AF_HOST_V2 = 'https://track.aftership.com/api/v2'

function af_detectCouriers (tracking_number) {
  let url =  `${AF_HOST}/courier-detect/${tracking_number}`
  console.log(url)
  let opts = {
    method: 'get',
    contentType: 'application/json',
    headers: {
      'Content-Type': 'application/json',
    }
  }
  // console.log(opts)
  let response = UrlFetchApp.fetch(url, opts)
  let json = JSON.parse(response.getContentText())
  // console.log(json)
  return json
}

function af_singleTracking (tracking_number, courier) {
  let url =  `${AF_HOST}/direct-tracking?lang=en`
  console.log(url)
  let formData = {
    courier,
    trackingNumbers: tracking_number
  }
  let opts = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(formData)
  }
  // console.log(opts)
  let response = UrlFetchApp.fetch(url, opts)
  let json = JSON.parse(response.getContentText())
  // console.log(json)
  return json
}

/**
 * 批量获取数据
 * @param {Array} tracking_numbers 数组
 * @param {Array} slugs 物流服务器商，有此参数表示单号独立
 */
function af_batchTracking (tracking_numbers, slugs = []) {
  console.log(tracking_numbers)
  tracking_numbers =  tracking_numbers ? tracking_numbers : ['9361289738009091755413', '9374889675091115019951']
  let url = `${AF_HOST_V2}/direct-trackings/batch`
  console.log(url)
  if(tracking_numbers.length < 1) {
    return false
  }
  let direct_trackings = []
  for(let i = 0; i < tracking_numbers.length; i++) {
    let num = tracking_numbers[i]
    direct_trackings.push({
      additional_fields: {},
      tracking_number: num
    })
  }
  let formData = {
    slugs: slugs,
    direct_trackings,
  }
  console.log(formData)
  let opts = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(formData)
  }
  // console.log(opts)
  // return
  let response = UrlFetchApp.fetch(url, opts)
  let json = JSON.parse(response.getContentText())
  console.log(json)
  return json
}

function af_parseBatchToHTML () {

}

function af_parseToHTML (response) {
  let data = response.data
  let checkpoints = data.checkpoints.reverse()
  // let tracking_link = data.courier_tracking_link || data.courier_redirect_link
  let html = ''
  html += `<br><b><font># ${data.tracking_number}</font></b> [ ${data.origin_courier_name} ]<br>`
  html += `- ${data.shipment_type}<br>`
  html += `- ${data.origin_country_name} <font color="#666666">to</font> ${data.destination_country_name}<br>`
  let estimatedDeliverTime_str = ``
  if(data.scheduled_delivery_date){
    let estimatedDeliverTime = new Date(data.scheduled_delivery_date).toLocaleDateString()
    estimatedDeliverTime_str = `<br>Estimated delivery: ${estimatedDeliverTime}`
  }
  html += `<br><b>Status: ${data.tag} (${data.delivery_time} Days)${estimatedDeliverTime_str}</b><br><br>`
  for(let i = 0; i < checkpoints.length; i++) {
    let obj = checkpoints[i]
    if(!obj){
      continue
    }
    let c_time
    if(obj && obj.checkpoint_time) {
      c_time = new Date(obj.checkpoint_time).toLocaleString()
    }else{
      c_time = 'n/a'
    }
    html += `<font color="#666666">${c_time}</font><br><b>${formatEmptyObj(obj, 'message')}</b><br>${formatEmptyObj(obj, 'location')}<br><br>`
  }

  return html
}