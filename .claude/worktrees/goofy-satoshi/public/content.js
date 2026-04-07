(() => {
  const sidebarId = 'my-sidebar';
  const animationDuration = 300; // Duration of the animation in milliseconds

  const sendDataToBackground = (data) => {
    chrome.runtime.sendMessage({ action: 'saveData', data });
  };

  const notifyBackground = (data) => {
    if (data=="DATA_AVAILABLE") {
      chrome.runtime.sendMessage({ action: 'avaData', data });
    }else{
      chrome.runtime.sendMessage({ action: 'noData', data });
    }
   
  };

  const sendTokenToBackground = (token) => {
    chrome.runtime.sendMessage({ action: 'saveToken', token });
  };

  // Function to create the sidebar iframe
  const createSidebar = () => {
    const sidebar = document.createElement('iframe');
    sidebar.id = sidebarId;
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '400px';
    sidebar.style.height = '100%';
    sidebar.style.border = 'none';
    sidebar.style.zIndex = '99999';
    sidebar.style.transition = `transform ${animationDuration}ms ease-in-out`;
    sidebar.style.transform = 'translateX(100%)';
    sidebar.src = chrome.runtime.getURL('index.html');

    document.body.appendChild(sidebar);
    requestAnimationFrame(() => {
      sidebar.style.transform = 'translateX(0)';
    });
  };

  const removeSidebar = () => {
    const sidebar = document.getElementById(sidebarId);
    if (sidebar) {
      sidebar.style.transform = 'translateX(100%)';
      setTimeout(() => {
        sidebar.remove();
      }, animationDuration);
    }
  };

  let existingSidebar = document.getElementById(sidebarId);
  if (existingSidebar) {
    removeSidebar();
  } else {
    const extractors = {
      'amazon.com': () => {
        const productName = document.querySelector('#productTitle')?.innerText || "";
        const getImg = document.querySelector('img#landingImage')?.src || "";
        const price = document.querySelector('span.a-price-whole')?.innerText || "";
        return productName ? { site: 'amazon.com', data: { productImg: getImg, productName, price: `$${price}` } } : null;
      },
      'aliexpress.com': () => {
        const productName = document.querySelector('h1[data-pl="product-title"]')?.textContent || "";
        const getImg = document.querySelector('img.magnifier--image--EYYoSlr.magnifier--zoom--RzRJGZg')?.src || "";
        const price = document.querySelector('span.price--currentPriceText--V8_y_b5.pdp-comp-price-current.product-price-value')?.innerText || "";
        return productName ? { site: 'aliexpress.com', data: { productImg: getImg, productName, price } } : null;
      },
      'ebay.com': () => {
        console.log(document.querySelector('.x-item-title__mainTitle span.ux-textspans.ux-textspans--BOLD'));
        
        const productName = document.querySelector('.x-item-title__mainTitle span.ux-textspans.ux-textspans--BOLD')?.innerText ||"";
        const getImg = document.querySelector('.ux-image-carousel-item.image.active img')?.src || "";
        const price = document.querySelector('.x-price-primary span.ux-textspans')?.innerText || "";
        return productName ? { site: 'ebay.com', data: { productImg: getImg, productName, price } } : null;
      },
      'walmart.com': () => {
        const productName = document.querySelector('h1.lh-copy.dark-gray.mv1.f3.mh0-l.mh3.b')?.textContent || "";
        const getImg = document.querySelector('img.noselect.db')?.src || "";
        const price = document.querySelector('span[itemprop="price"]')?.textContent || "";
        return productName ? { site: 'walmart.com', data: { productImg: getImg, productName, price } } : null;
      },
      'jumia.com.ng': () => {
        const productName = document.querySelector('.-pls.-prl h1.-fs20')?.innerText || "";
        const getImg = document.querySelector('img.-fw.-fh')?.src || "";
        const price = document.querySelector('span.-b.-ubpt.-tal.-fs24.-prxs')?.innerHTML || "";
        return productName ? { site: 'jumia.com.ng', data: { productImg: getImg, productName, price } } : null;
      }
    };

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'iconClicked') {
        console.log('CLICKED ME');
        window.postMessage({ type: 'FROM_EXTENSION', text: message.text }, '*');
      }
    });

    const domain = window.location.hostname;
    const extractor = Object.keys(extractors).find(key => domain.includes(key));
    if (extractor) {
      const data = extractors[extractor]();
      if (data) {
        console.log(`Extracted data from ${domain}:`, data);
        sendDataToBackground(data);
        notifyBackground("DATA_AVAILABLE")
        createSidebar();
      } else {
        console.log(`No specific data found on ${domain}.`);
        notifyBackground("NO_DATA")
        createSidebar();
      }
    } else {
      console.log(`No extractor found for ${domain}.`);
      createSidebar();
    }
  }

  window.addEventListener('message', (event) => {
    if (event.data === 'close-sidebar') {
      removeSidebar();
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_URL") {
      sendResponse({ url: window.location.href });
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request, "REQU");
    if (request.token) {
      chrome.storage.local.set({ authToken: request.token }, () => {
        console.log("Token stored.");
      });
      sendResponse({ status: "Token stored." });
    }
  });

  window.addEventListener("message", (event) => {
    console.log(event, "EVENT");
    if (event.source !== window) return;
    if (event.data && event.data.token) {
      chrome.storage.local.set({ authToken: event.data.token }, () => {
        console.log("Token received from website and stored.");
      });
    }
  });

  const token = localStorage.getItem('token');
  if (token) {
    sendTokenToBackground(token);
  } else {
    console.log("Token not found in localStorage.");
  }
})();
