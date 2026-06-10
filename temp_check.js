try {
  require('express');
  require('helmet');
  require('morgan');
  require('express-rate-limit');
  require('joi');
  console.log('Dependencies OK');
  require('./middleware/auth');
  require('./middleware/validate');
  console.log('Middleware OK');
  require('./routes/auth');
  require('./routes/users');
  require('./routes/hostels');
  require('./routes/bookings');
  console.log('Routes OK');
  console.log('All modules load successfully.');
} catch (e) {
  console.error('Load error:', e.message);
}
