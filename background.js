chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getCookies') {
      chrome.cookies.getAll({ url: message.url }, (cookies) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          sendResponse({ cookies: [] });
          return;
        }
        sendResponse({ cookies });
      });
      return true;
    }
});
  