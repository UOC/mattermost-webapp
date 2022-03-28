// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
 */

import React from 'react';

import UOCLogoImg from 'images/logouoc.svg';

export const RiffLogo = (props: {[prop: string]: any}) => {
    return (
        <span {...props}>
            <img
                src={UOCLogoImg}
                alt='UOC`s logo'
                className='icon'
            />
        </span>
    );
};

