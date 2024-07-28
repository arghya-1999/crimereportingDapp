import CryptoJS from 'crypto-js';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    }

    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    let account;
    let complainantReport;

    const secretKey = 'my-secret-key';

    const encrypt = (text) => {
        return CryptoJS.AES.encrypt(text, secretKey).toString();
    };

    const decrypt = (ciphertext) => {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    };

    const init = async () => {
        const accounts = await web3.eth.requestAccounts();
        account = accounts[0];

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ComplainantReport.networks[networkId];
        complainantReport = new web3.eth.Contract(
            ComplainantReport.abi,
            deployedNetwork && deployedNetwork.address,
        );

        loadReports();
    };

    const loadReports = async () => {
        const reportCount = await complainantReport.methods.reportCount().call();
        const reportsList = document.getElementById('reportsList');
        reportsList.innerHTML = '';

        for (let i = 1; i <= reportCount; i++) {
            const report = await complainantReport.methods.getReport(i).call();
            const decryptedDescription = decrypt(report[1]);
            const li = document.createElement('li');
            let statusHistory = '';
            for (let status of report[4]) {
                statusHistory += `<p>Status: ${status.status}, Timestamp: ${new Date(status.timestamp * 1000).toLocaleString()}, Updated By: ${status.updatedBy}, Reason: ${status.reason}</p>`;
            }
            li.innerHTML = `
                <p>ID: ${report[0]}</p>
                <p>Description: ${decryptedDescription}</p>
                <p>Reporter: ${report[2] === '0x0000000000000000000000000000000000000000' ? 'Anonymous' : report[2]}</p>
                <p>Timestamp: ${new Date(report[3] * 1000).toLocaleString()}</p>
                ${statusHistory}
            `;
            reportsList.appendChild(li);
        }
    };

    document.getElementById('reportForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const encryptedDescription = encrypt(description);
        const isAnonymous = document.getElementById('anonymous').checked;
        await complainantReport.methods.createReport(encryptedDescription, isAnonymous).send({ from: account });
        loadReports();
    });

    init();
});
