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

import 'can-map-define';
import 'can-construct-super';
import canDev from 'can-util/js/dev/';
import canMap from 'can-map';
import canList from 'can-list';
import Errors from 'i2web/plugins/errors';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import getAppState from 'i2web/plugins/get-app-state';
import Notifications from 'i2web/plugins/notifications';
import Place from 'i2web/models/place';
import PlaceService from 'i2web/models/service/PlaceService';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import SidePanel from 'i2web/plugins/side-panel';
import view from './edit-address.stache';
import _find from 'lodash/find';

/**
 * @module {canMap} i2web/components/form/edit-address Edit Address
 * @parent i2web/components/form
 * @description Edit address form
 */
export const SuggestedAddress = canMap.extend('SuggestedAddress', {
  define: {
    /**
     * @property {string} formattedName
     * @parent i2web/components/form/edit-address
     * @description Formatted address displayed next to radio button
     */
    formattedName: {
      get() {
        if (this.attr('displayName')) {
          return this.attr('displayName');
        }
        const line1 = this.attr('line1');
        const line2 = this.attr('line2');
        const city = this.attr('city');
        const state = this.attr('state');
        const zip = this.attr('zip');
        return `${line1}<br>${line2 ? `${line2}<br/>` : ''}${city}, ${state} ${zip}`;
      },
    },
  },
});

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {boolean} allowRemovePlace
     * @parent i2web/components/form/edit-address
     * @description Indicates if the place can be removed as part of the operation associated with this edit panel.
     */
    allowRemovePlace: {
      type: 'boolean',
      value: false,
    },
    /*
     * @property {canMap} constraints
     * @parent i2web/components/form/edit-address
     *
     * @description Form validation constraints
     */
    constraints: {
      value: {
        'formPlace.place:name': {
          presence: true,
        },
        'formPlace.place:streetAddress1': {
          presence: true,
        },
        'formPlace.place:city': {
          presence: true,
        },
        'formPlace.place:state': {
          presence: true,
        },
        'formPlace.place:zipCode': {
          presence: true,
          length: {
            minimum: 5,
            message: 'is too short',
          },
        },
      },
    },
    /**
     * @property {string} description
     * @parent i2web/components/form/edit-address
     * @description Main form description string displayed below the heeader.
     */
    description: {
      value: 'Follow the steps below to update and verify your address.',
    },
    /**
     * @property {boolean} disableValidateButton
     * @parent i2web/components/form/edit-address
     * @description Whether to disable the validate button
     */
    enableValidateButton: {
      get() {
        // bind on _changed so this recomputes
        this.attr('_changed').attr();
        return !this.attr('hasValidatedOnce') || this.hasChanges(this.attr('addressFields'));
      },
    },
    /**
     * @property {boolean} formCompleted
     * @parent i2web/components/form/edit-address
     * @description Indicates if form is ready to be saved
     */
    formCompleted: {
      get() {
        if (this.attr('promonitoringSettings')) return this.attr('isResidential');
        if (this.attr('selectedAddress') && this.attr('selectedAddress') === this.attr('userEnteredAddressSuggestion')) return this.attr('formPlace.place:tzId');
        return !!this.attr('selectedAddress');
      },
    },
    /**
     * @property {Place} formPlace
     * @parent i2web/components/form/edit-address
     * @description A clone of the passed in place model to be used in the view,
     * that way we don't pollute the model if we don't save.
     */
    formPlace: {
      Type: Place,
    },
    /**
     * @property {string} header
     * @parent i2web/components/form/edit-address
     * @description Main form header string.
     */
    header: {
      type: 'string',
    },
    /**
     * @property {string} headerString
     * @parent i2web/components/form/edit-address
     * @description Main form header string.
     */
    headerString: {
      get() {
        if (this.attr('header')) {
          return this.attr('header');
        } else if (this.attr('promonitoringSettings')) {
          return 'Update Your Address';
        }
        return 'Edit Place Information';
      },
    },
    /**
     * @property {boolean} isResidential
     * @parent i2web/components/form/edit-address
     * @description Indicates if the user has confirmed the address as a residence.
     */
    isResidential: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Function} onCreatePlaceCallback
     * @parent i2web/components/pairing/reset/modal
     * @description Callback for save; used when adding a new place
     */
    onCreatePlaceCallback: {},
    /**
     * @property {Place} place
     * @parent i2web/components/form/edit-address
     */
    place: {
      Type: Place,
      set(place, setVal) {
        if (place) {
          setVal(place);
          this.attr('formPlace', place.clone());
        }
        this.removeAttr('validateError');
        this.removeAttr('formError');
        this.removeAttr('selectedAddress');
        this.removeAttr('suggestions');

        // load timezones
        if (!this.attr('timezones')) {
          PlaceService.ListTimezones().then(({ timezones }) => {
            this.attr('timezones', timezones);
          }).catch(e => Errors.log(e, true));
        }
      },
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/components/form/edit-address
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
      set(settings) {
        this.removeAttr('validateError');
        this.removeAttr('formError');
        this.removeAttr('selectedAddress');
        this.removeAttr('suggestions');
        return settings;
      },
    },
    /**
     * @property {string} saveButtonLabel
     * @parent i2web/components/form/edit-address
     * @description Save button label; defaults to 'Save'.
     */
    saveButtonLabel: {
      value: 'Save',
    },
    /**
     * @property {canMap} selectedAddress
     * @parent i2web/components/form/edit-address
     * @description Valid street address, set when user selects
     * from the list of suggestions that are valid for the pro monitoring system.
     */
    selectedAddress: {
      Type: canMap,
    },
    /**
     * @property {HtmlBoolean} showPlaceName
     * @parent i2web/components/form/edit-address
     * @description Indicates if user should be able to edit the place name in this form.
     */
    showPlaceName: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {string} subheaderStep1
     * @parent i2web/components/form/edit-address
     * @description Step 1 subheader string; defaults to 'Step 1: Edit Your Address'.
     */
    subheaderStep1: {
      value: 'Step 1: Edit Your Address',
    },
    /**
     * @property {string} subheaderStep2
     * @parent i2web/components/form/edit-address
     * @description Step 2 subheader string; defaults to 'Step 2: Verification Check'.
     */
    subheaderStep2: {
      value: 'Step 2: Verification Check',
    },
    /**
     * @property {string} subheaderStep3
     * @parent i2web/components/form/edit-address
     * @description Step 3 subheader string; defaults to 'Step 3: Select an Address'.
     */
    subheaderStep3: {
      value: 'Step 3: Select an Address',
    },
    /**
     * @property {canMap} suggestions
     * @parent i2web/components/form/edit-address
     * @description List of suggested addresses, provided by the platform, that have a valid format for the
     * pro monitoring system.
     */
    suggestions: {
      Type: SuggestedAddress.List,
    },
    /**
     * @property {CanList} timezones
     * @parent i2web/components/form/edit-address
     * @description Available timezones
     */
    timezones: {
      Type: canList,
    },
    /**
     * @property {Object} userEnteredAddress
     * @parent i2web/components/form/edit-address
     * @description User entered address
     */
    userEnteredAddress: {
      get() {
        return {
          line1: this.attr('formPlace.place:streetAddress1'),
          line2: this.attr('formPlace.place:streetAddress2'),
          city: this.attr('formPlace.place:city'),
          state: this.attr('formPlace.place:state'),
          zip: this.attr('formPlace.place:zipCode'),
        };
      },
    },
    /**
     * @property {SuggestedAddress} userEnteredAddressSuggestion
     * @parent i2web/components/form/edit-address
     * @description User entered address modeled as a suggestion
     */
    userEnteredAddressSuggestion: {
      Type: SuggestedAddress,
    },
  },
  /**
   * @property {Array} addressFields
   * @parent i2web/components/form/edit-address
   * @description Address-specific fields
   */
  addressFields: [
    'formPlace.place:streetAddress1',
    'formPlace.place:streetAddress2',
    'formPlace.place:city',
    'formPlace.place:state',
    'formPlace.place:zipCode',
  ],
  /**
   * @property {boolean} hasValidatedOnce
   * @parent i2web/components/form/edit-address
   * @description Indicates whether validation has been run before
   */
  hasValidatedOnce: false,
  /**
   * @property {boolean} saving
   * @parent i2web/components/form/edit-address
   * @description  Indicates whether the form is being saved
   */
  saving: false,
  /**
   * @property {string} validateError
   * @parent i2web/components/form/edit-address
   * @description Validation error
   */
  validateError: '',
  /**
   * @property {boolean} validating
   * @parent i2web/components/form/edit-address
   * @description  Indicates whether the address is being validated
   */
  validating: false,
  /**
   * @function clearSuggestions
   * @param address
   * @parent i2web/components/form/edit-address
   * @description Clears the suggestions and other related info
   */
  clearSuggestions() {
    this.removeAttr('suggestions');
    this.removeAttr('selectedAddress');
    this.attr('isResidential', false);
  },
  /**
   * @function isAddressSelected
   * @param address
   * @parent i2web/components/form/edit-address
   * @description Determines if the given address is selected in the list of suggestions.
   */
  isAddressSelected(address) {
    return this.attr('selectedAddress') === address;
  },
  /**
   * @function save
   * @parent i2web/components/form/edit-address
   * @param vm
   * @param el
   * @param ev
   * @description Called when the user presses the Save/Next button to either add new place or save existing place
   */
  save(vm, el, ev) {
    ev.preventDefault();

    if (!this.attr('formCompleted')) {
      ev.stopPropagation();
      return;
    }

    this.attr('saving', true);

    if (this.attr('onCreatePlaceCallback')) {
      this.attr('onCreatePlaceCallback')(this.attr('formPlace').attr());
      return;
    }

    this.savePlace();
  },
  /**
   * @function savePlace
   * @parent i2web/components/form/edit-address
   * @description Saves the address and optionally, timezone, to an existing place
   */
  savePlace() {
    const address = {
      line1: this.attr('selectedAddress').line1,
      line2: this.attr('selectedAddress').line2,
      city: this.attr('selectedAddress').city,
      state: this.attr('selectedAddress').state,
      zip: this.attr('selectedAddress').zip,
    };

    let scope = this.attr('formPlace');
    const params = [address];
    if (this.attr('promonitoringSettings')) {
      scope = this.attr('promonitoringSettings');
      params.push(true);
    }

    let selectedTimezoneId;
    if (this.attr('selectedAddress') === this.attr('userEnteredAddressSuggestion')) {
      const selectedTimezone = _find(this.attr('timezones'), (timezone) => {
        return timezone.id === scope.attr('place:tzId');
      });
      selectedTimezoneId = selectedTimezone.id;
    }

    const notifyIfPromon = () => {
      if (this.attr('promonitoringSettings')) {
        Notifications.warning(`An alarm permit ${this.attr('promonitoringSettings.promon:permitRequired') ? 'is' : 'may be'} required. Please check with your local municipality for details.`);
      }
    };

    const updateName = (place, name) => {
      place.attr('place:name', name);
    };

    const updateTimezone = (timezoneId, place) => {
      if (timezoneId) {
        place.attr('place:tzId', timezoneId);
      }
    };

    const savePlace = (place) => {
      place.save().then(() => {
        this.attr('saving', false);
        notifyIfPromon.call(this);
        this.closePanel();
      }).catch((e) => {
        Errors.log(e);
        notifyIfPromon.call(this);
        this.closePanel();
      });
    };

    scope.UpdateAddress(...params).then(() => {
      if (this.attr('place.base:id') !== getAppState().attr('placeId')) {
        // refresh the current place
        Place.get({ 'base:address': this.attr('place.base:address') }).then((place) => {
          this.attr('place', place);
          updateName(this.attr('place'), scope.attr('place:name'));
          updateTimezone(selectedTimezoneId, this.attr('place'));
          savePlace(this.attr('place'));
        }).catch((e) => {
          Errors.log(e);
          this.closePanel();
        });
      } else {
        updateName(this.attr('place'), scope.attr('place:name'));
        updateTimezone(selectedTimezoneId, this.attr('place'));
        savePlace(this.attr('place'));
      }
    }).catch((e) => {
      canDev.warn(e.message);
      this.attr('saving', false);
      if (e.code === 'promonitoring.address.unavailable') {
        this.attr('formError', `Professional Monitoring is not currently offered at this address.
          ${this.attr('place').attr('isPromon') ? ' To continue, first go to the Settings/Profile page to update your Service Plan and then change your address.' : ''}`);
      } else if (e.code === 'promonitoring.address.invalid') {
        this.attr('formError', 'This address cannot be verified. Please update your address and try again.');
      } else if (e.code === 'promonitoring.address.unsupported') {
        this.attr('formError', 'Please confirm this address is a residential property.');
      } else if (e.code === 'promonitoring.address.unserviceable') {
        this.attr('formError', 'There are no registered agencies who will dispatch emergency responders to this address through the Professional Monitoring system.');
      } else {
        this.attr('formError', 'An error occurred updating your address. Please try again.');
      }
    });
  },
  /**
   * @function selectAddress
   * @param address
   * @parent i2web/components/form/edit-address
   * @description Sets the selectedAddress attribute using the one chosen from the list of suggestions.
   */
  selectAddress(address) {
    this.attr('selectedAddress', address);
    this.attr('isResidential', false);
  },
  /**
   * @function showRemovePlace
   * @parent i2web/components/form/edit-address
   * @description Click handler for the Remove Place button.
   */
  showRemovePlace() {
    SidePanel.right(`{{close-button type="cancel"}} <arcus-settings-remove-place {(place)}="place" {(person)}="person" />`, {
      place: this.compute('place'),
      person: getAppState().attr('person'),
    });
  },
  /**
   * @function validateAddress
   * @parent i2web/components/form/edit-address
   * @description Determines if the entered address is fully valid. If not, will update suggested addresses.
   */
  validateAddress(vm, el, ev) {
    ev.preventDefault();

    this.attr('validateError', '');
    this.clearSuggestions();

    if (!this.formValidates(this.attr('addressFields'))) {
      return;
    }

    this.attr('validating', true);
    let validator = PlaceService;
    let scope = this.attr('place');
    const params = [this.attr('place.base:id'), this.attr('userEnteredAddress')];
    if (this.attr('promonitoringSettings')) {
      validator = this.attr('promonitoringSettings');
      scope = validator;
      params.shift();
    }
    validator.ValidateAddress.apply(scope, params).then(({ suggestions }) => {
      this.attr('validating', false);
      this.attr('hasValidatedOnce', true);
      this.resetChanged();
      if (!this.attr('promonitoringSettings')) {
        this.attr('userEnteredAddressSuggestion', new SuggestedAddress(Object.assign({}, this.attr('userEnteredAddress'), {
          displayName: 'Use the address that I manually entered.',
        })));
        suggestions.push(this.attr('userEnteredAddressSuggestion'));
      }

      // set the suggestions - if there is only one, also select it
      this.attr('suggestions', suggestions);
      if (suggestions.length === 1) {
        this.attr('selectedAddress', this.attr('suggestions.0'));
      }
    }).catch((e) => {
      this.attr('validating', false);
      if (e.code === 'promonitoring.address.unavailable') {
        this.attr('validateError', 'Professional Monitoring is not available at this address.');
      } else {
        this.attr('validateError', 'The address cannot be saved and/or verified. Please ensure your address is correct and try again.');
      }
    });
  },
});

export default FormComponent.extend({
  tag: 'arcus-form-edit-address',
  viewModel: ViewModel,
  view,
});
