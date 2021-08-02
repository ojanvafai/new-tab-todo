chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL("page.html")
  const existingTabs = await chrome.tabs.query({ url });
  if (existingTabs.length) {
    const lastFocusedWindow = await chrome.windows.getLastFocused();
    const tab = existingTabs.find(x => x.windowId === lastFocusedWindow.id) || existingTabs[0];
    chrome.tabs.highlight({tabs: tab.index, windowId: tab.windowId});
  } else {
    await chrome.tabs.create({ url });
  }
});
