const supportedWebsites = [
  'jumia.com.ng',
  'aliexpress.com',
  'amazon.com',
  'ebay.com',
  'walmart.com'
];

function sendMessageWithRetry(message, retries = 3) {
  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError && retries > 0) {
      setTimeout(() => sendMessageWithRetry(message, retries - 1), 1000);
    }
  });
}

chrome.action.onClicked.addListener((tab) => {
  if (!(tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
    console.log("Current tab URL:", tab.url);

    const isSupported = supportedWebsites.some(site => tab.url.includes(site));

    if (isSupported) {
      saveDataForSupportedSite(tab.url);
    } else {
      clearDataForUnsupportedSite();
      clearDataForNoDataSite()
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, (result) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      } else {
        console.log('Content script injected.');
      }
    });
  } else {
    console.log("Cannot inject content script into a chrome:// or chrome-extension:// URL.");
  }
});
 


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveData') {
    chrome.storage.local.set({ supportedSiteData: message.data }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving site data:', chrome.runtime.lastError);
      } else {
        console.log('Site data saved to local storage:', message.data);
      }
    });
  } else if (message.action === 'saveToken') {
    chrome.storage.local.set({ token: message.token }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving token:', chrome.runtime.lastError);
      } else {
        console.log('Token saved to local storage.');
      }
    });
  }else if (message.action=='noData') {
    chrome.storage.local.set({ noData: message.data }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving No Data:', chrome.runtime.lastError);
      } else {
        console.log('No data saved to local storage.');
      }
    });
    
  }else if (message.action=='avaData') {
    console.log(message,"MESG");
    
    clearDataForNoDataSite()
  }
});

function saveDataForSupportedSite(url) {
  const dataToSave = {
    site: url,
    message: 'You are on a supported website!'
  };

  chrome.storage.local.set({ supportedSiteData: dataToSave }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving site data:', chrome.runtime.lastError);
    } else {
      console.log('Site data saved to local storage:', dataToSave);
    }
  });
}

function clearDataForUnsupportedSite() {
  chrome.storage.local.remove('supportedSiteData', () => {
    if (chrome.runtime.lastError) {
      console.error('Error removing site data:', chrome.runtime.lastError);
    } else {
      console.log('Site data cleared for unsupported website.');
    }
  });
}

  function clearDataForNoDataSite() {
    chrome.storage.local.remove('noData', () => {
      if (chrome.runtime.lastError) {
        console.error('Error removing noData:', chrome.runtime.lastError);
      } else {
        console.log('Site data cleared for noData.');
      }
    });
}
