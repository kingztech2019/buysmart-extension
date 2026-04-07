(() => {
    const sidebarId = 'my-sidebar';
    const animationDuration = 300; // Duration of the animation in milliseconds
  
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
      sidebar.style.zIndex = '9999';
      sidebar.style.transition = `transform ${animationDuration}ms ease-in-out`;
      sidebar.style.transform = 'translateX(100%)';
      sidebar.src = chrome.runtime.getURL('unsupported.bundle.js');
      
      // Append the sidebar and animate it in
      document.body.appendChild(sidebar);
      requestAnimationFrame(() => {
        sidebar.style.transform = 'translateX(0)';
      });
    };
  
    // Remove existing sidebar if present
    let existingSidebar = document.getElementById(sidebarId);
    if (existingSidebar) {
      existingSidebar.remove();
    } else {
      createSidebar();
    }
  
    // Listen for messages from the iframe
    window.addEventListener('message', (event) => {
      if (event.data === 'close-sidebar') {
        const sidebar = document.getElementById(sidebarId);
        if (sidebar) {
          sidebar.style.transform = 'translateX(100%)';
          setTimeout(() => {
            sidebar.remove();
          }, animationDuration);
        }
      }
    });
  })();
  