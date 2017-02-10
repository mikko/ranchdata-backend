const User = require('../models/user');
const Util = require('../util/journalUtil');

module.exports = () => {
    // Fetch all users
    User.getAllUserIDs()
        .then(users => {
            users.forEach(user => Util.updateChoresInJournal(user.id));
        });
};
