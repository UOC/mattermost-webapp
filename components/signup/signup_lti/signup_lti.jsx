// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import logoImage from 'images/logo.png';
import {browserHistory} from 'utils/browser_history';
import {LTIConstants} from 'utils/constants';
import {isValidPassword, localizeMessage} from 'utils/utils';

import BackButton from 'components/common/back_button';
import LoadingScreen from 'components/loading_screen';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class SignupLTI extends React.Component {
    static get propTypes() {
        return {
            customDescriptionText: PropTypes.string,
            actions: PropTypes.shape({
                createLTIUser: PropTypes.func.isRequired,
            }).isRequired,
            enableSignUpWithLTI: PropTypes.bool,
            passwordConfig: PropTypes.object,
            privacyPolicyLink: PropTypes.string,
            siteName: PropTypes.string,
            termsOfServiceLink: PropTypes.string,
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            formData: {},
            password: '',
            loading: false,
            serverError: '',
            passwordError: '',
            isSubmitting: false,
            invalidRequest: false,
        };

        this.renderTerms = this.renderTerms.bind(this);
    }

    componentDidMount() {
        if (this.props.enableSignUpWithLTI) {
            this.decodeRequest(this.extractFormData());
        } else {
            browserHistory.push('/');
        }
    }

    getCookie = (name) => {
        // Implementation from: https://stackoverflow.com/a/25490531/6241000
        const parts = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return parts ? parts.pop() : '';
    };

    deleteCookie = (name) => {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    extractFormData = () => {
        return this.getCookie(LTIConstants.LAUNCH_DATA_COOKIE);
    };

    extractName = () => {
        const name = this.getCookie(LTIConstants.NAME_COOKIE);
        return atob(name);
    };

    decodeRequest = (formData) => {
        try {
            const decodedForm = atob(formData);
            const parsedForm = JSON.parse(decodedForm);
            this.setState({formData: parsedForm});
        } catch (e) {
            this.setState({
                invalidRequest: true,
                serverError: (
                    <FormattedMessage
                        id='signup_LTI.invalid_request'
                        defaultMessage='There was an error with your login request. Please try again or contact your system administrator.'
                    />
                ),
            });
        }
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        // bail out if a submission is already in progress
        if (this.state.isSubmitting) {
            return;
        }

        if (this.isPasswordValid()) {
            this.setState({
                usernameError: '',
                emailError: '',
                passwordError: '',
                serverError: '',
                isSubmitting: true,
            });

            const {data, error} = await this.props.actions.createLTIUser({password: this.state.password});
            if (data) {
                this.deleteCookie(LTIConstants.LAUNCH_DATA_COOKIE);
                this.deleteCookie(LTIConstants.NAME_COOKIE);
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            }
            if (error) {
                this.setState({
                    serverError: error.message,
                    isSubmitting: false,
                });
            }
        }
    };

    isPasswordValid = () => {
        const providedPassword = this.state.password;
        const {valid, error} = isValidPassword(providedPassword, this.props.passwordConfig);
        if (!valid && error) {
            this.setState({
                passwordError: error,
                serverError: '',
            });
            return false;
        }

        return true;
    };

    renderLTISignup = () => {
        const {formData = {}} = this.state;
        const {
            [LTIConstants.EMAIL_FIELD]: email = '',
            [LTIConstants.USERNAME_FIELD]: username = '',
        } = formData;

        let passwordError = null;
        let passwordDivStyle = 'form-group';
        if (this.state.passwordError) {
            passwordError = (
                <label
                    className='control-label'
                    id='password-error'
                >
                    {this.state.passwordError}
                </label>
            );
            passwordDivStyle += ' has-error';
        }

        let yourEmailIs = null;
        if (email) {
            yourEmailIs = (
                <span id='email-disabled-label'>
                    <FormattedMarkdownMessage
                        id='signup_user_completed.emailIs'
                        defaultMessage="Your email address is **{email}**. You'll use this address to sign in to {siteName}."
                        values={{
                            email,
                            siteName: this.props.siteName,
                        }}
                    />
                </span>
            );
        }

        return (
            <form>
                <div className='inner__content'>
                    <div className='margin--extra'>
                        <p className='h5'><strong>
                            <FormattedMessage
                                id='signup_LTI.fullname'
                                defaultMessage='Full Name'
                            />
                        </strong></p>
                        <div className='form-group'>
                            <input
                                id='fullname'
                                type='text'
                                className='form-control'
                                value={this.extractName()}
                                disabled={true}
                                aria-label={localizeMessage('signup_LTI.fullname', 'Full Name')}
                                aria-describedby='fullname-disabled-label'
                            />
                            <span
                                className='help-block'
                                id='fullname-disabled-label'
                            >
                                <FormattedMessage
                                    id='signup_user_completed.textInputDisabled'
                                    values={{
                                        value: 'name',
                                    }}
                                />
                            </span>
                        </div>
                    </div>
                    <div className='margin--extra'>
                        <p className='h5'><strong>
                            <FormattedMessage
                                id='signup_LTI.username'
                                defaultMessage='Username'
                            />
                        </strong></p>
                        <div className='form-group'>
                            <input
                                id='username'
                                type='text'
                                className='form-control'
                                value={username}
                                disabled={true}
                                aria-label={localizeMessage('signup_LTI.username', 'Username')}
                                aria-describedby='username-disabled-label'
                            />
                            <span
                                className='help-block'
                                id='username-disabled-label'
                            >
                                <FormattedMessage
                                    id='signup_user_completed.textInputDisabled'
                                    values={{
                                        value: 'username',
                                    }}
                                />
                            </span>
                        </div>
                    </div>
                    <div className={'margin--extra'}>
                        <p className='h5'><strong>
                            <FormattedMessage
                                id='signup_LTI.email'
                                defaultMessage='Email Address'
                            />
                        </strong></p>
                        <div className='form-group'>
                            <input
                                id='email'
                                type='email'
                                className='form-control'
                                value={email}
                                disabled={true}
                                aria-label={localizeMessage('signup_LTI.email', 'Email Address')}
                                aria-describedby='email-disabled-label'
                            />
                        </div>
                    </div>
                    {yourEmailIs}
                    <div className='margin--extra'>
                        <p className='h5'><strong>
                            <FormattedMessage
                                id='signup_user_completed.choosePwd'
                                defaultMessage='Choose your password'
                            />
                        </strong></p>
                        <div className={passwordDivStyle}>
                            <input
                                id='password'
                                type='password'
                                className='form-control'
                                placeholder=''
                                maxLength='128'
                                spellCheck='false'
                                value={this.state.password}
                                onInput={(evt) => this.setState({password: evt.target.value})}
                                aria-label={localizeMessage('signup_user_completed.choosePwd', 'Choose your password')}
                                aria-describedby='password-error'
                            />
                            {passwordError}
                        </div>
                    </div>
                    {this.renderTerms()}
                    <p className='margin--extra'>
                        <button
                            id='createAccountButton'
                            type='submit'
                            onClick={this.handleSubmit}
                            className='btn-primary btn'
                            disabled={this.state.isSubmitting}
                        >
                            <FormattedMessage
                                id='signup_user_completed.create'
                                defaultMessage='Create Account'
                            />
                        </button>
                    </p>
                </div>
            </form>
        );
    };

    renderTerms() {
        const {
            privacyPolicyLink,
            siteName,
            termsOfServiceLink,
        } = this.props;

        const terms = (
            <p className='margin--extra'>
                <FormattedMarkdownMessage
                    id='create_team.agreement'
                    defaultMessage='By proceeding to create your account and use {siteName}, you agree to our [Terms of Service]({TermsOfServiceLink}) and [Privacy Policy]({PrivacyPolicyLink}). If you do not agree, you cannot use {siteName}.'
                    values={{
                        siteName,
                        TermsOfServiceLink: termsOfServiceLink,
                        PrivacyPolicyLink: privacyPolicyLink,
                    }}
                />
            </p>
        );

        return terms;
    }

    render() {
        const {
            customDescriptionText,
            siteName,
        } = this.props;

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className={'form-group has-error'}>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        if (this.state.loading) {
            return (<LoadingScreen/>);
        }

        let ltiSignup = this.renderLTISignup();

        if (this.state.invalidRequest) {
            ltiSignup = null;
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container padding--less'>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                            alt=''
                        />
                        <SiteNameAndDescription
                            customDescriptionText={customDescriptionText}
                            siteName={siteName}
                        />
                        <p className='color--light h4'>
                            <FormattedMessage
                                id='signup_user_completed.lets'
                                defaultMessage="Let's create your account"
                            />
                        </p>
                        {ltiSignup}
                        {serverError}
                    </div>
                </div>
            </div>
        );
    }
}
