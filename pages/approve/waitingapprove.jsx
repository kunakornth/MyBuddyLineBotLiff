import React, { useEffect, useState } from 'react';
import { Card, CardContent, Container, Grid, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { getUserFromFirebase, getWaitingApproveByTierListFromFirebase } from '@components/services/FirebaseService';
import CommonView from '@common/CommonView';
import { formatThString } from '@components/utils/Datetime';
import CommonCard from '@common/CommonCard';

export default function WaitingApprove() {

    const initialUser = {
        name: '',
        id: '',
        tier: '',
        loadingButton: false,

    };
    const [user, setUser] = useState(initialUser);
    const [list, setList] = useState([]);

    useEffect(() => {
        getUser();

    }, []);

    async function getUser() {
        const liff = (await import('@line/liff')).default;
        await liff.ready;
        const profile = await liff.getProfile();

        let userdata = await getUserFromFirebase(profile.userId);
        // let userdata = await getUserFromFirebase('Ud1beca7a0463576dcd7afe8d6576d423');
        let waitingAproove = await getWaitingApproveByTierListFromFirebase([userdata.tier], userdata.name);
        console.log(waitingAproove);
        setUser({ ...user, id: userdata.id, name: userdata.name, tier: userdata.tier });
        setList(waitingAproove);

    }

    function WaitingType(value) {
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
        else if (value.category === 'CancelLeave') {
            return (
                <CommonView
                    category="Cancel Leave"
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
                            label: 'วันเริ่มต้นที่จะยกเลิกลา',
                            value: formatThString(value.startdatetime)
                        },
                        {
                            label: 'วันสิ้นสุดที่จะยกเลิกลา',
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

    function showWaiting() {
        return (
            <Container fixed>
                <Box sx={{ minHeight: '100vh' }} >
                    <Stack spacing={3}>
                        {list.map((value, index) => {
                            return (
                                <Card key={index + value} >
                                    <CardContent>
                                        {WaitingType(value)}
                                    </CardContent>

                                </Card>
                            );
                        })}

                    </Stack>
                </Box>
            </Container>
        );
    }

    function showList() {
        return (
            <Stack spacing={3}>
                {showWaiting()}

            </Stack>
        );
    }

    return (
        <Grid  >
            {
                user.tier === 'head' || user.tier === 'normalplus' || user.tier === 'leader' || user.tier === 'normal' || user.tier === 'admin' ?
                    <>
                        <Box sx={{ height: '100vh', paddingTop: 5 }} >
                            <Container fixed>

                                {showList()}
                            </Container>
                        </Box>
                    </>
                    :
                    <Box sx={{ minHeight: '100vh' }} >
                        <CommonCard title={'Register'} path={'/register/request'} buttonName={'Register'}  />
                    </Box>
            }
        </Grid>
    );
}

