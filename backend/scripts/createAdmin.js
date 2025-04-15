const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Admin model
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const adminData = {
    email: 'admin@raktsetu.com',
    password: 'admin123',
    name: 'Admin'
};

async function createAdmin() {
    try {
        // Check if admin exists
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        
        if (existingAdmin) {
            // Update admin password
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            await Admin.updateOne(
                { email: adminData.email },
                { $set: { password: hashedPassword } }
            );
            console.log('Admin password reset successfully');
        } else {
            // Create new admin
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            const admin = new Admin({
                email: adminData.email,
                password: hashedPassword,
                name: adminData.name
            });
            await admin.save();
            console.log('Admin created successfully');
        }

        console.log('\nAdmin Credentials:');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

createAdmin(); 