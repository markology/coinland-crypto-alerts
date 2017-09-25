import axios from 'axios';

Notification.requestPermission();

const getStorage = (cb) => {
  chrome.storage.sync.get(
    'myAlarms',
    ({myAlarms}) => {
      cb(myAlarms);
    });
};

const buildMarketSummaries = function (summaries) {
  const marketSummaries = {};
  summaries.forEach((summary) => {
    const summaryConversion = summary.MarketName.split('-');
    const ico = summaryConversion[1];
    marketSummaries[ico] = {Last: summary.Last};
  });

  return marketSummaries;
};

const getMarketSummaries = function () {
  return axios.get('http://18.221.164.218:3000/api/bittrex/getmarketsummaries');
};

const update = () => {
  setTimeout(() => {
    getMarketSummaries().then((msRes) => {
      const marketSummaries = buildMarketSummaries(msRes.data.result);
      getStorage((d) => {
        Object.keys(d).forEach((coin) => {
          const alarms = d[coin];

          alarms.forEach((alarm) => {
            let tripAlarm = false;
            const coinLast = marketSummaries[coin].Last;

            if (alarm.operator === '>') {
              tripAlarm = coinLast > alarm.btcValue;
            } else if (alarm.operator === '<') {
              tripAlarm = coinLast < alarm.btcValue;
            } else {
              tripAlarm = coinLast === alarm.btcValue;
            }

            if (tripAlarm) {
              /*eslint-disable no-new*/
              new Notification(`${coin} is now ${coinLast} which is ${alarm.operator} ${alarm.btcValue}`);
            }
          });
        });

        update();
      });
    });
  }, 30000);
};

update();
