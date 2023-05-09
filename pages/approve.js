/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardActions, CardContent, CircularProgress, Container, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Skeleton, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { isWeekend, convertMonth2Mohth3, datetime, endDateLeave, formatThString, startDateLeave, convertMonth2MohthFull, formatMMDDYYYYDate, countDay } from '@components/utils/Datetime';

import { SheetKey, docSheet } from '@lib/googleSheet';
import { eng2TH } from '@components/utils/Leavetype';
import { addHistoryFirebase, deleteWaitingApproveByDocidFirebase, getHolidayByYearFromFirebase, getUserByDocFromFirebase, getUserFromFirebase, getWaitingApproveByTierListFromFirebase, UpdateUserDocFromFirebase, addApproveToFirebaseCalendar, addNewUserToFirebaseCalendar } from '@components/services/FirebaseService';
import CommonView from '@common/CommonView';
import { addNewUserSheet, addOTSheet, addSheet, deleteOTSheet, deleteSheet } from '@components/services/SheetService';
import { deleteDateInCalendar } from '@components/services/CalendarService';
import { CallNotiPerson } from '@components/services/LineBotService';
import CommonCard from '@common/CommonCard';
import { DatePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
export default function Approve(props) {
    const initialState = {
        name: '',
        id: '',
        tier: '',
        fullname: '',
        rejectDesc: '',
        loadingButton: false,
        startDateTime: startDateLeave,
        endDateTime: endDateLeave,
        description: '',
    };
    // console.log(props)
    const [state, setState] = useState(initialState);
    const [approveList, setApproveList] = useState([]);
    const [snackSuccess, setSnackSuccess] = React.useState({ open: false, desc: '' });
    const { api } = props;
    useEffect(() => {
        getUser();
    }, []);

    async function getUser() {
        const liff = (await import('@line/liff')).default;
        await liff.ready;
        const profile = await liff.getProfile();
        let userData = await getUserFromFirebase(profile.userId);
        // let userData = await getUserFromFirebase('Ud1beca7a0463576dcd7afe8d6576d423');

        let data;
        let approveList = [];

        data = {
            id: userData.id,
            name: userData.name,
            tier: userData.tier,
            fullname: userData.fullname,
            annualleaveremain: userData.annualleavehour - userData.annualleaveuse,
            sickleaveuse: userData.sickleaveuse
        };
        // });

        let tierSearch = ['admin', 'head', 'leader', 'normal', 'normalplus', 'new'];
        // console.log(data)
        if (data.tier === 'head') {
            tierSearch = ['leader', 'normalplus', 'head'];
        }
        else if (data.tier === 'leader') {
            tierSearch = ['normal'];
        }
        else if (data.tier === 'normalplus') {
            tierSearch = ['new'];
        }

        approveList = await getWaitingApproveByTierListFromFirebase(tierSearch, data.name);
        setApproveList(approveList);
        setState({
            ...state,
            name: data.name,
            id: data.id,
            tier: data.tier,
            fullname: data.fullname,
            annualleaveremain: data.annualleaveremain,
            sickleaveuse: data.sickleaveuse
        });


    }

    async function actionApproveButton(data) {
        setState({ ...state, loadingButton: true });
        let desc = 'คำขอของคุณได้ถูกอนุมัติแล้ว';
        if (data.category === 'Leave') {
            let resp = await approveLeave(data);
            if (data.type === 'Annual Leave') {
                desc = desc + ' คุณเหลือชั่วโมงการลา ' + resp.hourAll + ' ชั่วโมง';
            }
            await addHistoryFirebase(data.category, true, datetime, data);
            await deleteWaitingApproveByDocidFirebase(data.docid);
            setApproveList(approveList.filter(function (e) { return e.docid !== data.docid; }));
            await CallNotiPerson(api, data.id, desc, 'Text');
        }
        else if (data.category === 'CancelLeave') {
            let resp = await approveCancelLeave(data);
            await addHistoryFirebase(data.category, true, datetime, data);
            await deleteWaitingApproveByDocidFirebase(data.docid);
            setApproveList(approveList.filter(function (e) { return e.docid !== data.docid; }));
            await CallNotiPerson(api, data.id, desc, 'Text');
        }
        else if (data.category === 'Add OT') {
            let resp = await approveAddOT(data);
            await addHistoryFirebase(data.category, true, datetime, data);
            await deleteWaitingApproveByDocidFirebase(data.docid);
            setApproveList(approveList.filter(function (e) { return e.docid !== data.docid; }));
            await CallNotiPerson(api, data.id, desc, 'Text');
        }
        else if (data.category === 'Cancel OT') {
            let resp = await approveCancelOT(data);
            await addHistoryFirebase(data.category, true, datetime, data);
            await deleteWaitingApproveByDocidFirebase(data.docid);
            setApproveList(approveList.filter(function (e) { return e.docid !== data.docid; }));
            await CallNotiPerson(api, data.id, desc, 'Text');
        }
        else if (data.category === 'Register') {
            let resp = await approveRegister(data);
            // await addHistoryFirebase(data.category, true, datetime, data);
            await deleteWaitingApproveByDocidFirebase(data.docid);
            setApproveList(approveList.filter(function (e) { return e.docid !== data.docid; }));
            await CallNotiPerson(api, data.id, desc, 'Text');
        }
        setSnackSuccess({ ...snackSuccess, open: true, desc: 'Success' });
        setState({ ...state, loadingButton: false });
    }

    async function approveRegister(data) {
        let startdatetime ;
        if(data.startdatetime === undefined){
            startdatetime= new Date();
        }
        else{
            startdatetime = new Date(data.startdatetime);
        }
         
        let startdate = '' + startdatetime.getFullYear() + (startdatetime.getMonth() + 1 < 10 ? '0' + (startdatetime.getMonth() + 1) : startdatetime.getMonth() + 1) + (startdatetime.getDate() < 10 ? '0' + (startdatetime.getDate()) : startdatetime.getDate());
     
        await addNewUserSheet(data.name, data.fullname, data.employeeid, startdate);
        await addNewUserToFirebaseCalendar(data.name, data.fullname, data.id, data.tieruser);
    }

    async function actionRejectButton(data) {
        setState({ ...state, loadingButton: true });

        await addHistoryFirebase(data.category, false, datetime, data);
        await deleteWaitingApproveByDocidFirebase(data.docid);
        setApproveList(approveList.filter(function (e) { return e.docid !== data.docid; }));
        await CallNotiPerson(api, data.id, 'คำขอของคุณถูกปฎิเสธ', 'Text');
        setSnackSuccess({ ...snackSuccess, open: true, desc: 'Reject Success' });
        setState({ ...state, loadingButton: false });
    }

    function snackBarGreen() {
        return (
            <Snackbar open={snackSuccess.open} autoHideDuration={6000} onClose={() => setSnackSuccess({ ...snackSuccess, open: false })}>
                <Alert onClose={() => setSnackSuccess({ ...snackSuccess, open: false })} severity="success" sx={{ width: '100%' }}>
                    {snackSuccess.desc}
                </Alert>
            </Snackbar>
        );
    }

    async function approveCancelOT(data) {
        let startdatetime = new Date(data.startdatetime);
        let startdate = '' + startdatetime.getFullYear() + (startdatetime.getMonth() + 1 < 10 ? '0' + (startdatetime.getMonth() + 1) : startdatetime.getMonth() + 1) + (startdatetime.getDate() < 10 ? '0' + (startdatetime.getDate()) : startdatetime.getDate());
        let enddatetime = new Date(data.enddatetime);
        let enddate = '' + enddatetime.getFullYear() + (enddatetime.getMonth() + 1 < 10 ? '0' + (enddatetime.getMonth() + 1) : enddatetime.getMonth() + 1) + (enddatetime.getDate() < 10 ? '0' + (enddatetime.getDate()) : enddatetime.getDate());
        let hourAll = await deleteOTSheet(data.name, startdatetime, enddatetime, data.type);

        await deleteDateInCalendar(data.name, startdatetime, enddatetime);
    }

    async function approveAddOT(data) {
        let startdatetime = new Date(data.startdatetime);
        let startdate = '' + startdatetime.getFullYear() + (startdatetime.getMonth() + 1 < 10 ? '0' + (startdatetime.getMonth() + 1) : startdatetime.getMonth() + 1) + (startdatetime.getDate() < 10 ? '0' + (startdatetime.getDate()) : startdatetime.getDate());
        let enddatetime = new Date(data.enddatetime);
        let enddate = '' + enddatetime.getFullYear() + (enddatetime.getMonth() + 1 < 10 ? '0' + (enddatetime.getMonth() + 1) : enddatetime.getMonth() + 1) + (enddatetime.getDate() < 10 ? '0' + (enddatetime.getDate()) : enddatetime.getDate());
        let starthour = startdatetime.getHours();
        let startmin = startdatetime.getMinutes();
        let endhour = enddatetime.getHours();
        let endmin = enddatetime.getMinutes();
        let updatehour = 0;
        console.log(startdate, enddate);
        if (startdate === enddate) {
            let hour = endhour - starthour;
            let starttime = `${starthour}:${startmin}`;
            let endtime = `${endhour}:${endmin}`;
            await addOTSheet(data.name, hour, startdate, starttime, enddate, endtime, data.description);
        }
        else {
            let starttime = `${starthour}:${startmin}`;
            let hour = (23 - starthour) + (1 + endhour);
            let endtime = `${endhour}:${endmin}`;
            await addOTSheet(data.name, hour, startdate, starttime, enddate, endtime, data.description);
        }
        await addApproveToFirebaseCalendar(data.name + ' ( OT )', data.startdatetime, data.enddatetime, 'OT', data.description);
    }

    async function approveCancelLeave(data) {
        let startdatetime = new Date(data.startdatetime);
        let startdate = '' + startdatetime.getFullYear() + (startdatetime.getMonth() + 1 < 10 ? '0' + (startdatetime.getMonth() + 1) : startdatetime.getMonth() + 1) + (startdatetime.getDate() < 10 ? '0' + (startdatetime.getDate()) : startdatetime.getDate());
        let enddatetime = new Date(data.enddatetime);
        let enddate = '' + enddatetime.getFullYear() + (enddatetime.getMonth() + 1 < 10 ? '0' + (enddatetime.getMonth() + 1) : enddatetime.getMonth() + 1) + (enddatetime.getDate() < 10 ? '0' + (enddatetime.getDate()) : enddatetime.getDate());
        let updatehour = 0;
        if (startdate === enddate) {
            let hourAll = await deleteSheet(data.name, startdatetime, convertMonth2MohthFull(startdatetime.getMonth()), data.type);
            updatehour = updatehour + hourAll.hour;
        }
        else {
            let countd = countDay(startdatetime, enddatetime);
            let day = 1;
            for (let e = 0; e <= countd; e++) {
                let lastdayofmonth = new Date(startdatetime.getFullYear(), startdatetime.getMonth() + 1, 0);
                let startday;
                let thismonth;
                // console.log(lastdayofmonth,'<',startdatetime.getDate() + e,'==',startdatetime.getDate() + e > lastdayofmonth.getDate())
                if (startdatetime.getDate() + e > lastdayofmonth.getDate()) {
                    let startmonth = (startdatetime.getMonth() + 2) < 10 ? '0' + (startdatetime.getMonth() + 2) : (startdatetime.getMonth() + 2);
                    startday = '' + startdatetime.getFullYear() + startmonth + day;
                    thismonth = startdatetime.getMonth() + 1;
                    // checkday 1-9
                    if (('' + (day)).length === 1) {
                        startday = '' + startdatetime.getFullYear() + startmonth + '0' + (day);
                    }
                    day = day + 1;
                }
                else {
                    thismonth = startdatetime.getMonth();
                    let startmonth = (startdatetime.getMonth() + 1) < 10 ? '0' + (startdatetime.getMonth() + 1) : (startdatetime.getMonth() + 1);
                    startday = '' + startdatetime.getFullYear() + startmonth + (startdatetime.getDate() + e);
                    // checkday 1-9
                    if (('' + (startdatetime.getDate() + e)).length === 1) {
                        startday = '' + startdatetime.getFullYear() + startmonth + '0' + (startdatetime.getDate() + e);
                    }
                }

                let startdayFormatDate = new Date(formatMMDDYYYYDate(startday));

                let hourAll = await deleteSheet(data.name, startdayFormatDate, convertMonth2MohthFull(thismonth), data.type);
                updatehour = updatehour + hourAll.hour;
            }

        }
        //delete calendar
        await deleteDateInCalendar(data.name, startdatetime, enddatetime);
        //update hour

        let userDoc = await getUserByDocFromFirebase(data.name);

        let resp;
        let dataDoc;
        if (data.type === 'Annual Leave') {
            dataDoc = {
                fullname: userDoc.fullname,
                name: userDoc.name,
                id: userDoc.id,
                tier: userDoc.tier,
                annualleavehour: userDoc.annualleavehour,
                annualleaveuse: parseInt(userDoc.annualleaveuse) - parseInt(updatehour),
                sickleaveuse: userDoc.sickleaveuse
            };
            // await setDoc(docRef, dataDoc)
            await UpdateUserDocFromFirebase(data.name, dataDoc);
            resp = { hourAll: parseInt(userDoc.annualleavehour) - parseInt(userDoc.annualleaveuse - updatehour) };
        }
        else if (data.type === 'Sick Leave') {
            dataDoc = {
                fullname: userDoc.fullname,
                name: userDoc.name,
                id: userDoc.id,
                tier: userDoc.tier,
                annualleavehour: userDoc.annualleavehour,
                annualleaveuse: userDoc.annualleaveuse,
                sickleaveuse: parseInt(userDoc.sickleaveuse) - parseInt(updatehour)
            };
            await UpdateUserDocFromFirebase(data.name, dataDoc);
            resp = { hourAll: parseInt(userDoc.sickleaveuse) - parseInt(updatehour) };
        }


        return resp;

    }

    async function approveLeave(data) {
        let startdatetime = new Date(data.startdatetime);
        let startdate = '' + startdatetime.getFullYear() + (startdatetime.getMonth() + 1 < 10 ? '0' + (startdatetime.getMonth() + 1) : startdatetime.getMonth() + 1) + (startdatetime.getDate() < 10 ? '0' + (startdatetime.getDate()) : startdatetime.getDate());
        let enddatetime = new Date(data.enddatetime);
        let enddate = '' + enddatetime.getFullYear() + (enddatetime.getMonth() + 1 < 10 ? '0' + (enddatetime.getMonth() + 1) : enddatetime.getMonth() + 1) + (enddatetime.getDate() < 10 ? '0' + (enddatetime.getDate()) : enddatetime.getDate());
        let starthour = startdatetime.getHours();
        let endhour = enddatetime.getHours();
        let endmin = enddatetime.getMinutes();
        let updatehour = 0;
        let timehour = '';

        if (startdate === enddate) {
            let boolholiday = await isHolidays(startdate);
            if (!isWeekend(startdate) && !boolholiday) {
                console.log(isWeekend(startdate), isHolidays(startdate));
                if ((endhour > 13 && starthour < 13) || (endhour == 13 && endmin >= 30)) {
                    timehour = '' + (Math.abs(starthour - endhour) - 1);
                    updatehour = updatehour + parseInt(timehour);

                    //add sheet
                    await addSheet(data.name, timehour, startdate, convertMonth2MohthFull(startdatetime.getMonth()), data.type);
                }
                
                else {
                    timehour = '' + (Math.abs(starthour - endhour));
                    updatehour = updatehour + parseInt(timehour);
                    //addsheet
                    await addSheet(data.name, timehour, startdate, convertMonth2MohthFull(startdatetime.getMonth()), data.type);
                }
            }
        }
        else {
            let countd = countDay(startdatetime, enddatetime);
            let day = 1;
            for (let e = 0; e <= countd; e++) {
                // console.log(startdatetime.getFullYear(), '----',startdatetime.getMonth() + 1)
                let lastdayofmonth = new Date(startdatetime.getFullYear(), startdatetime.getMonth() + 1, 0);
                let startday;
                let thismonth;

                console.log(lastdayofmonth, '<', startdatetime.getDate() + e);
                if (startdatetime.getDate() + e > lastdayofmonth.getDate()) {
                    let startmonth = (startdatetime.getMonth() + 2) < 10 ? '0' + (startdatetime.getMonth() + 2) : (startdatetime.getMonth() + 2);
                    startday = '' + startdatetime.getFullYear() + startmonth + day;
                    thismonth = startdatetime.getMonth() + 1;

                    // checkday 1-9
                    if (('' + (day)).length === 1) {
                        startday = '' + startdatetime.getFullYear() + startmonth + '0' + (day);
                    }
                    day = day + 1;
                }
                else {
                    let startmonth = (startdatetime.getMonth() + 1) < 10 ? '0' + (startdatetime.getMonth() + 1) : (startdatetime.getMonth() + 1);
                    thismonth = startdatetime.getMonth();
                    startday = '' + startdatetime.getFullYear() + startmonth + (startdatetime.getDate() + e);
                    // checkday 1-9
                    if (('' + (startdatetime.getDate() + e)).length === 1) {
                        startday = '' + startdatetime.getFullYear() + startmonth + '0' + (startdatetime.getDate() + e);
                    }
                }

                //check sun and sat
                console.log('startday', startday);
                let boolholiday = await isHolidays(startday);
                console.log(boolholiday, '==>', !isWeekend(startday), '&&', !boolholiday);
                if (!isWeekend(startday) && !boolholiday) {
                    console.log(startday, enddate, startdate);
                    if (startday === startdate) {
                        console.log('first day');
                        if (starthour < 13) {
                            timehour = Math.abs(starthour - 18) - 1;
                            updatehour = updatehour + parseInt(timehour);
                            //add sheet
                            await addSheet(data.name, timehour, startday, convertMonth2MohthFull(thismonth), data.type);

                        }
                        else {
                            if (starthour === 12) {
                                timehour = Math.abs(13 - 18) - 1;
                            }
                            else {
                                timehour = Math.abs(starthour - 18);
                            }
                            updatehour = updatehour + parseInt(timehour);
                            //add sheet
                            await addSheet(data.name, timehour, startday, convertMonth2MohthFull(thismonth), data.type);
                        }

                    }

                    else if (startday === enddate) {
                        console.log('lastday');

                        if (endhour >= 13) {
                            timehour = Math.abs(9 - endhour) - 1;
                            updatehour = updatehour + parseInt(timehour);
                            //add sheet
                            await addSheet(data.name, timehour, startday, convertMonth2MohthFull(thismonth), data.type);

                        }
                        else {
                            timehour = Math.abs(9 - endhour);
                            updatehour = updatehour + parseInt(timehour);
                            //add sheet
                            await addSheet(data.name, timehour, startday, convertMonth2MohthFull(thismonth), data.type);
                        }
                    }
                    else {
                        console.log('mid day');
                        //add sheet fix 8 hour
                        updatehour = updatehour + 8;
                        await addSheet(data.name, '8', startday, convertMonth2MohthFull(thismonth), data.type);
                    }
                }
            }

        }
        //add calendar

        //! AddCalendar(data.name, eng2TH(data.type), data.type, data.startdatetime, data.enddatetime);

        // addToFirebaseCalendar(data.name+' ( '+eng2TH(data.type)+' )', data.startdatetime, data.enddatetime);
        await addApproveToFirebaseCalendar(data.name + ' ( ' + eng2TH(data.type) + ' )', data.startdatetime, data.enddatetime, 'Leave', '');
        //update hour
        // console.log('update hour',updatehour)
        let userDoc = await getUserByDocFromFirebase(data.name);
        // const docRef = doc(db, 'LineUsers', data.name);
        // const docSnap = await getDoc(docRef);
        let resp;
        let dataDoc;
        if (data.type === 'Annual Leave') {
            dataDoc = {
                fullname: userDoc.fullname,
                name: userDoc.name,
                id: userDoc.id,
                tier: userDoc.tier,
                annualleavehour: userDoc.annualleavehour,
                annualleaveuse: parseInt(userDoc.annualleaveuse) + parseInt(updatehour),
                sickleaveuse: userDoc.sickleaveuse
            };
            // await setDoc(docRef, dataDoc)
            await UpdateUserDocFromFirebase(data.name, dataDoc);
            resp = { hourAll: parseInt(userDoc.annualleavehour) - parseInt(userDoc.annualleaveuse + updatehour) };
        }
        else if (data.type === 'Sick Leave') {
            dataDoc = {
                fullname: userDoc.fullname,
                name: userDoc.name,
                id: userDoc.id,
                tier: userDoc.tier,
                annualleavehour: userDoc.annualleavehour,
                annualleaveuse: userDoc.annualleaveuse,
                sickleaveuse: parseInt(userDoc.sickleaveuse) + parseInt(updatehour)
            };
            await UpdateUserDocFromFirebase(data.name, dataDoc);
            resp = { hourAll: parseInt(userDoc.sickleaveuse) + parseInt(updatehour) };
        }


        return resp;
    }


    function approveType(value) {
        if (value.category === 'Leave') {
            return (
                <CommonView
                    category="Leave"
                    data={[
                        {
                            label: 'ชื่อ',
                            value: value.name
                        },
                        {
                            label: 'ประเภทของการลา',
                            value: value.type
                        },
                        {
                            label: 'รายละเอียดของการลา',
                            value: value.description
                        },
                        {
                            label: 'วันที่เริ่มลา',
                            value: formatThString(value.startdatetime)
                        },
                        {
                            label: 'ลาถึงวันที่',
                            value: formatThString(value.enddatetime)
                        },
                        {
                            label: 'วันเวลาที่ได้ขอทำรายการ',
                            value: formatThString(value.requestdatetime)
                        }

                    ]}
                />
            );
        }
        else if (value.category === 'Add OT') {
            return (
                <CommonView
                    category="Add OT"
                    data={[
                        {
                            label: 'ชื่อ',
                            value: value.name
                        },
                        {
                            label: 'ประเภทของ OT',
                            value: value.type
                        },
                        {
                            label: 'รายละเอียดของ OT',
                            value: value.description
                        },
                        {
                            label: 'วันเริ่มต้นที่จะทำ OT',
                            value: formatThString(value.startdatetime)
                        },
                        {
                            label: 'วันสิ้นสุดที่จะทำ OT',
                            value: formatThString(value.enddatetime)
                        },
                        {
                            label: 'วันเวลาที่ได้ขอทำรายการ',
                            value: formatThString(value.requestdatetime)
                        }

                    ]}
                />
            );
        }
        else if (value.category === 'Register') {
            return (
                <Box>
                    <Typography color="textSecondary" >
                        {'Register ( ลงทะเบียน )'}
                    </Typography>

                    <Divider />
                    <Stack spacing={3}>
                        <TextField
                            sx={{ marginTop: '20px' }}
                            id="nickname"
                            label="ชื่อเล่น"
                            value={value.name}
                            onChange={(e) => {
                                let list = [];
                                approveList.map(val => {
                                    if (val.docid === value.docid) {
                                        val.name = e.target.value;
                                        list.push(val);
                                    }
                                    else {
                                        list.push(val);
                                    }
                                });
                                setApproveList(list);
                            }}
                        />

                        <TextField
                            sx={{ marginTop: '20px' }}
                            id="fullname"
                            label="ชื่อ-นามสกุล ( ภาษาอังกฤษ )"
                            value={value.fullname}
                            onChange={(e) => {
                                let list = [];
                                approveList.map(val => {
                                    if (val.docid === value.docid) {
                                        val.fullname = e.target.value;
                                        list.push(val);
                                    }
                                    else {
                                        list.push(val);
                                    }
                                });
                                setApproveList(list);
                            }}
                        />
                        <TextField
                            sx={{ marginTop: '20px' }}
                            id="employeeid"
                            label="รหัสพนักงาน"
                            value={value.employeeid}
                            onChange={(e) => {
                                let list = [];
                                approveList.map(val => {
                                    if (val.docid === value.docid) {
                                        val.employeeid = e.target.value;
                                        list.push(val);
                                    }
                                    else {
                                        list.push(val);
                                    }
                                });
                                setApproveList(list);

                            }}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="tierlabel">Tier</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="selectTier"
                                value={value.tieruser}
                                label="Tier"
                                onChange={(e) => {
                                    let list = [];
                                    approveList.map(val => {
                                        if (val.docid === value.docid) {
                                            val.tieruser = e.target.value;
                                            list.push(val);
                                        }
                                        else {
                                            list.push(val);
                                        }
                                    });
                                    setApproveList(list);
                                }}
                            >
                                <MenuItem value={'normal'}>normal</MenuItem>
                                <MenuItem value={'normalplus'}>normalplus</MenuItem>
                                <MenuItem value={'head'}>head</MenuItem>
                                <MenuItem value={'leader'}>leader</MenuItem>
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                               
                                label="วันเริ่มต้นทำงาน"
                                value={value.startdatetime}
                                onChange={(e) => {
                                    let list = [];
                                    approveList.map(val => {
                                        if (val.docid === value.docid) {
                                            val.startdatetime = e;
                                            list.push(val);
                                        }
                                        else {
                                            list.push(val);
                                        }
                                    });
                                    setApproveList(list);
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </Stack>
                </Box>
            );
        }
        else {
            return (
                <CommonView
                    category={value.category}
                    data={[
                        {
                            label: 'ชื่อ',
                            value: value.name
                        },
                        {
                            label: 'ประเภท',
                            value: value.type
                        },
                        {
                            label: 'วันเริ่มต้น',
                            value: formatThString(value.startdatetime)
                        },
                        {
                            label: 'วันสิ้นสุด',
                            value: formatThString(value.enddatetime)
                        },
                        {
                            label: 'วันเวลาที่ได้ขอทำรายการ',
                            value: formatThString(value.requestdatetime)
                        }

                    ]}
                />
            );
        }
    }

    function selectionApprove() {

        if (approveList.length === 0) {
            // console.log(approveList.length)
            if (state.id === '') {
                return (
                    <Box sx={{ minHeight: '100vh' }} >
                        <Card sx={{ bgcolor: '#fff', marginBottom: '15px' }}  >
                            <CardContent  >
                                <Skeleton variant="text" />
                                <Skeleton variant="rectangular" height={200} />
                            </CardContent>
                        </Card>
                        <Card sx={{ bgcolor: '#fff', marginBottom: '15px' }}  >
                            <CardContent  >
                                <Skeleton variant="text" />
                                <Skeleton variant="rectangular" height={200} />
                            </CardContent>
                        </Card>
                        <Card sx={{ bgcolor: '#fff', marginBottom: '15px' }}  >
                            <CardContent  >
                                <Skeleton variant="text" />
                                <Skeleton variant="rectangular" height={200} />
                            </CardContent>
                        </Card>
                    </Box>
                );

            }
            else {
                return (
                    <Box sx={{ minHeight: '100vh' }} >
                        <Card sx={{ bgcolor: '#fff', marginBottom: '15px' }}  >
                            <CardContent  >
                                ไม่มีคำขอ approve แล้ว
                            </CardContent>

                        </Card>
                    </Box>);
            }

        }
        else {
            return (
                <Box sx={{ minHeight: '100vh' }}>
                    {approveList.map((value, index) => {
                        return (
                            <Card sx={{ bgcolor: '#fff', marginBottom: '15px' }} key={index + value} >
                                <CardContent >
                                    {approveType(value)}
                                </CardContent>
                                <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                                    {
                                        state.loadingButton ?
                                            <>
                                                <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled>Reject</Button>
                                                <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >Approve</Button>
                                            </>
                                            :
                                            <>
                                                <Button variant="outlined" size="medium" startIcon={<DeleteIcon />} onClick={() => actionRejectButton(value)}>Reject</Button>
                                                <Button variant="outlined" size="medium" startIcon={<SaveIcon />} onClick={() => actionApproveButton(value)}>Approve</Button>
                                            </>

                                    }
                                </CardActions>
                            </Card>
                        );
                    })}
                </Box>
            );
        }

    }

    async function isHolidays(date) {
        console.log('check holiday');
        let year = date.substr(0, 4);
        let month = date.substr(4, 2);
        let today = date.substr(6, 2);

        let bool = true;

        // const holidaysRef = doc(db, 'Holidays', year.toString());
        // const holidaysSnapshot = await getDoc(holidaysRef);
        let holidaysSnapshot = await getHolidayByYearFromFirebase(year.toString());

        let month3 = convertMonth2Mohth3(parseInt(month - 1));
        let holidayslist;
        // holidayslist = holidaysSnapshot.get(month3);
        for (let i = 0; i < holidaysSnapshot.months.length; i++) {
            if (holidaysSnapshot.months[i].month === month3) {
                holidayslist = holidaysSnapshot.months[i].days;
            }
        }

        if (holidayslist.length !== 0) {
            for (let i = 0; i < holidayslist.length; i++) {
                let day = new Date(holidayslist[i].date.seconds * 1000);
                // console.log(today,'==',day.getDate(),'==>',parseInt(today) === parseInt(day.getDate()))

                if (parseInt(today) === parseInt(day.getDate())) {
                    bool = true;
                    break;
                }
                else {
                    bool = false;
                }
            }
        }
        else {
            bool = false;
        }
        console.log(bool ? 'IT`s Holiday' : 'Not Holiday');
        return bool;
    }

    return (
        <Grid sx={{ bgcolor: 'rgb(240, 242, 245)' }}  >
            {
                state.tier === 'head' || state.tier === 'leader' || state.tier === 'admin' || state.tier === 'normalplus' || approveList.length === 0 ?

                    selectionApprove()
                    :
                    <Box sx={{ minHeight: '100vh' }} />
            }
                    <Box sx={{ minHeight: '100vh' }} />
            }
            {snackBarGreen()}
        </Grid>

    );
}


export async function getStaticProps() {
    return {
        props: {
            api: process.env.LINEBOTSERVER,
            // Will be passed to the page component as props
        },
    };
}

