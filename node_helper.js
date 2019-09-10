const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node_helper for module: " + this.name);
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "TIH_GET_EVENTS":
        this.getEvents(payload);
        break;
      case "TIH_GET_EVENT_CONTENT":
        this.getEventContent(payload);
        break;
      default:
        break;
    }
  },

  getEvents: function(payload) {
    request({
      url: "https://api.shenjian.io/todayOnhistory/queryEvent?appid=" + payload.appId + "&date=" + payload.date,
      method: 'GET'
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        if (result.error_code == 0) {
          this.sendSocketNotification('TIH_GET_EVENTS_RET', result.data);
        }
        else {
          console.log("node_helper for module TodayInHistory get event failed, reason:" + result.reason);
        }
      }
    });
  },

  getEventContent: function(payload) {
    request({
      url: "https://api.shenjian.io/todayOnhistory/queryDetail/?appid=" + payload.appId + "&date=" + payload.eventId,
      method: 'GET',
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        if (result.error_code == 0) {
          this.sendSocketNotification('TIH_GET_EVENT_CONTENT_RET', result.data);
        }
        else {
          console.log("node_helper for module TodayInHistory get event content failed, reason:" + result.reason);
        }
      }
    });
  },

});
