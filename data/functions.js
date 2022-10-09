module.exports.convertDate = (date, time) => {
    let tempDate =  new Date(date.slice(0,4), date.slice(5,7) - 1, date.slice(8,10), time.slice(0,2), time.slice(3,5))
    return tempDate
}