let d = new Date();
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let monthTH =[ 'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
let monthFull= ['January','February','March','April','May','June','July','August','September','October','November','December'];
let days =['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const fullyear = d.getFullYear();
export const month = (d.getMonth() + 1).toString().length === 1 ? '0' + parseInt(d.getMonth() + 1) : d.getMonth() + 1;
export const month3 = months[d.getMonth() + 1];
export const day = ('' + d.getDate()).length === 1 ? '0' + d.getDate() : d.getDate();
export const hour =('' + d.getHours()).length === 1 ? '0' + d.getHours() : d.getHours(); 
export const min = ('' + d.getMinutes()).length === 1 ? '0' + d.getMinutes() : d.getMinutes();
export const sec = d.getSeconds();

export const date = '' + fullyear + month + day;
export const time = '' + hour + min + sec;
export const datetime = date + time;
export const today = fullyear + '-' + month + '-' + day;

export const todayISO = fullyear + '-' + month + '-' + day + 'T' + hour + ':' + min;
export const todayTime = hour + ':' + min;

export const startDateLeave = fullyear + '-' + month + '-' + day + 'T' + '09:30';
export const endDateLeave = fullyear + '-' + month + '-' + day + 'T' + '18:30';

export function plusTime(time, data) {
    let year = time.substr(0, 4);
    let month = time.substr(5, 2);
    let day = time.substr(8, 2);
    let hour = time.substr(11, 2);
    let min = time.substr(14, 2);
    let reserv = new Date(year, month, day, hour, min);
    reserv.setMinutes(reserv.getMinutes() + parseInt(data));
    let nexttime = new Date(reserv);
    let hourResp = nexttime.getHours();
    let minResp = nexttime.getMinutes();
    if (('' + minResp).length === 1) {
        minResp = '0' + minResp;
    }
    const todayTime = hourResp + ':' + minResp;

    return todayTime;
}

export function plusDateTime(date, plusmin) {
    let newdate = new Date(date);
    // console.log(date)
    // let year = date.substr(0, 4);
    // let month = date.substr(5, 2);
    // let day = date.substr(8, 2);
    // let hour = date.substr(11, 2);
    // let min = date.substr(14, 2);

    let year = newdate.getFullYear();
    let month = newdate.getMonth()<9?'0'+(newdate.getMonth()+1): newdate.getMonth()+1;
    let day = newdate.getDate()<9?'0'+newdate.getDate(): newdate.getDate();
    let hour = newdate.getHours()<9?'0'+newdate.getHours(): newdate.getHours();
    let min = newdate.getMinutes()<9?'0'+newdate.getMinutes(): newdate.getMinutes();
  
    let reserv = new Date(year, month, day, hour, min);
    reserv.setMinutes(reserv.getMinutes() + parseInt(plusmin));
    let nexttime = new Date(reserv);
    let hourResp = nexttime.getHours()<9?'0'+nexttime.getHours():nexttime.getHours();
    let minResp = nexttime.getMinutes()<9?'0'+nexttime.getMinutes():nexttime.getMinutes();
    if (('' + minResp).length === 1) {
        minResp = '0' + minResp;
    }
    let nextmonth = nexttime.getMonth()<9?'0'+(nexttime.getMonth()): (nexttime.getMonth());
    let nextdate = nexttime.getDate()<9?'0'+nexttime.getDate(): nexttime.getDate();
    const todayTime = hourResp + ':' + minResp;
    const todayISO = nexttime.getFullYear() + '-' + nextmonth + '-' + nextdate + 'T' + todayTime;
    // console.log(todayISO)
    return todayISO;
}
export function countDay(startdate,enddate) {
    const oneDay = 24 * 60 * 60 * 1000; //86400000
 
    let countdate =Math.round(Math.abs((startdate - enddate) / oneDay));
    //Math.round(Math.abs((startdate - enddate) / oneDay));
    return countdate;
}

export function convertDate(data) {
    data = data + '';
    let formatDate = '';
    let year1 = data.substr(0, 4);
    let month1 = months[parseInt(data.substr(4, 2)) - 1];
    let day1 = data.substr(6, 2);
    formatDate = day1 + ' - ' + month1 + ' - ' + year1;
    return formatDate;
}
export function convertTime(data) {
    data = data + '';
    let formatTime = '';
    let hour = data.substr(8, 2);
    let min = data.substr(10, 2);
    // let sec = data.substr(4,2);
    formatTime = hour + ':' + min;
    return formatTime;
}

export function formatISOString(data) {
    let d = new Date(data);

    const fullyear = d.getFullYear();
    const month = (d.getMonth() + 1).toString().length === 1 ? '0' + parseInt(d.getMonth() + 1) : d.getMonth() + 1;
    const day = ('' + d.getDate()).length === 1 ? '0' + d.getDate() : d.getDate();
    const hour = ('' + d.getHours()).length === 1 ? '0' + d.getHours() : d.getHours(); 
    const min = ('' + d.getMinutes()).length === 1 ? '0' + d.getMinutes() : d.getMinutes();
    const ISO = fullyear + '-' + month + '-' + day + 'T' + hour + ':' + min;
    return ISO;
}

export function formatThString(data){
    let d = new Date(data);
    const fullyear = d.getFullYear();
    const month3 =  monthTH[d.getMonth()];
    const day = d.getDate();
    const hour = ('' + d.getHours()).length === 1 ? '0' + d.getHours() : d.getHours();
    const min = ('' + d.getMinutes()).length === 1 ? '0' + d.getMinutes() : d.getMinutes();
    // const sec = d.getSeconds();
    
    let string = 'วันที่ '+day+' เดือน'+month3+' ปี '+fullyear+' เวลา '+hour+':'+min;
    return string;
}
export function convertMonth2Mohth3(month){
    return months[parseInt(month) ];
}

export function convertMonth2MohthFull(month){
    return monthFull[parseInt(month) ];
}
export function formatMMDDYYYYDate(date){

    let year = date.substr(0,4);    
    let month = date.substr(4,2);
    let day = date.substr(6,2);

    return month+'/'+day+'/'+year;
}

export function formatString2Date(data){
    data = data + '';
    let formatDate = '';
    let year1 = data.substr(0, 4);
    let month1 = data.substr(4, 2);
    let day1 = data.substr(6, 2);
    formatDate = year1 + '-' + month1 + '-' + day1;
    return formatDate;
}

export function isWeekend(data){
    console.log('Check weekend');
    let today = new Date(formatString2Date(data));
    console.log('It is', days[today.getDay()]);
    if(today.getDay() == 6 || today.getDay() == 0) {
        return true;
    }
    else {
        return false;
    }
    
}
