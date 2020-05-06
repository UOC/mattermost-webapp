// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SignupLTI from 'components/signup/signup_lti/signup_lti.jsx';

describe('components/signup/SignupLTI', () => {
    const baseProps = {
        customDescriptionText: '',
        actions: {
            createLTIUser: jest.fn(),
        },
        enableSignUpWithLTI: true,
        passwordConfig: {
            minimumLength: 4,
            requireLowercase: false,
            requireUppercase: false,
            requireNumber: false,
            requireSymbol: false,
        },
        privacyPolicyLink: '',
        siteName: 'Mattermost',
        termsOfServiceLink: '',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SignupLTI {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should redirect to / when not signup with lti disabled', () => {
        const props = {
            ...baseProps,
            enableSignUpWithLTI: false,
        };
        const wrapper = shallow(
            <SignupLTI {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should pick email, username and full name from state', () => {
        const props = {
            ...baseProps,
            enableSignUpWithLTI: false,
        };
        const wrapper = shallow(
            <SignupLTI {...props}/>,
        );
        wrapper.setState({
            formData: {
                lis_person_contact_email_primary: 'test@nowhere.com',
                lis_person_name_full: 'Test User',
                lis_person_sourcedid: 'test',
            },
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should have match state and make API call when handleSubmit is called', () => {
        const wrapper = shallow(
            <SignupLTI {...baseProps}/>,
        );

        wrapper.setState({password: 'password', serverError: '', isSubmitting: false});
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(wrapper.state('serverError')).toEqual('');
        expect(wrapper.state('isSubmitting')).toEqual(true);
        expect(baseProps.actions.createLTIUser).toBeCalled();
    });
});
