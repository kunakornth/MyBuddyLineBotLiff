/* eslint-disable react/prop-types */
import React from 'react';
import { Box } from '@mui/system';
import { Divider, Stack, TextField, Typography } from '@mui/material';

function CommonView(props) {
    const { data, category } = props;
  
    return (
        <Box>
            <Typography color="textSecondary" gutterBottom>
                {category}
            </Typography>
            <Divider />
            <Stack spacing={3}>
                {data.map(val =>
                    (
                        <TextField
                            multiline
                            disabled
                            sx={{ marginTop: '20px' }}
                            key={val.label}
                            id={val.label}
                            label={val.label}
                            value={val.value}
                        />)
                )}

                {/* <TextField
                    sx={{ marginTop: '20px' }}
                    disabled
                    id="outlined-required"
                    label="ประเภทของการลา"
                    value={value.type}
                />
                <TextField
                    multiline
                    sx={{ marginTop: '20px' }}
                    disabled
                    id="outlined-required"
                    label="รายละเอียดของการลา"
                    value={value.description}
                />
                <TextField
                    multiline
                    sx={{ marginTop: '20px' }}
                    disabled
                    id="outlined-required"
                    label="วันที่เริ่มลา"
                    value={formatThString(value.startdatetime)}
                />
                <TextField
                    multiline
                    sx={{ marginTop: '20px' }}
                    disabled
                    id="outlined-required"
                    label="ลาถึงวันที่"
                    value={formatThString(value.enddatetime)}
                />
                <TextField
                    multiline
                    sx={{ marginTop: '20px' }}
                    disabled
                    id="outlined-required"
                    label="วันเวลาที่ได้ขอทำรายการ"
                    value={formatThString(value.requestdatetime)}
                /> */}

            </Stack>
        </Box>
    );
}

CommonView.propTypes = {};

export default CommonView;
