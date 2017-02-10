const Later = require('later');
const Moment = require('moment');
const Chore = require('../models/chore');
const Journal = require('../models/journal');

const getNextOccurrence = (scheduleText) => {
    const scheduleRule = Later.parse.text(scheduleText);
    const nextOccurrence = Later.schedule(scheduleRule).next(1);
    return Moment(nextOccurrence).toISOString();
};

const updateChoresInJournal = (userId) => {
    Chore.getAllChores(userId)
        .then(allChores => {
            return Journal.getPendingEntriesForChoreList(userId, allChores.map(chore => chore.id))
                .then(upToDateChores => {
                    const ignoreIDs = upToDateChores.map(journalEntry => journalEntry.chore_id);
                    const choresToUpdate = allChores
                        .map(chore => ignoreIDs.indexOf(chore.id) === -1 ? chore : null)
                        .filter(c => c !== null);
                    return Promise.resolve(choresToUpdate);
                });
        })
        .then(choresToUpdate => {
            choresToUpdate.forEach(chore => {
                const nextOccurrence = getNextOccurrence(chore.recurrence);
                Journal.createEntry(userId, 'chore', chore.message, nextOccurrence, chore.sensor_id, chore.id);
            });
        });
};

module.exports = {
    getNextOccurrence,
    updateChoresInJournal,
};
