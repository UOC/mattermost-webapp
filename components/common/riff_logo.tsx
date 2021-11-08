// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
 */

import React from 'react';

import RiffLogoImg from 'images/Riff-32x32.svg';

export const RiffLogo = (props: {[prop: string]: any}) => {
    return (
        <span {...props}>
            <img
                src={RiffLogoImg}
                alt='Riff Learning Logo'
                className='icon'
            />
        </span>
    );
};

