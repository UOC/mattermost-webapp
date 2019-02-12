// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {logger} from '../../utils/riff';

import SharedScreen from './SharedScreen';
import PeerVideo from './PeerVideo';

class RemoteVideoContainer extends React.Component {
    constructor(props) {
        super(props);
        logger.debug('remote video props:', props);
    }

    peerVideo(peerLength) {
        // returns a function
        // close over peerLength
        return (peer) => {
            const [riffId, displayName] = peer.nick.split('|'); // eslint-disable-line no-unused-vars
            const riffIds = [...this.props.chat.webRtcRiffIds].sort();
            logger.debug('riff ids:', riffIds);
            const idx = riffIds.indexOf(riffId);
            const peerColor = this.props.chat.peerColors[idx];
            logger.debug('!!PEER COLOR:', peerColor, 'IDX:', idx, 'Riff ID:', riffId);
            return (
                <PeerVideo
                    key={peer.id}
                    id={peer.id}
                    videoEl={peer.videoEl}
                    type="peer"
                    peerColor={peerColor}
                    peerLength={peerLength}
                />
            );
        };
    }

    addPeerVideos() {
        const peerLength = this.props.peers.length;
        logger.debug('rendering', peerLength, 'peers....', this.props.peers);
        logger.debug('names:', this.props.chat.webRtcPeerDisplayNames);
        logger.debug('riff ids:', this.props.chat.webRtcRiffIds);
        return this.props.peers.map(this.peerVideo(peerLength));
    }

    videos() {
        if (this.props.remoteSharedScreen) {
            return (
                <SharedScreen
                    videoEl={this.props.remoteSharedScreen}
                    peers={this.props.peers}
                />
            );
        }

        return this.addPeerVideos();
    }

    render() {
        return (
            <div className="remotes" id="remoteVideos">
                <div ref="remotes" className="columns is-multiline is-centered is-mobile">
                    {this.videos()}
                </div>
            </div>
        );
    }
}

export default RemoteVideoContainer;
