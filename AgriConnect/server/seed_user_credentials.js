const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function seedCredentials() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriconnect';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at:', mongoUri);

    // 1. Farmer: vishalssollapure@gmail.com / Vishal@123
    let farmer = await User.findOne({ email: 'vishalssollapure@gmail.com' });
    if (!farmer) {
      farmer = new User({
        name: 'Vishal Sollapure',
        email: 'vishalssollapure@gmail.com',
        phone: '7795511748',
        password: 'Vishal@123',
        role: 'farmer',
        location: 'Maharashtra, India',
        farmName: 'Vishal Agro Farms',
        farmType: 'Multi-crop Agriculture'
      });
      await farmer.save();
      console.log('✅ Created Farmer:', farmer.email);
    } else {
      farmer.name = 'Vishal Sollapure';
      farmer.phone = '7795511748';
      farmer.password = 'Vishal@123';
      farmer.role = 'farmer';
      farmer.location = farmer.location || 'Maharashtra, India';
      farmer.farmName = farmer.farmName || 'Vishal Agro Farms';
      await farmer.save();
      console.log('✅ Updated Farmer:', farmer.email);
    }

    // 2. Worker: vishalssollapure1748@gmail.com / Vishal@987
    let worker = await User.findOne({ email: 'vishalssollapure1748@gmail.com' });
    if (!worker) {
      worker = new User({
        name: 'Vishal Sollapure',
        email: 'vishalssollapure1748@gmail.com',
        phone: '7795511748',
        password: 'Vishal@987',
        role: 'worker',
        location: 'Maharashtra, India',
        skills: 'Harvesting, Sowing, General Agriculture',
        experience: '3+ Years',
        availability: 'Full Time',
        preferredRadius: '25 km'
      });
      await worker.save();
      console.log('✅ Created Worker:', worker.email);
    } else {
      worker.name = 'Vishal Sollapure';
      worker.phone = '7795511748';
      worker.password = 'Vishal@987';
      worker.role = 'worker';
      worker.location = worker.location || 'Maharashtra, India';
      worker.skills = worker.skills || 'Harvesting, Sowing, General Agriculture';
      worker.experience = worker.experience || '3+ Years';
      await worker.save();
      console.log('✅ Updated Worker:', worker.email);
    }

    // Verify authentication
    const testFarmer = await User.findOne({ email: 'vishalssollapure@gmail.com' }).select('+password');
    const farmerMatch = await testFarmer.matchPassword('Vishal@123');
    console.log('Farmer Auth Test (Vishal@123):', farmerMatch ? 'PASSED ✅' : 'FAILED ❌');

    const testWorker = await User.findOne({ email: 'vishalssollapure1748@gmail.com' }).select('+password');
    const workerMatch = await testWorker.matchPassword('Vishal@987');
    console.log('Worker Auth Test (Vishal@987):', workerMatch ? 'PASSED ✅' : 'FAILED ❌');

    await mongoose.connection.close();
    console.log('Database updated successfully.');
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedCredentials();
