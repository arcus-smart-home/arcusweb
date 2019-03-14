/**
 * Copyright 2019 Arcus Project
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Component from 'can-component';
import canDev from 'can-util/js/dev/';
import canMap from 'can-map';
import 'can-map-define';
import Hls from 'hls.js';
import moment from 'moment';
import Recording from 'i2web/models/recording';
import Notifications from 'i2web/plugins/notifications';
import Errors from 'i2web/plugins/errors';
import view from './recording.stache';
import AppState from 'i2web/plugins/get-app-state';
import { isIE11, isMobileSafari } from 'i2web/helpers/global';
import _ from 'lodash';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {boolean} bufferStalled
     * @parent i2web/components/recording
     * @description Set to true when the buffer stalls
     */
    bufferStalled: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} canPinRecording
     * @parent i2web/components/recording
     * @description Whether the recording can be pinned by the user
     */
    canPinRecording: {
      value: true,
    },
    /**
     * @property {boolean} canDisplayVideoControls
     * @parent i2web/components/recording
     * @description Whether the video controls should be rendered
     */
    canDisplayVideoControls: {
      get() {
        return (
          !this.attr('isFullscreen') &&
          !this.attr('confirmDelete') &&
          !this.attr('confirmUnpinning') &&
          !this.attr('isRecording')
        );
      },
    },
    /**
     * @property {string} cameraName
     * @parent i2web/components/recording
     * @description The name of the camera that recorded this recording
     */
    cameraName: {
      type: 'string',
    },
    /**
     * @property {Recording} recording
     * @parent i2web/components/recording
     * @description The particular recording we are going to interact with
     */
    recording: {
      Type: Recording,
    },
    /**
     * @property {boolean} confirmDelete
     * @parent i2web/components/recording
     * @description Whether or not to show the 'confirm-delete' div
     */
    confirmDelete: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} confirmUnpinning
     * @parent i2web/components/recording
     * @description Whether or not to show the 'confirm-delete' div when
     * unpinning expired clips
     */
    confirmUnpinning: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {string} displayDateTime
     * @parent i2web/components/recording
     * @description Convert the UTC dateTime name of the recording to a local dateTime name
     */
    displayDateTime: {
      get() {
        return (this.attr('recording'))
          ? moment(this.attr('recording.video:timestamp')).format('MM/DD/YY hh:mm A')
          : '';
      },
    },
    /**
     * @property {string} durationInMinutes
     * @parent i2web/components/recording
     * @description Human readable string of video:duration
     */
    duration: {
      get() {
        const duration = this.attr('recording.video:duration')
          ? Math.round(this.attr('recording.video:duration'))
          : 0;
        if (duration === 0) return '';
        if (duration >= 60) {
          const seconds = Math.round(duration % 60);
          const minutes = Math.round(duration / 60);
          return (seconds > 0) ? `${minutes}m ${seconds}s` : `${minutes}m`;
        }
        return `${Math.round(duration)}s`;
      },
    },
    /**
     * @property {string} expirationDuration
     * @parent i2web/components/recording
     * @description Human readable string of amount of time before video:deleteTime
     */
    expirationDuration: {
      get() {
        const deleteTime = this.attr('recording.video:deleteTime');
        const isFavorite = this.attr('recording.isFavorite');
        if (deleteTime && !isFavorite) {
          const expiration = moment(deleteTime);
          const rightNow = moment();
          const timeDiff = expiration.diff(rightNow);
          if (timeDiff > 0) {
            const duration = moment.duration(timeDiff);
            if (duration) {
              const days = duration.days();
              const hours = duration.hours();
              const mins = duration.minutes();
              if (days > 1 || (days === 1 && hours === 0)) {
                return `Expires ${days}d`;
              } else if (days > 0) {
                return `Expires 1d, ${hours}h`;
              } else if (hours > 0) {
                return `Expires ${hours}h, ${mins}m`;
              }
              return `Expires ${mins}m`;
            }
          } else {
            return 'Expired';
          }
        }
        return ' ';
      },
    },
    /**
     * @property {HLS} hls
     * @parent i2web/components/recording
     * @description HLS object representing the stream
     */
    hls: {
      type: '*',
    },
    /**
     * @property {boolean} isPlaying
     * @parent i2web/components/recording
     * @description Whether the recording is playing or not (defaults to not playing)
     */
    isPlaying: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isRecording
     * @parent i2web/components/recording
     * @description Whether the recording is currently being recorded (duration is not yet set)
     */
    isRecording: {
      get() {
        const subsystems = AppState().attr('subsystems');
        if (subsystems) {
          const subsystem = subsystems.findByName('subcameras');
          if (subsystem && subsystem.hasCapability('camerastatus')) {
            const cameraRecording = subsystem.attr(`camerastatus:activeRecording:${this.attr('recording.video:cameraid')}`);
            // checks the activeRecording address with the recording's base address. If they match then that clip is being recorded.
            return cameraRecording === this.attr('recording.base:address');
          }
        }
        return false;
      },
    },
    /**
     * @property {boolean} mediaAttached
     * @parent i2web/components/recording
     * @description Whether the stream has been attached to the HLS library
     */
    mediaAttached: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} contentNotFound
     * @parent i2web/components/recording
     * @description Set to true when the clip video source cannot be found.
     */
    contentNotFound: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {object} stream
     * @parent i2web/components/recording
     * @description Object containing stream urls, poster url, expiration ms
     */
    stream: {
      type: '*',
    },
    /**
     * @property {boolean} isFullscreen
     * @parent i2web/components/recording
     * @description Whether or not the video is in fullscreen mode or not
     */
    isFullscreen: {
      type: 'boolean',
      set(isFullscreen) {
        const wrapper = this.attr('videoWrapper');
        if (isFullscreen) {
          if (wrapper && wrapper.requestFullscreen) {
            wrapper.requestFullscreen().catch(e => canDev.warn(e));
          } else if (isMobileSafari() && wrapper && wrapper.webkitEnterFullScreen && !wrapper.webkitDisplayingFullscreen) {
            wrapper.webkitEnterFullscreen();
          }
        } else if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen();
        } else if (isMobileSafari() && wrapper && wrapper.webkitExitFullScreen && wrapper.webkitDisplayingFullscreen) {
          wrapper.webkitExitFullScreen();
        }
        return isFullscreen;
      },
    },
    /**
     * @property {Element} video
     * @property {Element} video
     * @parent i2web/components/recording
     * @description The video element playing the recording
     */
    video: {
      get() {
        return document.getElementById(`video-${this.attr('recording.base:id')}`);
      },
    },
    /**
     * @property {Element} videoWrapper
     * @parent i2web/components/recording
     * @description HTML Element representing the wrapper of the video stream, but not the video
     * element itself
     */
    videoWrapper: {
      get() {
        return document.getElementById(`video-${this.attr('recording.base:id')}`);
      },
    },
  },
  /**
   * @function acquireStream
   * @parent i2web/components/recording
   * Acquires a URL stream from a recording
   */
  acquireStream() {
    return new Promise((resolve, reject) => {
      const recordingView = this.attr('recording').View();
      if (recordingView) {
        recordingView.then((stream) => {
          this.attr('stream', stream);
          resolve(stream.preview);
        }).catch((e) => {
          Errors.log(e);
          reject(e);
        });
      } else {
        reject();
      }
    });
  },
  /**
   * @function deleteRecording
   * @description Mark the recording for deletion
   */
  deleteRecording() {
    this.attr('confirmDelete', false);
    this.attr('recording').Delete().then(() => {
      Notifications.success('Selected Recording has been Deleted', 'icon-app-clip-1');
    }).catch(e => Errors.log(e));
  },
  /**
   * @function downloadRecording
   * @description Download the recording to the users machine
   */
  downloadRecording() {
    if (this.attr('isRecording')) {
      // disallow download while recording is in progress.
      return;
    }

    this.attr('recording').Download().then((download) => {
      const ifr = document.createElement('iframe');
      ifr.src = download.mp4;
      ifr.style.display = 'none';

      document.body.appendChild(ifr);
      setTimeout(() => {
        document.body.removeChild(ifr);
      }, 5000);
    }).catch(e => Errors.log(e));
  },
  /**
   * @function playVideoFullscreen
   * @description Play the video recording in fullscreen
   */
  playVideoFullscreen() {
    this.attr('isFullscreen', true);
    this.playVideo();
  },
  /**
   * @function debouncedRecoverableHandler
   * @description Handle a recoverable error in HLS
   */
  debouncedRecoverableHandler: _.debounce(function nondebounced(data) {
    canDev.warn(`Recoverable HLS error: ${data.type} -- ${data.details}`);
    this.attr('hls').recoverMediaError();
    this.attr('video').play();
  }, 2000, {
    leading: true,
    trailing: false,
  }),
  /**
   * @function onUnpinExpiredClip
   * @parent i2web/components/recording
   * @description Callback to be executed when user tries to unpin an expired video clip
   */
  onUnpinExpiredClip() {
    this.attr('confirmUnpinning', true);
  },
  /**
   * @function cancelUnpinExpiredClip
   * @parent i2web/components/recording
   * @description Callback to be executed when user cancel the unpinning of an
   * expired video clip
   */
  cancelUnpinExpiredClip() {
    this.attr('confirmUnpinning', false);
  },
  /**
   * @function confirmUnpinExpiredClip
   * @parent i2web/components/recording
   * @description Callback to be executed when user confirms the unpinning of an
   * expired video clip
   */
  confirmUnpinExpiredClip() {
    this.attr('confirmUnpinning', false);
    return this.unpinExpiredClip();
  },
  /**
   * @function playVideo
   * @description Play the video recording
   */
  playVideo() {
    this.resetHlsPlaybackErrors();
    if (this.attr('stream') && !this.attr('hls')) {
      this.attr('hls', new Hls({ fragLoadingMaxRetryTimeout: 4000 }));
    }
    const hls = this.attr('hls');
    const onHlsError = this.onHlsError.bind(this);
    hls.on(Hls.Events.ERROR, onHlsError);

    if (!isMobileSafari() && !this.attr('mediaAttached')) {
      const onHlsBufferAppended = this.onHlsBufferAppended.bind(this);
      const onHlsMediaAttached = this.onHlsMediaAttached.bind(this);
      hls.on(Hls.Events.BUFFER_APPENDED, onHlsBufferAppended);
      hls.on(Hls.Events.MEDIA_ATTACHED, onHlsMediaAttached);
      hls.attachMedia(this.attr('video'));
    }
    this.attr('video').play();
    this.attr('isPlaying', true);
  },
  /**
   * @function onHlsBufferAppended
   * @parent i2web/components/recording
   * @description Callback to be executed when video fragment is appended to HLS buffer
   */
  onHlsBufferAppended() {
    this.attr('bufferStalled', false);
  },
  /**
   * @function onHlsError
   * @parent i2web/components/recording
   * @description Callback to be executed when an error event is raised by the HLS framework
   */
  onHlsError(ev, data) {
    if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
      // If buffer stalls and never recovers, we'll auto-collapse the fullscreen player after
      // the fragLoadingRetry reaches its upper limit
      this.attr('bufferStalled', true);
    }
    if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR && data.response && data.response.code === 404) {
      // Video source wasn't found.  this is usually due to the system
      // starting and immediately stopping the recording of a clip,
      // leading to metadata about a <1s clip but no actual data.
      this.attr('contentNotFound', true);
    } else if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          if (this.attr('bufferStalled') && data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
            this.pauseVideo();
          } else if (this.attr('hls')) {
            this.attr('hls').startLoad();
          }
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          this.debouncedRecoverableHandler(data);
          break;
        default:
          Errors.log(`Unrecoverable HLS error: ${data.type} for ${data.context ? data.context.url : '?'}`);
          break;
      }
    }
  },
  /**
   * @function onHlsMediaAttached
   * @parent i2web/components/recording
   * @description Callback to be executed when video is attached to HLS object
   */
  onHlsMediaAttached() {
    const hls = this.attr('hls');
    const stream = this.attr('stream');
    this.attr('mediaAttached', true);
    hls.loadSource(stream.hls);
  },
  /**
   * @function playVideo
   * @description Pause the video recording
   */
  pauseVideo() {
    this.attr('video').pause();
    this.resetHlsPlaybackErrors();
    const hls = this.attr('hls');
    if (hls) {
      hls.off(Hls.Events.MEDIA_ATTACHED, this.onHlsMediaAttached);
      hls.off(Hls.Events.BUFFER_APPENDED, this.onHlsBufferAppended);
      hls.detachMedia();
      hls.destroy();
      this.removeAttr('hls');
    }
    this.attr('mediaAttached', false);
    this.attr('isPlaying', false);
    this.attr('isFullscreen', false);
  },
  /**
   * @function resetHlsPlaybackErrors
   * @description Resets the error attributes that help us collapse fullscreen on stalled video
   */
  resetHlsPlaybackErrors() {
    this.attr('bufferStalled', false);
  },
  /**
   * @function toggleConfirmDelete
   * @description Toggle the displaying of the 'confirm-delete' div
   */
  toggleConfirmDelete() {
    if (this.attr('isRecording')) {
      // disallow deletion while recording is in progress.
      return;
    }

    this.attr('confirmDelete', !this.attr('confirmDelete'));
  },
  /**
   * @function formatTime
   * @param {number} time The time in seconds to format
   * @description Formats a number of seconds to `mm:ss`
   */
  formatTime(time) {
    const duration = moment.duration(time, 'seconds');

    return moment(duration._data).format('mm:ss');
  },
});

export default Component.extend({
  tag: 'arcus-recording',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const video = this.element.querySelector('video');
      this.toggleFullscreen = this.toggleFullscreen.bind(this);
      this.onVideoEnded = this.onVideoEnded.bind(this);
      video.addEventListener('ended', this.onVideoEnded);

      if (isMobileSafari()) {
        video.addEventListener('webkitendfullscreen', this.toggleFullscreen);
      } else {
        document.addEventListener('fullscreenchange', this.toggleFullscreen);
      }
    },
    toggleFullscreen(ev) {
      if (!this.viewModel.attr('isPlaying')) {
        return;
      }
      if (ev.srcElement === this.viewModel.attr('videoWrapper')
        || (ev.srcElement === document && !document.fullscreenElement)) {
        const outOfSync = this.viewModel.attr('isFullscreen') !== !!document.fullscreenElement;
        if (outOfSync) {
          this.viewModel.attr('isFullscreen', !this.viewModel.attr('isFullscreen'));
        }
      } else if (!ev.srcElement || isIE11()) {
        // For Firefox and any browser not supporting event.srcElement
        this.viewModel.attr('isFullscreen', !!document.fullscreenElement);
      }
      const recordingFn = this.viewModel.attr('isFullscreen') ? 'playVideo' : 'pauseVideo';
      this.viewModel[recordingFn]();
    },
    onVideoEnded() {
      this.viewModel.attr('video').currentTime = 0;
      this.viewModel.pauseVideo();
    },
    removed() {
      const video = this.element.querySelector('video');
      const hls = this.viewModel.attr('hls');
      if (video) {
        video.removeEventListener('ended', this.onVideoEnded);
      }
      if (isMobileSafari()) {
        if (video) {
          video.removeEventListener('webkitendfullscreen', this.toggleFullscreen);
        }
      } else {
        document.removeEventListener('fullscreenchange', this.toggleFullscreen);
      }
      if (hls) {
        hls.off(Hls.Events.MEDIA_ATTACHED, this.viewModel.onHlsMediaAttached);
        hls.off(Hls.Events.BUFFER_APPENDED, this.viewModel.onHlsBufferAppended);
        hls.detachMedia();
      }
    },
  },
});
