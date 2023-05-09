
import { formatISOString } from '@components/utils/Datetime';
import { firebaseEmail, firebasePassword } from '@constants/firebase';
import { db, signIn } from '@lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';


export async function getUserFromFirebase(userlineid) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        const user = query(collection(db, 'LineUsers'), where('id', '==', userlineid));
        const querySnapshot = await getDocs(user);
        let data;
        querySnapshot.forEach((doc) => {
            data = {
                id: doc.data().id,
                name: doc.data().name,
                tier: doc.data().tier,
                fullname: doc.data().fullname,
                annualleaveremain: doc.data().annualleavehour - doc.data().annualleaveuse,
                sickleaveuse: doc.data().sickleaveuse
            };

        });
        return data;
    });
    return GetData;
}

export async function getUserByDocFromFirebase(name) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        const docRef = doc(db, 'LineUsers', name);
        const docSnap = await getDoc(docRef);
        return docSnap.data();
    });
    return GetData;
}

export async function getCalendarByFromFirebase(yearlist, data) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        const eventRef = collection(db, 'Calendar');
        const eventQuery = query(eventRef, where('year', 'in', yearlist));
        const events = await getDocs(eventQuery);
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        events.forEach((doc) => {
            for (let i = 0; i < months.length; i++) {
                let month = months[i];
                doc.data().months.forEach(thismonth => {

                    if (thismonth.month === month) {
                        for (let l = 0; l < thismonth.days.length; l++) {
                            let eventone = {
                                title: thismonth.days[l].name,
                                start: new Date(thismonth.days[l].startdatetime.seconds * 1000).toISOString(),
                                end: new Date(thismonth.days[l].enddatetime.seconds * 1000).toISOString(),
                                description: thismonth.days[l].description === undefined ? '' : thismonth.days[l].description,
                                location: thismonth.days[l].location === undefined ? '' : thismonth.days[l].location,
                                type: thismonth.days[l].type === undefined ? '' : thismonth.days[l].type,
                                allDay: false,

                            };

                            data.push(eventone);
                        }
                    }
                });




            }
        });

        return data;
    });
    return GetData;
}



export async function getLeveTypeFromFirebase() {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        let leaveType = [];
        const leaveDoc = doc(db, 'Intents', 'LeaveType');
        const leaveSnap = await getDoc(leaveDoc);
        leaveType = leaveSnap.data().data;
        return leaveType;

    });
    return GetData;
}

export async function getLocationFromFirebase() {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        const locationDoc = doc(db, 'Intents', 'Location');
        const locationSnap = await getDoc(locationDoc);
        return locationSnap.data();

    });
    return GetData.data;
}

export async function getUserListByTierFromFirebase(tierlist) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        let userlist = [];
        const user = query(collection(db, 'LineUsers'), where('tier', 'in', tierlist));
        const userSnapshot = await getDocs(user);
        userSnapshot.forEach((doc) => {

            userlist.push(doc.data().name);
        });
        return userlist;

    });
    return GetData;
}

export async function getIdByTierFromFirebase(tier) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        const user = query(collection(db, 'LineUsers'), where('tier', '==', tier));
        const querySnapshot = await getDocs(user);
        let idlist = [];
        querySnapshot.forEach(async (doc) => {
            idlist.push(doc.data().id);
        });
        return idlist;

    });
    return GetData;
}


export async function getSettingFromFirebase(docname) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        const settingRef = doc(db, 'Setting', docname);
        const settingSnap = await getDoc(settingRef);
        return settingSnap.data();
    });
    return GetData;
}

export async function getHolidayByYearFromFirebase(year) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        const holidaysRef = doc(db, 'Holidays', year);
        const holidaysSnapshot = await getDoc(holidaysRef);


        return holidaysSnapshot.data();
    });
    return GetData;
}

export async function getWaitingApproveByTierListFromFirebase(tierlist, nameAction) {


    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        let approveList = [];
        const waitingApproveRef = collection(db, 'WaitingApprove');
        const waitingApprove = query(waitingApproveRef, where('tieruser', 'in', tierlist));
        const waitingApproveSnapshot = await getDocs(waitingApprove);
        waitingApproveSnapshot.forEach((doc) => {
            let approve = {
                id: doc.data().id,
                name: doc.data().name,
                description: doc.data().description,
                category: doc.data().category,
                type: doc.data().type,
                tieruser: doc.data().tieruser,
                startdatetime: doc.data().startdatetime,
                enddatetime: doc.data().enddatetime,
                docid: doc.id,
                actionby: nameAction,
                requestdatetime: doc.data().requestdatetime,
                fullname: doc.data().fullname=== undefined?'':doc.data().fullname,
            };
            approveList.push(approve);
            // console.log(doc.id, " => ", doc.data());
        });
        return approveList;
    });
    return GetData;
}




export async function addWaitingApproveToFirebase(category, leaveType, lineid, name, startdatetime, enddatetime, desc, tier) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        await addDoc(collection(db, 'WaitingApprove'), {
            category: category,
            type: leaveType,
            id: lineid,
            name: name,
            startdatetime: formatISOString(startdatetime),
            enddatetime: formatISOString(enddatetime),
            description: desc,
            tieruser: tier,
            requestdatetime: formatISOString(new Date())
        });
        return 'Success';
    });
    return GetData;
}
export async function addWaitingApproveRegisterToFirebase(category, leaveType, lineid, name, fullname) {

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        let data ={
            category: category,
            type: leaveType,
            id: lineid,
            name: name,
            tieruser:'new',
            fullname: fullname,  
            requestdatetime: formatISOString(new Date())
        };

        console.log(data);
        await addDoc(collection(db, 'WaitingApprove'),data );
        return 'Success';
    });
    return GetData;
}

export async function addHistoryFirebase(type, isApprove, namedoc, data) {

    await signIn(firebaseEmail, firebasePassword).then(async () => {
        let col = collection(db, 'History', type, isApprove ? 'Approve' : 'Reject');
        // console.log(data)
        await setDoc(doc(col, namedoc), data);
    });

}

export async function addDatatoFirebaseCalendar(title, start, end, desc, location,allPerson,type) {
    await signIn(firebaseEmail, firebasePassword).then(async () => {
        
        let date = new Date(start);
        let calendar;
        let year = date.getFullYear();
        const eventQuery = doc(db, 'Calendar', year + '');
        const events = await getDoc(eventQuery);
        calendar = events.data();

        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


        calendar.months.forEach(async month => {

            if (month.month === months[date.getMonth()]) {

                let data = {
                    type: type,
                    description: desc,
                    location: location,
                    name: title,
                    startdatetime: new Date(start),
                    enddatetime: new Date(end),
                    personlist: allPerson
                };

                month.days.push(data);



            }

        });

        await updateDoc(eventQuery, calendar);
    });
}



export async function addApproveToFirebaseCalendar(title, start, end, type, description) {
    await signIn(firebaseEmail, firebasePassword).then(async () => {
        let date = new Date(start);
        // const eventRef = collection(db, "Calendar");
        // const eventQuery = query(eventRef, where('year', 'in', date.getFullYear()));
        // const events = await getDocs(eventQuery);
        let calendar;
        const eventQuery = doc(db, 'Calendar', date.getFullYear() + '');
        const events = await getDoc(eventQuery);
        calendar = events.data();
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // events.forEach((doc) => {
        //   list =doc.data();
        // })

        calendar.months.forEach(month => {
            if (month.month === months[date.getMonth()]) {

                let data = {
                    type: type,
                    name: title,
                    startdatetime: new Date(start),
                    enddatetime: new Date(end),
                    description: description
                };
                month.days.push(data);
            }
        });

        // month[months[date.getMonth()]].push(data);

        await updateDoc(eventQuery, calendar);
        // 
    });
}

export async function addNewUserToFirebaseCalendar(name, fullname, id, tier) {
    await signIn(firebaseEmail, firebasePassword).then(async () => {
        const lineReff = doc(db, 'LineUsers', name);
        await setDoc(lineReff, {
            name: name,
            fullname:fullname,
            id:id,
            tier: tier,
            annualleavehour:40,
            annualleaveuse:0,
            sickleaveuse:0,
        });
    });
    
}


export async function UpdateUserDocFromFirebase(docname, data) {
    await signIn(firebaseEmail, firebasePassword).then(async () => {
        const docRef = doc(db, 'LineUsers', docname);
        await setDoc(docRef, data);
    });
}


export async function deleteWaitingApproveByDocidFirebase(docid) {

    await deleteDoc(doc(db, 'WaitingApprove', docid));

}

