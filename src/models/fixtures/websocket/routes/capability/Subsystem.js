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

/* eslint comma-dangle: 0 */
/* eslint quotes: 0 */
/* eslint quote-props: 0 */
/* eslint semi: 0 */

export default {
  'subs:ListHistoryEntries': function subsListHistoryEntries(params) { // eslint-disable-line
    return {
      messageType: 'subs:ListHistoryEntriesResponse',
      attributes: {
        results: [],
      },
    };
  },
  'subcare:ListBehaviorTemplates': function subcareListBehaviorTemplates() {
    return {
      messageType: 'subcare:ListBehaviorTemplatesResponse',
      attributes: {
        behaviorTemplates: [
          {
            "timeWindowSupport": "REQUIRED",
            "fieldUnits": {
              "duration": "MINUTES",
              "timeWindows": null,
              "devices": null
            },
            "name": "No Activity Detected",
            "availableDevices": [
            ],
            "fieldLabels": {
              "duration": "No Activity For...",
              "timeWindows": "Days & Times To Monitor",
              "devices": "Participating Devices"
            },
            "fieldDescriptions": {
              "duration": "Trigger the alarm when no activity is detected for a period of time.",
              "timeWindows": "Choose when you want to monitor for lack of activity.",
              "devices": "Choose the devices that will trigger a Care Alarm when no activity is detected."
            },
            "description": "Use contact and motion sensors to trigger an alarm if no activity occurs at times when you normally expect movement.",
            "id": "1",
            "fieldValues": {
              "duration": "30,60,120,180,240,300",
              "timeWindows": null,
              "devices": null
            },
            "type": "INACTIVITY"
          },
          {
            "timeWindowSupport": "REQUIRED",
            "fieldUnits": {
              "timeWindows": null,
              "devices": null
            },
            "name": "Door Opened Unexpectedly",
            "availableDevices": [
              "DRIV:dev:ec3a24d2-83be-490c-8dd8-7b060865cc83",
              "DRIV:dev:c0e64847-7919-4265-82b9-76dee5befd6e",
              "DRIV:dev:6aff7fa7-b5ed-4bdc-ba65-d473c59a087e",
              "DRIV:dev:d924939f-4be2-4a52-bb08-3795d477ef19",
              "DRIV:dev:ba0b8eb6-bb36-4f74-812a-a0e9207c3ad3",
              "DRIV:dev:ac66bef9-aeac-43d0-b56c-35a79e86e71f",
              "DRIV:dev:c35d9572-02d4-4ad6-a3eb-05aabd13a294",
              "DRIV:dev:401ace82-6fc4-48aa-aed5-80e2faaaa490"
            ],
            "fieldLabels": {
              "timeWindows": "Days & Times To Monitor",
              "devices": "Participating Doors"
            },
            "fieldDescriptions": {
              "timeWindows": "Choose when you want to monitor for opened doors.",
              "devices": "Choose the devices that will trigger a Care Alarm when they are opened."
            },
            "description": "Place contact sensors on entry doors to trigger an alarm if loved ones open a door at times you wouldn't expect.",
            "id": "2",
            "fieldValues": {
              "timeWindows": null,
              "devices": null
            },
            "type": "OPEN"
          },
          {
            "timeWindowSupport": "REQUIRED",
            "fieldUnits": {
              "duration": "MINUTES",
              "timeWindows": null,
              "devices": null
            },
            "name": "Door Left Open",
            "availableDevices": [
              "DRIV:dev:ec3a24d2-83be-490c-8dd8-7b060865cc83",
              "DRIV:dev:c0e64847-7919-4265-82b9-76dee5befd6e",
              "DRIV:dev:6aff7fa7-b5ed-4bdc-ba65-d473c59a087e",
              "DRIV:dev:d924939f-4be2-4a52-bb08-3795d477ef19",
              "DRIV:dev:ba0b8eb6-bb36-4f74-812a-a0e9207c3ad3",
              "DRIV:dev:ac66bef9-aeac-43d0-b56c-35a79e86e71f",
              "DRIV:dev:c35d9572-02d4-4ad6-a3eb-05aabd13a294",
              "DRIV:dev:401ace82-6fc4-48aa-aed5-80e2faaaa490"
            ],
            "fieldLabels": {
              "duration": "Left Open For...",
              "timeWindows": "Days & Times To Monitor",
              "devices": "Participating Devices"
            },
            "fieldDescriptions": {
              "duration": "Choose the amount of time that a door left open will trigger an alarm.",
              "timeWindows": "Choose when you want to monitor for a door left open.",
              "devices": "Choose the devices that will trigger a Care Alarm when they are left open."
            },
            "description": "Trigger an alarm if loved ones leave a door open for a period of time.",
            "id": "3",
            "fieldValues": {
              "duration": "30,60,120,180,240,300",
              "timeWindows": null,
              "devices": null
            },
            "type": "OPEN"
          },
          {
            "timeWindowSupport": "NONE",
            "fieldUnits": {
              "duration": "DAYS",
              "devices": null
            },
            "name": "Medicine Cabinet Reminder",
            "availableDevices": [
              "DRIV:dev:ec3a24d2-83be-490c-8dd8-7b060865cc83",
              "DRIV:dev:c0e64847-7919-4265-82b9-76dee5befd6e",
              "DRIV:dev:6aff7fa7-b5ed-4bdc-ba65-d473c59a087e",
              "DRIV:dev:d924939f-4be2-4a52-bb08-3795d477ef19",
              "DRIV:dev:ba0b8eb6-bb36-4f74-812a-a0e9207c3ad3",
              "DRIV:dev:ac66bef9-aeac-43d0-b56c-35a79e86e71f",
              "DRIV:dev:c35d9572-02d4-4ad6-a3eb-05aabd13a294",
              "DRIV:dev:401ace82-6fc4-48aa-aed5-80e2faaaa490"
            ],
            "fieldLabels": {
              "duration": "Not Opened For...",
              "devices": "Participating Devices"
            },
            "fieldDescriptions": {
              "duration": "Choose the amount of time that a cabinet is not opened before triggering an alarm.",
              "devices": "Choose the devices that will trigger a Care Alarm when they are not opened."
            },
            "description": "Place contact sensors on the medicine cabinet to feel more confident that loved ones have taken their medicine.",
            "id": "4",
            "fieldValues": {
              "duration": "1,2,3,4,5",
              "devices": null
            },
            "type": "INACTIVITY"
          },
          {
            "timeWindowSupport": "NONE",
            "fieldUnits": {
              "duration": "DAYS",
              "devices": null
            },
            "name": "Eating Reminder",
            "availableDevices": [
              "DRIV:dev:ec3a24d2-83be-490c-8dd8-7b060865cc83",
              "DRIV:dev:c0e64847-7919-4265-82b9-76dee5befd6e",
              "DRIV:dev:6aff7fa7-b5ed-4bdc-ba65-d473c59a087e",
              "DRIV:dev:d924939f-4be2-4a52-bb08-3795d477ef19",
              "DRIV:dev:ba0b8eb6-bb36-4f74-812a-a0e9207c3ad3",
              "DRIV:dev:ac66bef9-aeac-43d0-b56c-35a79e86e71f",
              "DRIV:dev:c35d9572-02d4-4ad6-a3eb-05aabd13a294",
              "DRIV:dev:401ace82-6fc4-48aa-aed5-80e2faaaa490"
            ],
            "fieldLabels": {
              "duration": "Not Opened For...",
              "devices": "Participating Devices"
            },
            "fieldDescriptions": {
              "duration": "Choose the amount of time that a device is not opened before triggering the alarm.",
              "devices": "Choose the devices that will trigger a Care Alarm when they are not opened."
            },
            "description": "Place contact sensors on the refrigerator and kitchen cabinets to know if loved ones have not eaten.",
            "id": "5",
            "fieldValues": {
              "duration": "1,2,3",
              "devices": null
            },
            "type": "INACTIVITY"
          },
          {
            "timeWindowSupport": "REQUIRED",
            "fieldUnits": {
              "timeWindows": "NODURATION",
              "devices": null
            },
            "name": "Curfew",
            "availableDevices": [
              "DRIV:dev:52c115f3-0417-4cc5-a765-d99172c84278",
              "DRIV:dev:4371988f-08e0-409a-908a-82a23cc39a8d",
              "DRIV:dev:c5fb7dd6-6650-4747-b268-bb264ca3a471",
              "DRIV:dev:2dec2d91-c25d-41cb-9e38-507c059b8daa"
            ],
            "fieldLabels": {
              "timeWindows": "Curfew Time",
              "devices": "Participating Devices"
            },
            "fieldDescriptions": {
              "timeWindows": "Choose what time you want to check to see if a loved one is home.",
              "devices": "Choose the devices that will trigger a Care Alarm when they are not home."
            },
            "description": "Trigger a Care Alarm when a loved one is not home by a certain time.",
            "id": "6",
            "fieldValues": {
              "timeWindows": null,
              "devices": null
            },
            "type": "PRESENCE"
          },
          {
            "timeWindowSupport": "NONE",
            "fieldUnits": {
              "devices": null
            },
            "name": "Monitor Memory Habits",
            "availableDevices": [
              "DRIV:dev:ec3a24d2-83be-490c-8dd8-7b060865cc83",
              "DRIV:dev:c0e64847-7919-4265-82b9-76dee5befd6e",
              "DRIV:dev:6aff7fa7-b5ed-4bdc-ba65-d473c59a087e",
              "DRIV:dev:d924939f-4be2-4a52-bb08-3795d477ef19",
              "DRIV:dev:ba0b8eb6-bb36-4f74-812a-a0e9207c3ad3",
              "DRIV:dev:ac66bef9-aeac-43d0-b56c-35a79e86e71f",
              "DRIV:dev:c35d9572-02d4-4ad6-a3eb-05aabd13a294",
              "DRIV:dev:401ace82-6fc4-48aa-aed5-80e2faaaa490"
            ],
            "fieldLabels": {
              "devices": "Participating Devices"
            },
            "fieldDescriptions": {
              "devices": "Choose the devices and maximum number of times they are opened daily before triggering the alarm."
            },
            "description": "Trigger a Care Alarm when a contact sensor is opened more than normal on a daily basis.",
            "id": "7",
            "fieldValues": {
              "devices": null
            },
            "type": "OPEN_COUNT"
          },
          {
            "timeWindowSupport": "NONE",
            "fieldUnits": {
              "devices": null,
              "lowTemp": "fahrenheit",
              "highTemp": "fahrenheit"
            },
            "name": "Monitor Home Temperature",
            "availableDevices": [
              "DRIV:dev:ecd74684-d0f0-49e0-abeb-2be3480fdf67",
              "DRIV:dev:3a6003d5-ddfa-4987-801e-a109812505cd",
              "DRIV:dev:6aff7fa7-b5ed-4bdc-ba65-d473c59a087e",
              "DRIV:dev:305745f9-fb10-46b0-a23f-ba35efa70db1",
              "DRIV:dev:b9a55fee-c80b-4329-8fc7-5219cb8b3c41",
              "DRIV:dev:586cbd4e-7150-4183-ac70-697fae89418b",
              "DRIV:dev:e0f27918-e9dd-4d21-9372-30846f5c9ef8",
              "DRIV:dev:5333805f-275c-4e5b-a959-c213a98f0449",
              "DRIV:dev:401ace82-6fc4-48aa-aed5-80e2faaaa490",
              "DRIV:dev:ec3a24d2-83be-490c-8dd8-7b060865cc83",
              "DRIV:dev:c0e64847-7919-4265-82b9-76dee5befd6e",
              "DRIV:dev:aa32899b-6a40-4ca7-950c-f17ee4c68d69",
              "DRIV:dev:33f64f3a-7243-4a32-8b22-e672adb12040",
              "DRIV:dev:515feaf4-2e3a-4db2-832b-ff7150d0adae",
              "DRIV:dev:61fae729-e362-4a71-8c35-6f2cc755d5e6",
              "DRIV:dev:75108066-4707-4325-b0c9-db51e1377108",
              "DRIV:dev:ba0b8eb6-bb36-4f74-812a-a0e9207c3ad3",
              "DRIV:dev:ac66bef9-aeac-43d0-b56c-35a79e86e71f",
              "DRIV:dev:c35d9572-02d4-4ad6-a3eb-05aabd13a294",
              "DRIV:dev:b37c81b9-17b3-4bf0-9070-b08bc8b77f91"
            ],
            "fieldLabels": {
              "devices": "Participating Devices",
              "lowTemp": "Choose a low temperature",
              "highTemp": "Choose a high temperature"
            },
            "fieldDescriptions": {
              "devices": "Choose the devices that you want to monitor temperature.",
              "lowTemp": "",
              "highTemp": ""
            },
            "description": "Trigger a Care Alarm when the home is too hot or too cold.",
            "id": "8",
            "fieldValues": {
              "devices": null,
              "lowTemp": "20-105",
              "highTemp": "20-105"
            },
            "type": "TEMPERATURE"
          }
        ],
      }
    }
  }
};
