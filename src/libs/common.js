
//String 转 Date

export function stringToDate(str) {

    let currentStr = str;

    return new Date(currentStr.replace(/-/g,'/'));
}

//String 转 Timestamp

export function stringToTimestamp(str) {
    
    let currentStr = str;

    let date = new Date(currentStr.replace(/-/g,'/'));

    return date.getTime();
}

//Timestamp 转 Date

export function timestampToDate(timestamp) {
    let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() < 10 ? '0'+ date.getDate() : date.getDate()+' ';
    var h = date.getHours()< 10 ? '0' + date.getHours() : date.getHours();
    var m = date.getMinutes()< 10 ? '0' + date.getMinutes() : date.getMinutes();
    var s = date.getSeconds()< 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y+M+D+h+':'+m+':'+s;
    
}
export default {
    stringToDate,  //String 转 Date
    stringToTimestamp,  //String 转 Timestamp
    timestampToDate   //Timestamp 转 Date
}