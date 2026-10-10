const bcrypt = require('bcryptjs');
bcrypt.hash('demo123', 10).then(h => console.log(h));
