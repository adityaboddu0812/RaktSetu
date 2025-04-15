const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://miniproject0812:Raktsetu%40123@cluster0.sememtb.mongodb.net/raktsetu?retryWrites=true&w=majority';

async function testHospitalLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Test email and password
        const email = 'abc@gmail.com';
        const password = 'aditya';

        // Find hospital
        const hospital = await Hospital.findOne({ email: email.toLowerCase() });
        
        if (!hospital) {
            console.log('No hospital found with email:', email);
            return;
        }

        console.log('Hospital found:', {
            id: hospital._id,
            email: hospital.email,
            name: hospital.name,
            isVerified: hospital.isVerified,
            hasPassword: !!hospital.password
        });

        // Test password
        const isValidPassword = await bcrypt.compare(password, hospital.password);
        console.log('Password validation result:', isValidPassword);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testHospitalLogin(); 