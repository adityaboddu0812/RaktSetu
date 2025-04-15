const mongoose = require('mongoose');
const Donor = require('./models/Donor');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const dummyDonors = [
    {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "Password123",
        bloodGroup: "A+",
        phone: "9876543210",
        address: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        isAvailable: true
    },
    {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "Password123",
        bloodGroup: "B+",
        phone: "9876543211",
        address: "456 Park Avenue",
        city: "Delhi",
        state: "Delhi",
        isAvailable: true
    },
    {
        name: "Raj Kumar",
        email: "raj.kumar@example.com",
        password: "Password123",
        bloodGroup: "O+",
        phone: "9876543212",
        address: "789 Lake Road",
        city: "Bangalore",
        state: "Karnataka",
        isAvailable: true
    },
    {
        name: "Priya Patel",
        email: "priya.patel@example.com",
        password: "Password123",
        bloodGroup: "AB+",
        phone: "9876543213",
        address: "321 Hill View",
        city: "Pune",
        state: "Maharashtra",
        isAvailable: true
    },
    {
        name: "Amit Shah",
        email: "amit.shah@example.com",
        password: "Password123",
        bloodGroup: "O-",
        phone: "9876543214",
        address: "567 River Side",
        city: "Chennai",
        state: "Tamil Nadu",
        isAvailable: true
    }
];

async function seedDonors() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing donors
        await Donor.deleteMany({});
        console.log('Cleared existing donors');

        // Hash passwords and create donors
        const donorsWithHashedPasswords = await Promise.all(
            dummyDonors.map(async (donor) => {
                const hashedPassword = await bcrypt.hash(donor.password, 10);
                return {
                    ...donor,
                    password: hashedPassword
                };
            })
        );

        // Insert donors
        const insertedDonors = await Donor.insertMany(donorsWithHashedPasswords);
        console.log('Added dummy donors:', insertedDonors.map(d => ({ name: d.name, email: d.email, bloodGroup: d.bloodGroup })));

        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection) {
            await mongoose.connection.close();
        }
    }
}

// Run the function
seedDonors(); 