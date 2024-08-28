document.addEventListener('DOMContentLoaded', function() {
    const fieldsContainer = document.getElementById('fields');
    const infoElement = document.getElementById('info');
    const paramTab = document.getElementById('paramTab');
    const infoTab = document.getElementById('infoTab');
    const paramContent = document.getElementById('paramContent');
    const infoContent = document.getElementById('infoContent');

    function createRow(key = '', value = '') {
        let row = document.createElement('tr');

        let fieldCell = document.createElement('td');
        let fieldInput = document.createElement('input');
        fieldInput.type = 'text';
        fieldInput.value = key;
        fieldInput.className = 'field-input';
        fieldCell.appendChild(fieldInput);
        row.appendChild(fieldCell);

        let valueCell = document.createElement('td');
        let valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.value = value;
        valueInput.className = 'value-input';
        valueCell.appendChild(valueInput);
        row.appendChild(valueCell);

        let actionCell = document.createElement('td');
        let deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
            </svg>
            `;
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', function() {
            row.remove();
        });
        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);

        fieldsContainer.appendChild(row);
    }

    function showTab(tabId) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab#${tabId.replace('Content', 'Tab')}`).classList.add('active');
    }

    function displayInfo(url, method, status, cookies, headers) {
        let infoText = `URL: ${url}\n`;
        infoText += `Request Method: ${method}\n`;
        infoText += `Status Code: ${status}\n`;
        infoText += `Cookies:\n${cookies}\n`;
        infoText += `Access-Control-Allow-Credentials: ${headers['access-control-allow-credentials'] || 'N/A'}\n`;
        infoText += `Access-Control-Allow-Headers: ${headers['access-control-allow-headers'] || 'N/A'}\n`;
        infoText += `Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || 'N/A'}\n`;
        infoText += `Cache-Control: ${headers['cache-control'] || 'N/A'}\n`;
        infoText += `Content-Type: ${headers['content-type'] || 'N/A'}\n`;

        infoElement.textContent = infoText;
    }

    showTab('paramContent');

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        let url = new URL(tabs[0].url);
        let params = new URLSearchParams(url.search);

        params.forEach((value, key) => {
            createRow(key, value);
        });

        document.getElementById('save').addEventListener('click', function() {
            let newParams = new URLSearchParams();
            document.querySelectorAll('tr').forEach(row => {
                let keyInput = row.querySelector('.field-input');
                let valueInput = row.querySelector('.value-input');

                if (keyInput && valueInput) {
                    let key = keyInput.value.trim();
                    let value = valueInput.value.trim();
                    if (key) {
                        newParams.set(key, value);
                    }
                }
            });

            let newUrl = `${url.origin}${url.pathname}?${newParams.toString()}`;
            chrome.tabs.update(tabs[0].id, {
                url: newUrl
            });
        });

        document.getElementById('add').addEventListener('click', function() {
            createRow();
        });

        chrome.cookies.getAll({
            url: url.href
        }, function(cookies) {
            let cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('\n').trim();
            fetch(url.href, {
                    method: 'GET'
                })
                .then(response => {
                    let headers = {};
                    response.headers.forEach((value, key) => {
                        headers[key.toLowerCase()] = value;
                    });

                    displayInfo(
                        url.href,
                        'GET',
                        response.status,
                        cookieString,
                        headers
                    );
                })
                .catch(error => {
                    infoElement.textContent = 'Failed to fetch additional info: ' + error;
                });
        });

        paramTab.addEventListener('click', () => showTab('paramContent'));
        infoTab.addEventListener('click', () => showTab('infoContent'));
    });
});