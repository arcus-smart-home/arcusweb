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

import $ from 'jquery';
import Component from 'can-component';
import canDev from 'can-util/js/dev/';
import canMap from 'can-map';
import 'can-map-define';
import domAttr from 'can-util/dom/attr/attr';
import Hls from 'hls.js';
import Analytics from 'i2web/plugins/analytics';
import AppState from 'i2web/plugins/get-app-state';
import Errors from 'i2web/plugins/errors';
import SidePanel from 'i2web/plugins/side-panel';
import uniqueId from 'i2web/plugins/unique-id';
import Device from 'i2web/models/device';
import Recording from 'i2web/models/recording';
import VideoService from 'i2web/models/service/VideoService';
import CameraStatusCapability from 'i2web/models/capability/CameraStatus';
import CellBackupSubsystem from 'i2web/models/capability/CellBackupSubsystem';
import 'i2web/components/device/configuration-panel/';
import view from './camera.stache';
import { formatDate, formatTime, isIE11, isMobileSafari } from 'i2web/helpers/global';

// We need to ensure we do not get ourselves into an infinite loop when we error
// requesting the camera stream. These do not need to be observable. This matches
// the Android behavior.
let delayInStreamLoad = 0;
const REQUEST_DELAY = 1000;
const REQUEST_RETRY = 30;
const MAX_REQUEST_DELAY = REQUEST_RETRY * REQUEST_DELAY;

const BASE_VIDEO_SRC = '/src/images/video_loading.mp4';
const KEEP_AWAKE_POLLING_INTERVAL = 20 * 1000;
const KEEP_AWAKE_TIMESPAN = 30;
const KEEP_AWAKE_INITIAL_TIMESPAN = 90;

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {boolean} allowFullscreen
     * @parent i2web/components/camera
     * @description Whether or not fullscreen is supported
     */
    allowFullscreen: {
      get() {
        return !!document.documentElement.requestFullscreen || isMobileSafari();
      },
    },
    /**
     * @property {Device} camera
     * @parent i2web/components/camera
     * @description The camera from which we will get the preview image
     */
    camera: {
      Type: Device,
    },
    /**
     * @property {HLS} hls
     * @parent i2web/components/camera
     * @description HLS object representing the stream
     */
    hls: {
      type: '*',
    },
    /**
     * @property {boolean} isFullscreen
     * @parent i2web/components/camera
     * @description Whether or not the video is in fullscreen mode or not
     */
    isFullscreen: {
      type: 'boolean',
      set(isFullscreen) {
        const wrapper = this.attr('videoWrapper');
        // IE fix: when popping into fullscreen, make sure
        //  the controls are applied to the video element *first*,
        //  otherwise it gets confused and doesn't show the "collapse full screen"
        //  button.
        if (isIE11() && this.attr('video')) {
          this.attr('nativeControlState', isFullscreen);
        }

        if (isFullscreen) {
          // on IOS the function is "webkitEnterFullscreen", but it's not allowed
          // until metadata is loaded and there is user interaction.  That case
          // is handled with special styling to fake fullscreen until user interaction.
          // Below is the handler for all other platforms where fullscreen is available.
          if (wrapper && wrapper.requestFullscreen) {
            const fsPromise = wrapper.requestFullscreen();
            if (fsPromise) {
              fsPromise.catch(e => canDev.warn(e));
            }
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
     * @property {boolean} loadingMedia
     * @parent i2web/components/camera
     * @description Indicates a stream started playing but has encountered an error in loading additional media
     */
    loadingMedia: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} noPreview
     * @parent i2web/components/camera
     * @description Whether or not this camera has a preview image
     */
    noPreview: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {boolean} piggybacked
     * @parent i2web/components/camera
     * @description Whether or not the web user has piggy-backed onto an existing recording
     */
    piggybacked: {
      type: 'boolean',
    },
    /**
     * @property {boolean} inlinePlay
     * @parent i2web/components/camera
     * @description Whether or not this camera can be played inline
     */
    inlinePlay: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {boolean} showVideo
     * @parent i2web/components/camera
     * @description Whether or not to show the video element. If we allow inline playing, show
     * when playingOrRecording is true, otherwise when fullscreen
     */
    showVideo: {
      get() {
        const inlinePlay = this.attr('inlinePlay');
        const isFullscreen = this.attr('isFullscreen');
        const playingOrRecording = this.attr('playingOrRecording');
        const noPreview = this.attr('noPreview');

        if (noPreview) {
          return true;
        }

        if (inlinePlay) {
          return playingOrRecording;
        }

        return isFullscreen;
      },
    },
    /**
     * @property {boolean} playable
     * @parent i2web/components/camera
     * @description Whether the stream is playable
     */
    playable: {
      type: 'boolean',
    },
    /**
     * @property {boolean} playingOrRecording
     * @parent i2web/components/camera
     * @description Whether the camera's video is playing and/or recording, or not
     */
    playingOrRecording: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {htmlbool} previewOnly
     * @parent i2web/components/camera
     * @description Whether or not the video component is in preview-only mode
     * (i.e. no controls, no stream/recording, just image fetching on an interval)
     */
    previewOnly: {
      type: 'htmlbool',
    },
    /**
     * @property {htmlbool} disableFavConfig
     * @parent i2web/components/camera
     * @description Whether or not the video component should render favorites and config
     * buttons
     */
    disableFavConfig: {
      type: 'htmlbool',
    },
    /**
     * @property {boolean} recording
     * @parent i2web/components/camera
     * @description Whether, when we play the video, we are recording or streaming
     */
    recording: {
      type: 'boolean',
    },
    /**
     * @property {boolean} recordingEnabled
     * @parent i2web/components/camera
     * @description Whether the camera can record, dictated by the subsystem, as well as the type of camera
     */
    recordingEnabled: {
      get() {
        return this.attr('camera.web:camera:supportsUserRecording') && this.attr('cameraSubsystem.subcameras:recordingEnabled');
      },
    },
    /**
     * @property {string} cameraSubsystem
     * @parent i2web/components/camera
     * @description Camera subsystem with camerastatus capability
     */
    cameraSubsystem: {
      get() {
        const subsystems = AppState().attr('subsystems');
        if (subsystems) {
          const subsystem = subsystems.findByName('subcameras');
          if (subsystem && subsystem.hasCapability('camerastatus')) {
            return subsystem;
          }
        }
        return undefined;
      },
    },
    /**
     * @property {string} activeRecording
     * @parent i2web/components/camera
     * @description Active Recording id from the camera subsystem camerastatus
     */
    activeRecording: {
      get() {
        const subsystem = this.attr('cameraSubsystem');
        if (subsystem) {
          const activeRecording = subsystem.attr(`camerastatus:activeRecording:${this.attr('camera.base:id')}`);
          const activeRecordingId = this.getRecordingBaseId(activeRecording);
          const stream = this.attr('stream');
          if (activeRecordingId && stream && activeRecordingId === stream.recordingId) {
            this.loadAndAttach(stream);
          }
          return activeRecordingId;
        }
        return undefined;
      },
    },
    /**
     * @property {string} archiveRecording
     * @parent i2web/components/camera
     * @description Only returns an Active Recording Id from the camera subsystem camerastatus when it represents a
     * recording that will be archived (as opposed to a recording object of type STREAM)
     */
    archiveRecording: {
      get() {
        const subsystem = this.attr('cameraSubsystem');
        if (subsystem
          && subsystem.attr(`camerastatus:state:${this.attr('camera.base:id')}`) === CameraStatusCapability.STATE_RECORDING) {
          return this.getRecordingBaseId(subsystem.attr(`camerastatus:activeRecording:${this.attr('camera.base:id')}`));
        }
        return undefined;
      },
    },
    /**
     * @property {string} cameraState
     * @parent i2web/components/camera
     * @description Camera state from the camera subsystem status
     */
    cameraState: {
      get() {
        const subsystem = this.attr('cameraSubsystem');
        if (subsystem) {
          return subsystem.attr(`camerastatus:state:${this.attr('camera.base:id')}`);
        }
        return undefined;
      },
    },
    /**
     * @property {string} nativeControlState
     * @parent i2web/components/camera
     * @description Whether to show the native controls for video playback
     */
    nativeControlState: {
      get(lastSetVal) {
        if (isIE11() && this.attr('noPreview')) {
          return true;
        }
        return lastSetVal == null ? this.attr('isFullscreen') : !!lastSetVal;
      },
    },
    /**
     * @property {string} statusText
     * @parent i2web/components/camera
     * @description The status, displayed in a human readable form, of the camera
     */
    statusText: {
      get() {
        if (this.attr('onCellBackup')) {
          return 'Streaming not available on Cellular Backup';
        } else if (this.attr('camera.isFirmwareUpdateInProgress')) {
          return 'Streaming unavailable during firmware update';
        }
        const subsystem = this.attr('cameraSubsystem');
        if (subsystem) {
          const cameraState = this.attr('cameraState');
          const activeRecording = this.attr('activeRecording'); // eslint-disable-line
          const archiveRecording = this.attr('archiveRecording');
          if (this.attr('camera.isOffline')) {
            return 'Offline';
          } else if ([CameraStatusCapability.STATE_RECORDING, CameraStatusCapability.STATE_STREAMING, CameraStatusCapability.STATE_IDLE].includes(cameraState)) {
            if (archiveRecording && this.attr('camera.web:camera:supportsUserRecording')) {
              return 'Recording';
            }
            const lastActivityTime = subsystem.attr(`camerastatus:lastRecordingTime:${this.attr('camera.base:id')}`);
            if (lastActivityTime) {
              return `Last Recording: ${formatDate(lastActivityTime)} at ${formatTime(lastActivityTime)}`;
            }
          }
        }
        return '';
      },
    },
    /**
     * @property {stream} streamAttachTimeoutId
     * @parent i2web/components/camera
     * @description Cleans up view model when a client request is made to start streaming, but platform never
     * updates the camera's state to indicate the stream is active
     */
    streamAttachTimeoutId: {
      type: 'integer',
    },
    /**
     * @property {stream} stream
     * @parent i2web/components/camera
     * @description The stream object returned by the latest request to StartRecording, or null if this component is not streaming
     */
    stream: {
      type: '*',
      set(value) {
        const clearTimeoutId = this.attr('streamAttachTimeoutId');
        if (value) {
          this.attr('streamAttachTimeoutId', setTimeout(() => {
            Analytics.tag('device.stream.timeout');
            this.stopFullscreenStreaming();
          }, MAX_REQUEST_DELAY));
        }
        if (clearTimeoutId) {
          clearTimeout(clearTimeoutId);
        }
        return value;
      },
    },
    /**
     * @property {boolean} recordButtonDisabled
     * @parent i2web/components/camera
     * @description Whether just the record button is disabled
     */
    recordButtonDisabled: {
      get() {
        return this.attr('recording') || this.attr('onCellBackup') || this.attr('camera.isFirmwareUpdateInProgress') || this.attr('loadingMedia') || this.attr('archiveRecording');
      },
    },
    /**
     * @property {boolean} streamRecordDisabled
     * @parent i2web/components/camera
     * @description Whether the stream and record buttons are disabled
     */
    streamRecordDisabled: {
      get() {
        return this.attr('recording') || this.attr('onCellBackup') || this.attr('camera.isFirmwareUpdateInProgress');
      },
    },
    /**
     * @property {boolean} onCellBackup
     * @parent i2web/components/camera
     * @description Whether the cellular backup system is active
     */
    onCellBackup: {
      get() {
        const subsystems = AppState().attr('subsystems');
        if (subsystems) {
          const cellbackup = subsystems.findByName('cellbackup');
          if (cellbackup && cellbackup.attr('cellbackup:status') === CellBackupSubsystem.STATUS_ACTIVE) {
            return true;
          }
        }
        return false;
      },
    },
    /**
     * @property {Number} pollingInterval
     * @parent i2web/components/camera
     * @description Holds the interval ID for camera keepAwake polling
     */
    pollingInterval: {
      type: 'number',
    },
    /**
     * @property {string} uniqueID
     * @parent i2web/components/camera
     * @description A unique to identify preview images, and videos
     */
    uniqueID: {
      value() {
        return uniqueId();
      },
    },
    /**
     * @property {Element} video
     * @parent i2web/components/camera
     * @description HTML Element representing the video stream
     */
    video: {
      get() {
        return document.getElementById(`video-${this.attr('uniqueID')}`);
      },
    },
    /**
     * @property {Element} videoWrapper
     * @parent i2web/components/camera
     * @description HTML Element representing the wrapper of the video stream, but not the video
     * element itself
     */
    videoWrapper: {
      get() {
        return document.getElementById(`video-${this.attr('uniqueID')}`);
      },
    },
  },
  /**
   * @function getRecordingBaseId
   * @param {string} recordingBaseAddress
   * Strip the destination from the recording's base address and return the base id
   */
  getRecordingBaseId(recordingBaseAddress) {
    return recordingBaseAddress && recordingBaseAddress.indexOf('SERV:video') === 0 ? recordingBaseAddress.substr(11) : recordingBaseAddress;
  },
  /**
   * @function loadAndAttach
   * @param {Object} stream
   * Load, parse, and attach the camera stream to the video element
   */
  loadAndAttach(stream) {
    // Clear the timeout that was set to clean up in case we never reached the loadAndAttach point
    if (this.attr('streamAttachTimeoutId')) {
      clearTimeout(this.attr('streamAttachTimeoutId'));
      this.removeAttr('streamAttachTimeoutId');
    }
    const hls = new Hls();
    const video = this.attr('video');
    if (isMobileSafari()) {
      setTimeout(() => {
        this.attr('hls', hls);
        this.attr('playingOrRecording', true);
        this.attr('loadingMedia', false);
        domAttr.set(video, 'src', stream.hls);
        domAttr.set(video, 'autoplay', 'autoplay');
        this.attr('nativeControlState', this.attr('isFullscreen'));
        video.play();
      }, 2000);
      return;
    }
    hls.on(Hls.Events.ERROR, (ev, data) => {
      if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
        delayInStreamLoad += REQUEST_DELAY;
        if (delayInStreamLoad < MAX_REQUEST_DELAY) {
          setTimeout(() => {
            hls.loadSource(stream.hls);
          }, REQUEST_DELAY);
        } else {
          this.stopFullscreenStreaming();
          Analytics.tag('device.stream.timeout');
          Errors.log(`Unable to load manifest after ${REQUEST_RETRY} retries: ${stream.hls}`);
        }
      } else if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            Errors.log(`Unrecoverable HLS error: ${data.type} ${stream.hls}`);
            this.stopFullscreenStreaming();
            break;
        }
        Analytics.tag('device.stream.error');
      } else if (data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR) {
        this.attr('loadingMedia', true);
      }
    });
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      delayInStreamLoad = 0;
      this.attr('playingOrRecording', true);
      this.attr('loadingMedia', false);
      this.attr('hls', hls);
      hls.attachMedia(this.attr('video'));
      this.attr('video').play();
      if (this.attr('camera').KeepAwake) {
        this.startPolling();
      }

      // This is the only play() request where we should send the Analytics tag
      // since the others are Mobile Safari-specific workarounds
      Analytics.tag('device.stream.opened');
      if (this.attr('isFullscreen')) {
        domAttr.set(video, 'controls', true);
      } else {
        domAttr.remove(video, 'controls');
      }
    });
    hls.on(Hls.Events.LEVEL_LOADED, () => {
      this.attr('loadingMedia', false);
    });
    hls.on(Hls.Events.BUFFER_EOS, () => {
      this.stopFullscreenStreaming();
    });
    hls.loadSource(stream.hls);
  },
  /**
   * @function {string} playStatus
   * @parent i2web/components/camera
   * Used to determine the color of the video button badge indicating whether
   * the camera is streaming or recording
   */
  playStatus(capitalize = true) {
    const loadingMedia = this.attr('loadingMedia');
    if (loadingMedia) {
      if (this.attr('piggybacked') && this.attr('camera.web:camera:supportsUserRecording')) {
        return (capitalize) ? 'JOINING IN-PROGRESS...' : 'joining in-progress';
      }
      return (capitalize) ? 'LOADING...' : 'loading';
    }
    if (this.attr('playingOrRecording')) {
      const status = (this.attr('camera.web:camera:supportsUserRecording') &&
        (this.attr('recording') || this.attr('piggybacked'))) ? 'rec' : 'live';
      return (capitalize) ? status.toUpperCase() : status;
    }
    return '';
  },
  /**
   * @function streamOrRecordVideo
   * @parent i2web/components/camera
   * Start recording or streaming the camera's video
   */
  streamOrRecordVideo(type) {
    const streamOnly = (type === 'STREAM');
    // Stop any existing stream before starting a new recording
    if (this.attr('playingOrRecording') && !streamOnly) this.stopStreaming();
    this.attr('recording', !streamOnly);

    // We call video.play() here and not where we'd like it to be (i.e. when HLS streaming
    //  is ready) because on some platforms, play() *must* be called within
    //  a user interaction context, and streamOrRecordVideo() is currently a click
    //  handler.  If the code changes such that streamOrRecordVideo is no longer
    //  a click handler, this line must be moved.  --BM 2017-07-14
    this.attr('loadingMedia', true);
    this.attr('piggybacked', false);
    if (isMobileSafari()) this.attr('video').play();
    const archiveRecording = this.attr('archiveRecording');
    if (archiveRecording) {
      Recording.get({ 'base:id': archiveRecording }).then((recordingInProgress) => {
        recordingInProgress.View().then((stream) => {
          this.attr('piggybacked', true);
          this.attr('stream', stream);
          this.loadAndAttach(stream);
        }).catch((e) => {
          Analytics.tag('device.stream.failed');
          this.attr('loadingMedia', false);
          Errors.log(e);
        });
      }).catch((e) => {
        Analytics.tag('device.stream.failed');
        this.attr('loadingMedia', false);
        Errors.log(e);
      });
    } else {
      const vm = this;
      VideoService.StartRecording(AppState().attr('place.base:id'), AppState().attr('account.base:id'),
        this.attr('camera.base:address'), streamOnly, null).then((stream) => {
          const camera = vm.attr('camera');
          if (camera.KeepAwake) camera.KeepAwake(KEEP_AWAKE_INITIAL_TIMESPAN).catch(Errors.log);
          vm.attr('stream', stream);
        }).catch((e) => {
          Analytics.tag('device.stream.failed');
          vm.attr('loadingMedia', false);
          Errors.log(e);
        });
    }
  },
  /**
   * @function showCameraSettings
   * @parent i2web/components/camera
   * Opens the camera settings configuration panel
   */
  showCameraSettings() {
    SidePanel.right('{{close-button}}<arcus-device-configuration-panel {(device)}="device" />', {
      device: this.compute('camera'),
    });
  },
  /**
   * @function pollToKeepAwake
   * @parent i2web/components/camera
   * @description The polling function used to send keepAwake messages
   */
  pollToKeepAwake() {
    const camera = this.attr('camera');
    camera.KeepAwake(KEEP_AWAKE_TIMESPAN)
      .then()
      .catch(Errors.log);
  },
  /**
   * @function startOrContinuePolling
   * @parent i2web/components/camera
   * @description Start a polling interval if needed for cameras requiring keepAwake
   */
  startPolling() {
    const interval = this.attr('pollingInterval');
    if (interval) return;

    this.attr('pollingInterval',
      setInterval(this.pollToKeepAwake.bind(this), KEEP_AWAKE_POLLING_INTERVAL));
  },
  /**
   * @function stopFullscreenStreaming
   * @parent i2web/components/camera
   * Shut down fullscreen, stop all streaming, reset state
   */
  stopFullscreenStreaming() {
    if (this.attr('isFullscreen')) {
      // Only collapse the fullscreen element when this camera component started it
      this.attr('isFullscreen', false);
    }
    const vm = this;
    vm.stopStreaming();
  },
  /**
   * @function stopPolling
   * @parent i2web/components/camera
   * @description Stop the camera keepAwake polling interval
   */
  stopPolling() {
    const interval = this.attr('pollingInterval');
    if (interval) {
      clearInterval(interval);
      this.attr('pollingInterval', null);
    }
  },
  /**
   * @function stopStreaming
   * @parent i2web/components/camera
   * Stop all streaming, but not recording when the camera is removed or a carousel changes slides
   */
  stopStreaming() {
    const vm = this;
    this.stopPolling();
    if (vm.attr('hls')) {
      if (vm.attr('playingOrRecording') && !vm.attr('recording') && !vm.attr('piggybacked')) {
        const placeID = AppState().attr('place.base:id');
        if (vm.attr('stream') && vm.attr('stream').recordingId) {
          VideoService.StopRecording(placeID, vm.attr('stream').recordingId)
            .catch(e => Errors.log(e));
        }
      }
    }
    vm.stopVideo();
  },
  /**
   * @function stopVideo
   * @parent i2web/components/camera
   * Stops playing the video
   */
  stopVideo() {
    const video = this.attr('video');
    if (video) {
      Analytics.tag('device.stream.closed');
      video.pause();
    }
    if (this.attr('hls')) {
      this.attr('hls').detachMedia();
      this.attr('hls').destroy();
    }
    this.attr('recording', false);
    this.attr('piggybacked', false);
    this.attr('playingOrRecording', false);
    this.attr('loadingMedia', false);
    this.attr('stream', null);
    this.attr('hls', null);

    if (video) {
      domAttr.set(video, 'src', BASE_VIDEO_SRC);
      domAttr.remove(video, 'autoplay', null);
      domAttr.remove(video, 'controls', null);
    }
    delayInStreamLoad = 0;
  },
  /**
   * @function toggleFullScreen
   * @parent i2web/components/camera
   * Toggles fullscreen state
   */
  toggleFullScreen() {
    const setTo = !this.attr('isFullscreen');
    // Normally with iOS Safari we go to fullscreen immediately upon playing
    // but for the iPad that is not the case, it is more like desktop in that
    // the expand button must be pushed to enter fullscreen mode
    // Check first if we are playing inline because this change only affects cameras
    // on the Dashboard and the devices page
    if (this.attr('inlinePlay')) {
      if (setTo && isMobileSafari()) {
        this.attr('videoWrapper').webkitEnterFullScreen();
      }
    }
    this.attr('isFullscreen', setTo);
  },
  /**
   * @function mobileSafariFix
   * @parent i2web/components/camera
   * Mobile Safari has trouble parsing the stream data on initial load.
   * The best known fix is to set autoplay to true and then set the src
   * attribute again when an error is fired.  It will work after a few
   * seconds.
   */
  mobileSafariFix() {
    const video = this.attr('video');
    if (isMobileSafari() &&
      video.error &&
      video.error.code === video.error.MEDIA_ERR_SRC_NOT_SUPPORTED
    ) {
      domAttr.set(video, 'src', BASE_VIDEO_SRC);

      // Wait a tick after src is cleared, then
      // restore the src.
      setTimeout(() => {
        domAttr.set(video, 'src', this.attr('stream.hls'));
      }, 10);
    }
  },
  /**
   * @function mobileSafariFullscreenSync
   * @parent i2web/components/camera
   * Mobile Safari requires user interaction after metadata load to play.
   * a video fullscreen.  This is a click handler to change to fullscreen
   * after playing in a fake fullscreen mode.
   */
  mobileSafariFullscreenSync() {
    const video = this.attr('video');
    if (isMobileSafari() &&
      this.attr('isFullscreen') &&
      !video.webkitDisplayingFullscreen
    ) {
      video.webkitEnterFullScreen();
    }
  },
});

export default Component.extend({
  tag: 'arcus-camera',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const vm = this.viewModel;
      vm.attr('slideChangedFunction', () => vm.stopStreaming());
      const carousel = $(this.element).closest('arcus-carousel');
      if (carousel.length) {
        carousel.on('slideChanged', vm.attr('slideChangedFunction'));
      }
      if (isMobileSafari()) {
        const video = this.element.querySelector('video');
        if (video) {
          this.fullscreenEnded = this.fullscreenEnded.bind(this);
          video.addEventListener('webkitendfullscreen', this.fullscreenEnded);
          video.addEventListener('ended', this.fullscreenEnded);
        }
      }
    },
    removed() {
      const vm = this.viewModel;
      const carousel = $(this.element).closest('arcus-carousel');
      if (carousel.length) {
        carousel.off('slideChanged', vm.attr('slideChangedFunction'));
      }
      vm.stopStreaming();
      if (isMobileSafari()) {
        const video = this.element.querySelector('video');
        if (video) {
          video.removeEventListener('webkitendfullscreen', this.fullscreenEnded);
          video.removeEventListener('ended', this.fullscreenEnded);
        }
      }
    },
    fullscreenEnded(ev) {
      if (ev.type !== 'ended' || !(this.viewModel.attr('video').src || '').includes(BASE_VIDEO_SRC)) {
        this.viewModel.attr('isFullscreen', false);
        this.viewModel.stopStreaming();
      }
    },
    '{document} fullscreenchange': function fullscreenChange(el, ev) {
      // I2-5027 Firefox v62 and later defines a srcElement on the event,
      // but it is the document rather than the videoWrapper
      if (ev.srcElement === this.viewModel.attr('videoWrapper')
        || (ev.srcElement === document && !document.fullscreenElement)) {
        const outOfSync = this.viewModel.attr('isFullscreen') !== !!document.fullscreenElement;
        if (outOfSync) {
          this.viewModel.attr('isFullscreen', !outOfSync);
        }
      } else if (!ev.srcElement || isIE11()) {
        // For pre-Firefox 62, as well as any browser not supporting event.srcElement
        this.viewModel.attr('isFullscreen', !!document.fullscreenElement);
      }
      // Stop streaming if user paused before collapsing. Since browsers auto-pause video
      // during fullscreen transitions, use ready state to determine when transition is complete
      if (this.viewModel.attr('video')
        && this.viewModel.attr('video').paused
        && !document.fullscreenElement
        && this.viewModel.attr('video').readyState > 1) {
        this.viewModel.stopStreaming();
      }
    },
  },
});
