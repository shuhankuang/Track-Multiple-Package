const AF_HOST = 'https://track.aftership.com/api'
function af_detectCouriers (tracking_number) {
  // tracking_number = '9374889675091115019951'
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
  // tracking_number = '9374889675091115019951'
  // courier = 'usps'
  let url =  `${AF_HOST}/direct-tracking?lang=en`
  console.log(url)
  let formData = {
    courier,
    trackingNumbers: tracking_number
  }
  let opts = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(formData)
  }
  // console.log(opts)
  let response = UrlFetchApp.fetch(url, opts)
  let json = JSON.parse(response.getContentText())
  // console.log(json)
  return json
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