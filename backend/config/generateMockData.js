const db = require('./db');
const { faker } = require('@faker-js/faker');

// Helper function to generate random water readings
const generateRandomReading = (min, max) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Helper function to generate random time in HH:mm:ss format
const generateRandomTime = () => {
  const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const seconds = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Function to create mock data for a specified number of users and populate the database
const generateMockData = (numUsers) => {
  // Generate Users
  const users = [];
  for (let i = 0; i < numUsers; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });
  }

  users.forEach((user, index) => {
    const userId = db.get('User').push(user).write().id;
    
    // Create a Household for each User
    const household = {
      id: index + 1,
      location: faker.address.city(),
      user_id: userId
    };
    db.get('Household').push(household).write();

    // Create HouseholdConfig
    const tankHeights = [1, 1.5, 2]; // meters
    const tankCapacities = [200, 300, 400]; // gallons
    const config = {
      household_id: household.id,
      tank_height: tankHeights[Math.floor(Math.random() * tankHeights.length)],
      tank_capacity: tankCapacities[Math.floor(Math.random() * tankCapacities.length)],
      peak_usage_hours: '15-16', // Example of peak usage range
      water_availability_hours: '5-7' // Example of water availability
    };
    db.get('HouseholdConfig').push(config).write();

    // Create one Sensor for the Household (since each household only has one sensor)
    const sensor = { id: 1, household_id: household.id };
    db.get('Sensor').push(sensor).write();

    // Generate SensorData for the first 6 months
    const months = [1, 2, 3, 4, 5, 6]; // Numeric months (1 to 6)
    months.forEach(month => {
      for (let day = 1; day <= 30; day++) { // Generate for 30 days each month
        const sensorData = [
          { time: generateRandomTime(), water_level: config.tank_height - generateRandomReading(0, 0.5), day, month, year: 2024, sensor_id: sensor.id },
          { time: generateRandomTime(), water_level: config.tank_height - generateRandomReading(0, 0.5), day, month, year: 2024, sensor_id: sensor.id },
          { time: generateRandomTime(), water_level: config.tank_height - generateRandomReading(0, 0.5), day, month, year: 2024, sensor_id: sensor.id }
        ];
        db.get('SensorData').push(...sensorData).write();
      }
    });
  });

  console.log(`Mock data generated for ${numUsers} users and 6 months!`);
};

// Run the function with a specified number of users (e.g., 5 users)
const numUsers = process.argv[2] ? parseInt(process.argv[2], 10) : 3; // Default to 3 if no argument is passed
generateMockData(numUsers);