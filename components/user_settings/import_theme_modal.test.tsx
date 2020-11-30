// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Theme} from 'mattermost-redux/types/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {blendColors} from 'mattermost-redux/utils/theme_utils';

import {mountWithIntl, shallowWithIntl} from 'tests/helpers/intl-test-helper';

import ImportThemeModal from './import_theme_modal';

describe('components/user_settings/ImportThemeModal', () => {
    it('should match snapshot', () => {
        const wrapper = shallowWithIntl(<ImportThemeModal/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should correctly parse a Slack theme', () => {
        const slackThemeProps: Array<[keyof Theme | null, string]> = [
            ['sidebarBg', '#010101'],
            ['sidebarHeaderBg', '#a2a2a2'],
            ['sidebarTextActiveBorder', '#030303'],
            ['sidebarTextActiveColor', '#040404'],
            ['sidebarTextHoverBg', '#050505'],
            ['sidebarText', '#060606'],
            ['onlineIndicator', '#070707'],
            ['mentionBg', '#080808'],
            [null, '#090909'], // topNavBg: desktop only, not used by MM
            [null, '#0a0a0a'], // topNavText: desktop only, not used by MM
        ];
        const slackTheme: Theme = slackThemeProps.reduce(
            (theme: Theme, prop: [keyof Theme | null, string]) => {
                if (prop[0] !== null) {
                    theme[prop[0]] = prop[1];
                }
                return theme;
            },
            {...Preferences.THEMES.default, type: 'custom'},
        );

        // the slack sidebarText also applies to 2 other MM theme props:
        const sidebarText = slackThemeProps.find((p) => p[0] === 'sidebarText')?.[1] || '#01233210';
        slackTheme.sidebarHeaderTextColor = sidebarText;
        slackTheme.sidebarUnreadText = sidebarText;

        // the slack sidebarHeaderBg is also used to set the sidebarTeamBarBg using blendColors
        slackTheme.sidebarTeamBarBg = blendColors(slackTheme.sidebarHeaderBg, '#000000', 0.2, true);

        const themeString = slackThemeProps.map((p) => p[1]).join(',');
        const wrapper = mountWithIntl(<ImportThemeModal/>);
        const instance = wrapper.instance();

        const callback = jest.fn();

        instance.setState({show: true, callback});
        wrapper.update();

        wrapper.find('input').simulate('change', {target: {value: themeString}});

        wrapper.find('#submitButton').simulate('click');

        expect(callback).toHaveBeenCalledWith(slackTheme);
    });
});
