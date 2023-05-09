export function eng2TH(type){
    if(type==='Annual Leave'){
        return 'ลาหยุดประจำปี';
    }
    else if(type ==='Sick Leave'){
        return 'ลาป่วย';
    }
    else if(type ==='Private Leave'){
        return 'การลากิจ';
    }
    else if(type ==='Leave for Marriage'){
        return 'การลางานเพื่อสมรส';
    }
    else if(type ==='Maternity Leave'){
        return 'การลาคลอดบุตร';
    }
    else if(type ==='Sterilization Leave'){
        return 'การลาเพื่อทำหมัน';
    }
    else if(type ==='Leave for Funeral'){
        return 'การลางานเพื่องานศพ';
    }
    else if(type ==='Military Leave'){
        return 'การลาเพื่อรับราชการทหาร';
    }

}