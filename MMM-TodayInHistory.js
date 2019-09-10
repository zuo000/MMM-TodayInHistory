Module.register("MMM-TodayInHistory", {
  defaults: {
    appId: '',
    maxEvents: 5
  },

  dom: null,
  allEvents: null,

  getScripts: function() {
    return ["moment.js"];
  },

  getStyles: function() {
    return ["MMM-TodayInHistory.css"];
  },

  start: function() {
    console.log("Starting module: " + this.name);

    this.events = null;
    this.getEvents();
  },

  getEvents: function() {
    var dateStr = moment().format('M/D');
    this.sendSocketNotification('TIH_GET_EVENTS', {
      appId: this.config.appId,
      date: dateStr
      });
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "TIH_GET_EVENTS_RET":
        this.processEvents(payload);
        this.dom = this.createInitDom();
        this.updateDom();
        break;
      case "TIH_GET_EVENT_CONTENT_RET":
        this.dom = this.processEventContent(payload);
        this.updateDom();
        var self = this;
        var onclick = function () {
          self.dom = self.createInitDom();
          self.updateDom();
          window.removeEventListener("click", onclick);
        };
        window.addEventListener("click", onclick);
        break;
      default:
        break;
    }
  },

  processEvents: function(data) {
    this.allEvents = data;
    this.events = this.getRandomArrayElements(data, this.config.maxEvents);
  },

  processEventContent: function(data) {
    var content = document.createElement("div");
    content.className = "event_content"
    content.innerText = "       " + data.content;

    return content;
  },

  getRandomArrayElements: function(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
  },

  createInitDom: function() {
    var table = document.createElement("table");
    table.className = "medium event_table "

    for (let e of this.events) {
      console.log(this.name + " get event:" + e.date + " ", e.title);
      var row = this.makeRow(e.date + ", " + e.title);
      var self = this;
      row.addEventListener("click", function () {
        self.dom = document.createElement("div");
        self.dom.innerHTML = "Hello, TodayInHistory is loading...";
        self.dom.className = "normal regular medium";
        self.updateDom();
        self.getEventContent(e.eid);
      });
      table.appendChild(row);
    }

    return table;
  },

  getDom: function() {
    return this.dom;
  },

  getEventContent: function(eventId) {
    this.sendSocketNotification('TIH_GET_EVENT_CONTENT', {
      appId: this.config.appId,
      eventId: eventId
      });
  },

  makeRow: function(text) {
    var self = this;

    var row = document.createElement("tr");
    row.className = "normal";
    var cell = document.createElement("td");
    cell.colSpan = 1;
    cell.innerHTML = text;
    row.appendChild(cell);

    return row;
  },
});
