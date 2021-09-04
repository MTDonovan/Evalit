const months = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"
];

const formatDate = date =>
      `${date.getDate()} - ${months[date.getMonth()]} - ${date.getFullYear()}`;

const calcDays = days =>
      formatDate(new Date
                 (new Date().setDate
                  (new Date().getDate() + days)));

module.exports = {
    today: calcDays
};
