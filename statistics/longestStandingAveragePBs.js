
const {forEach} = require('async-foreach');
const {query} = require('../core/database.js');
const {normalTable, nameWithLinkToWcaId, nameWithLinkToCompetitionId} = require('../core/util.js');
const md = require('../core/markdown');
const {events, eventNames, formatResult} = require('../core/wca.js');

module.exports = {
	title: 'Longest Standing Average PBs',

	query: () => `
		SELECT
			CAR.personId,
			personName,
			CAR.eventId,
			CAR.countryId,
			CAR.average average,
			DATE(CONCAT(year, '-', month, '-', day)) PBDate
		FROM (SELECT MIN(valueAndId) % 1000000000 id FROM ConciseAverageResults GROUP BY personId,eventId) PBs
		JOIN ConciseAverageResults CAR ON PBs.id = CAR.id 
		JOIN (SELECT personId,personName,eventId, MAX(date) mostRecent FROM ResultDates GROUP BY personId,personName,eventId) recent
			ON CAR.personId = recent.personId AND CAR.eventId = recent.eventId
		WHERE year(mostRecent) >= 2017
		ORDER BY PBDate
		LIMIT 100;
	`,

	run: function (cb) {
		let self = this;

		query(self.query(), (error, results, fields) => {
			if (error) {throw error;}

			let table = [['Person', 'Event', 'Country', 'Average', 'Date Set']].concat(results.map(row => {
				let person = nameWithLinkToWcaId(row.personName, row.personId);
				let event = eventNames[row.eventId];
				let average = formatResult(row.average, row.eventId, true);

				return [person, event, row.countryId, average, row.PBDate.toISOString().slice(0, 10)];
			}));

			let markdown = md.title(self.title) + md.table(table);

			cb(markdown);
		});
	}
};
