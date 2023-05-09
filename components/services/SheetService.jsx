import { formatMMDDYYYYDate } from '@components/utils/Datetime';
import { docSheet, SheetKey } from '@lib/googleSheet';



export async function addSheet(name, hour, startdate, monthfullReport, leavetype) {
    await docSheet.useServiceAccountAuth({
        client_email: SheetKey.client_email,
        private_key: SheetKey.private_key,
    });
    await docSheet.loadInfo();

    let fullname = '';
    const sheet = docSheet.sheetsByTitle['Yearly Report'];
    await sheet.loadCells('A1:E');
    // console.log(sheet); 
    let sheet3 = docSheet.sheetsByTitle['Name'];
    await sheet3.loadCells('A1:C');

    for (let j = 0; j < sheet3.rowCount; j++) {
        let findname = sheet3.getCellByA1('C' + (j + 1)).value;
        if (findname === name) {
            fullname = sheet3.getCellByA1('B' + (j + 1)).value;
            break;
        }
    }

    if (sheet.title === 'Yearly Report') {
        for (let i = 0; i < sheet.rowCount; i++) {
            const fullnamesheet = sheet.getCellByA1('B' + (i + 1)).value;
            const employeeNosheet = sheet.getCellByA1('A' + (i + 1)).value;

            // console.log(fullname,'==',fullnamesheet,'==>',fullname == fullnamesheet)
            if (fullname == fullnamesheet) {

                if (leavetype === 'Annual Leave') {

                    const remainHour = sheet.getCellByA1('E' + (i + 1));

                    remainHour.value = parseInt(remainHour.value) - parseInt(hour);
                    await sheet.saveUpdatedCells();
                }


                let monthsheet = docSheet.sheetsByTitle[monthfullReport];
                // console.log(monthsheet.rowCount)
                await monthsheet.loadCells('A1:K');


                await monthsheet.addRow([employeeNosheet, fullname, formatMMDDYYYYDate(startdate) + ' ', leavetype === 'Annual Leave' ? hour : '', leavetype === 'Sick Leave' ? hour : '', leavetype === 'Private Leave' ? hour : '', leavetype === 'Leave for Marriage' ? hour : '', leavetype === 'Maternity Leave' ? hour : '', leavetype === 'Sterilization Leave' ? hour : '', leavetype === 'Leave for Funeral' ? hour : '', leavetype === 'Military Leave' ? hour : '']);
                monthsheet.saveUpdatedCells();
                break;
            }
        }


    }


}

export async function deleteSheet(name, startdate, monthfullReport, leavetype) {
    await docSheet.useServiceAccountAuth({
        client_email: SheetKey.client_email,
        private_key: SheetKey.private_key,
    });
    await docSheet.loadInfo();

    let fullname = '';
    const sheet = docSheet.sheetsByTitle['Yearly Report'];
    await sheet.loadCells('A1:E');

    //* getfull name
    let sheetName = docSheet.sheetsByTitle['Name'];
    await sheetName.loadCells('A1:C');
    for (let j = 0; j < sheetName.rowCount; j++) {
        let findname = sheetName.getCellByA1('C' + (j + 1)).value;
        if (findname === name) {
            fullname = sheetName.getCellByA1('B' + (j + 1)).value;
            break;
        }
    }

    let sheetMonth = docSheet.sheetsByTitle[monthfullReport];
    await sheetMonth.loadCells('A1:K100');
    let findHour = 0;
    let findDate;

    for (let j = 0; j < sheetMonth.rowCount; j++) {
        console.log('Leavetype', leavetype);
        if (leavetype === 'Annual Leave') {
            findDate = new Date(sheetMonth.getCellByA1('C' + (j + 1)).value);
            let findname = sheetMonth.getCellByA1('B' + (j + 1)).value;
            console.log(startdate, findDate, findname, fullname);
            if (fullname === findname && startdate.getFullYear() === findDate.getFullYear() && startdate.getMonth() === findDate.getMonth() && startdate.getDate() === findDate.getDate()) {
                findHour = sheetMonth.getCellByA1('D' + (j + 1)).value;
                console.log('hour', findHour);
                const rows = await sheetMonth.getRows();
                rows[j - 1].delete();
                console.log('Delfrom monthSheet');
            }
        }
        else if (leavetype === 'Sick Leave') {
            findDate = new Date(sheetMonth.getCellByA1('C' + (j + 1)).value);
            let findname = sheetMonth.getCellByA1('B' + (j + 1)).value;
            console.log(startdate, findDate, findname, fullname);
            if (fullname === findname && startdate.getFullYear() === findDate.getFullYear() && startdate.getMonth() === findDate.getMonth() && startdate.getDate() === findDate.getDate()) {
                findHour = sheetMonth.getCellByA1('E' + (j + 1)).value;
                console.log('hour', findHour);
                const rows = await sheetMonth.getRows();
                rows[j - 1].delete();
                console.log('Delfrom monthSheet');
            }
        }

    }
    let remainH;
    if (sheet.title === 'Yearly Report') {
        for (let i = 0; i < sheet.rowCount; i++) {
            const fullnamesheet = sheet.getCellByA1('B' + (i + 1)).value;
            if (fullname == fullnamesheet) {
                console.log(leavetype);
                if (leavetype === 'Annual Leave') {
                    let remainHour = sheet.getCellByA1('E' + (i + 1));

                    console.log(findHour);
                    let num = remainHour.value + parseInt(findHour);
                    console.log(num);
                    remainHour.value = parseInt(num);
                    remainH = remainHour;
                    await sheet.saveUpdatedCells();
                }

            }
        }
    }

    let resp = {
        hour: findHour,
        remainHour: remainH.value
    };
    return resp;
}

export async function addNewUserSheet(name, fullname, employeeid,startdate) {
    await docSheet.useServiceAccountAuth({
        client_email: SheetKey.client_email,
        private_key: SheetKey.private_key,
    });
    await docSheet.loadInfo();


    const yearlySheet = docSheet.sheetsByTitle['Yearly Report'];
    await yearlySheet.loadCells('A1:E');
    // console.log(sheet); 
    let namesheet = docSheet.sheetsByTitle['Name'];
    await namesheet.loadCells('A1:C');
    
    let leaveHoursheet = docSheet.sheetsByTitle['Leave Hour'];
    await leaveHoursheet.loadCells('A1:L');

    await namesheet.addRow([employeeid,fullname,name]);
    namesheet.saveUpdatedCells();
    
    let startmonth =startdate.substr(4,2);
    let endDate =new Date(new Date().getFullYear(),12,0);
    let endYear = '' + endDate.getFullYear() + (endDate.getMonth() + 1 < 10 ? '0' + (endDate.getMonth() + 1) : endDate.getMonth() + 1) + (endDate.getDate() < 10 ? '0' + (endDate.getDate()) : endDate.getDate());

    await leaveHoursheet.addRow([employeeid,fullname,formatMMDDYYYYDate(startdate),formatMMDDYYYYDate(endYear),12-startmonth,0,12-startmonth,`0Year${12-startmonth}Month`,5,40,0,40]);
    leaveHoursheet.saveUpdatedCells();

    await yearlySheet.addRow([employeeid,fullname,40,0,40]);
    yearlySheet.saveUpdatedCells();
   


}


export async function addOTSheet(name, hour, startdate, starttime, enddate, endtime, description) {
    await docSheet.useServiceAccountAuth({
        client_email: SheetKey.client_email,
        private_key: SheetKey.private_key,
    });
    await docSheet.loadInfo();

    let fullname = '';
    const sheet = docSheet.sheetsByTitle['OT Report'];
    await sheet.loadCells('A1:H');
    // console.log(sheet); 
    let sheet3 = docSheet.sheetsByTitle['Name'];
    await sheet3.loadCells('A1:C');
    let employeeNo = '';
    for (let j = 0; j < sheet3.rowCount; j++) {
        let findname = sheet3.getCellByA1('C' + (j + 1)).value;

        if (findname === name) {
            fullname = sheet3.getCellByA1('B' + (j + 1)).value;
            employeeNo = sheet3.getCellByA1('A' + (j + 1)).value;
            break;
        }
    }

    if (sheet.title === 'OT Report') {
        await sheet.addRow([employeeNo, fullname, description, formatMMDDYYYYDate(startdate), starttime, formatMMDDYYYYDate(enddate), endtime, hour]);
        sheet.saveUpdatedCells();
    }


}

export async function deleteOTSheet(name, startdate, enddate, leavetype) {
    await docSheet.useServiceAccountAuth({
        client_email: SheetKey.client_email,
        private_key: SheetKey.private_key,
    });
    await docSheet.loadInfo();

    let fullname = '';
    const sheet = docSheet.sheetsByTitle['OT Report'];
    await sheet.loadCells('A1:H');

    //* getfull name
    let sheetName = docSheet.sheetsByTitle['Name'];
    await sheetName.loadCells('A1:C');
    for (let j = 0; j < sheetName.rowCount; j++) {
        let findname = sheetName.getCellByA1('C' + (j + 1)).value;
        if (findname === name) {
            fullname = sheetName.getCellByA1('B' + (j + 1)).value;
            break;
        }
    }
    let findDate = '';
    let findEndDate = '';
    for (let j = 0; j < sheet.rowCount; j++) {

        findDate = new Date(sheet.getCellByA1('D' + (j + 1)).value);
        findEndDate = new Date(sheet.getCellByA1('F' + (j + 1)).value);
        let findname = sheet.getCellByA1('B' + (j + 1)).value;

        if (fullname === findname && startdate.getFullYear() === findDate.getFullYear() && startdate.getMonth() === findDate.getMonth() && startdate.getDate() === findDate.getDate() && enddate.getFullYear() === findEndDate.getFullYear() && enddate.getMonth() === findEndDate.getMonth() && enddate.getDate() === findEndDate.getDate()) {
            const rows = await sheet.getRows();
            rows[j - 1].delete();
            console.log('Delfrom OTSheet');
        }

    }

}