import { post } from '@components/utils/ApiClient';
import { firebaseEmail, firebasePassword } from '@constants/firebase';
import { linebotServer } from '@constants/sys.constants';
import { db, signIn } from '@lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
export const AddCalendar = async (eventname, type, desc, startdatetime, enddatetime) => {

    let summary = eventname + ' ( ' + type + ' )';
    // let location = data.location;
    let description = desc;
    let start = startdatetime + ':00';
    // 2020-03-27T18:30
    let end = enddatetime + ':00';
    // console.log("sum:" + summary + ' desc:' + description + ' start:' + start + ' end:' + end)
    const _json = {
        eventname: summary,
        description: description,
        startdatetime: start,
        enddatetime: end
    };
    return await post(linebotServer + '/addCalendar', _json);
};

export async function deleteDateInCalendar(name, startdate, enddate) {
    const data = await signIn(firebaseEmail, firebasePassword).then(async () => {
        let date = new Date(startdate);
        const eventQuery = doc(db, 'Calendar', (date.getFullYear()) + '');
        const events = await getDoc(eventQuery);
        let calendar = events.data();
        for (let i = date.getMonth(); i <= 11; i++) {
            let thismonth = calendar.months[i];
            for (let l = 0; l < thismonth.days.length; l++) {
                const thisday = thismonth.days[l];
                let nickname = thisday.name.substring(0, thisday.name.indexOf(' ('));
                let start = new Date(thisday.startdatetime.seconds * 1000);
                let end = new Date(thisday.enddatetime.seconds * 1000);
                console.log(nickname === name && startdate.getDate() === start.getDate() && startdate.getMonth() === start.getMonth() && enddate.getDate() === end.getDate() && enddate.getMonth() === end.getMonth());
                if (nickname === name && startdate.getDate() === start.getDate() && startdate.getMonth() === start.getMonth() && enddate.getDate() === end.getDate() && enddate.getMonth() === end.getMonth()) {
                    thismonth.days.splice(l, 1);
                }
            }
        }
        await updateDoc(eventQuery, calendar);
        return { resp: 'Success' };
    });
    return data;
}

export async function SearchCalendarFromName(name) {
    const data = await signIn(firebaseEmail, firebasePassword).then(async () => {
        let myLeave = [];
        let date = new Date();
        const eventQuery = doc(db, 'Calendar', (date.getFullYear()) + '');
        const events = await getDoc(eventQuery);
        let calendar = events.data();

        for (let i = date.getMonth(); i <= 11; i++) {
            let thismonth = calendar.months[i];

            for (let l = 0; l < thismonth.days.length; l++) {
                // console.log(thismonth.days[l]);
                const thisday = thismonth.days[l];
                let nickname = thisday.name.substring(0, thisday.name.indexOf(' ('));
                let endday = new Date(thisday.enddatetime.seconds * 1000);
                if (nickname === name && endday.getDate() >= date.getDate()) {

                    const data = {
                        title: thisday.name,
                        start: new Date(thisday.startdatetime.seconds * 1000).toISOString(),
                        end: new Date(thisday.enddatetime.seconds * 1000).toISOString(),
                        description: thisday.description === undefined ? '' : thisday.description,
                        location: thisday.location === undefined ? '' : thisday.location,
                        type: thisday.type === undefined ? '' : thisday.type,
                        allDay: false,
                    };
                    myLeave.push(data);

                }
            }
        }
        return myLeave;
    });
    return data;
}

