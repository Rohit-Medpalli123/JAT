chrome.action && chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL('panel.html');
  chrome.tabs.create({ url });
});

