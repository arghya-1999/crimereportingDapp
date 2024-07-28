import CryptoJS from 'crypto-js';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    }

    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    let account;
    let policeRegister;

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
        const deployedNetwork = PoliceRegister.networks[networkId];
        policeRegister = new web3.eth.Contract(
            PoliceRegister.abi,
            deployedNetwork && deployedNetwork.address,
        );

        // Check if the account is police
        const isPolice = await policeRegister.methods.police(account).call();
        if (!isPolice) {
            alert('You do not have the necessary permissions to access this functionality.');
            return;
        }

        loadRegistrations();
    };

    const loadRegistrations = async () => {
        const registrationCount = await policeRegister.methods.registrationCount().call();
        const registrationsList = document.getElementById('registrationsList');
        registrationsList.innerHTML = '';

        for (let i = 1; i <= registrationCount; i++) {
            const registration = await policeRegister.methods.getRegistration(i).call();
            const decryptedDescription = decrypt(registration[1]);
            const li = document.createElement('li');
            let statusHistory = '';
            for (let status of registration[5]) {
                statusHistory += `<p>Status: ${status.status}, Timestamp: ${new Date(status.timestamp * 1000).toLocaleString()}, Updated By: ${status.updatedBy}, Reason: ${status.reason}</p>`;
            }
            li.innerHTML = `
                <p>ID: ${registration[0]}</p>
                <p>Description: ${decryptedDescription}</p>
                <p>Reporter: ${registration[2]}</p>
                <p>Registrar: ${registration[3]}</p>
                <p>Timestamp: ${new Date(registration[4] * 1000).toLocaleString()}</p>
                ${statusHistory}
            `;
            registrationsList.appendChild(li);
        }
    };

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const reportId = document.getElementById('reportId').value;
        const registerDescription = document.getElementById('registerDescription').value;
        const encryptedDescription = encrypt(registerDescription);
        const reporterAddress = document.getElementById('reporterAddress').value;
        await policeRegister.methods.registerComplaint(reportId, encryptedDescription, reporterAddress).send({ from: account });
        loadRegistrations();
    });

    init();
});
