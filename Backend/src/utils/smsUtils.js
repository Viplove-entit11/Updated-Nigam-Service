// Generate a 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

// Send SMS to user
const sendSmsToUser = async (mobile, otp) => {
    const apiKey = "25FD9D1128C6C9";
    const senderId = "ENTITR";
    const message = `Your verification code is ${otp}. ${senderId}`;
    const contacts = `+91${mobile}`;
    const smsText = encodeURIComponent(message);

    const apiUrl = `https://sms.weblinto.com/smsapi/index?key=${apiKey}&campaign=0&routeid=6&type=text&contacts=${contacts}&senderid=${senderId}&msg=${smsText}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("SMS Sent:", data);
        return data;
    } catch (error) {
        console.error("Error sending SMS:", error);
        throw error;
    }
};

module.exports = {
    generateOTP,
    sendSmsToUser
}; 