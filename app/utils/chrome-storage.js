export const updateChromeStorage = (key, value) => (
  chrome.storage.sync.set({[key]: value})
);

export const getChromeStorage = (arrayOfKeys, cb) => (
  chrome.storage.sync.get(arrayOfKeys, cb)
);

export const removeChromeStorageAlarm = function (key, ico, index) {
  chrome.storage.sync.get(['myAlarms'], ({myAlarms}) => {
    myAlarms[ico].splice(index, 1);
    const tempAlarms = myAlarms;

    if (tempAlarms[ico].length === 0) {
      delete tempAlarms[ico];
    }

    this.setState({myAlarms: tempAlarms});
    return chrome.storage.sync.set({myAlarms: tempAlarms});
  });
};
